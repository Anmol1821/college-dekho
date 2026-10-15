"""
AI search engine for Govt Drish.

Powers three endpoints with ONE brain:
  - POST /api/ai-search/        -> AI answer + matching colleges/scholarships
  - POST /api/voice-counselor/  -> spoken version of the same answer
  - (the frontend search page and the scholarship sniper both call ai-search)

It uses the SAME Google Gemini setup as the website chatbot:
  model  = gemini-3.1-flash-lite
  tool   = Google Search grounding (so answers are live: NIRF ranks,
           cutoffs, scholarship deadlines/amounts), with an automatic
           retry without tools when grounding is not available (e.g.
           free-tier quota), and finally a local keyword fallback so
           the feature never hard-fails.

Everything here is stdlib + Django (no new pip dependencies).
"""
from __future__ import annotations

import hashlib
import json
import re
import urllib.error
import urllib.request

from django.conf import settings as django_settings
from django.core.cache import cache
from django.db.models import Q

GEMINI_MODEL = "gemini-3.1-flash-lite"
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

# Reuse an AI answer for the same (mode, language, query) for this long so a
# page refresh or another visitor does NOT spend another Gemini credit.
# Override with AI_SEARCH_CACHE_SECONDS in settings/.env.
DEFAULT_AI_CACHE_SECONDS = 60 * 30

_DEVANAGARI = re.compile(r"[\u0900-\u097F]")

_SCHOLARSHIP_WORDS = (
    "scholarship", "scholarships", "waiver", "stipend", "money",
    "financial", "aid", "grant", "income",
    "छात्रवृत्ति", "पैसे", "स्कॉलरशिप",
)
_COLLEGE_WORDS = (
    "college", "colleges", "institute", "university", "admission", "admissions",
    "course", "courses", "branch", "placement", "nirf", "ranking", "rank",
    "counselling", "counseling", "seat", "jee", "neet", "exam", "best", "top",
    "कॉलेज", "विश्वविद्यालय", "प्रवेश", "कोर्स",
)

_STOPWORDS = {
    "a", "an", "the", "in", "on", "of", "for", "to", "and", "or", "my", "i",
    "me", "is", "are", "with", "at", "by", "from", "ka", "ki", "ke", "hai",
    "kya", "kya", "me", "mera", " mujhe", "koi", "batao", "bata", "do",
    "please", "kaun", "sa", "se", "mein", "me", "ho", "kaise", "konsa",
}

# The Govt Drish test-series site the AI always points students to.
TEST_SERIES_URL = "https://preparation.govtdrish.com"

# Per-page AI behaviour. Each page of the site (Colleges, Exams, Courses,
# Scholarships, Test Series) sends a `mode`; the block below is injected into
# the system prompt so the SAME brain answers correctly for that page.
PAGE_MODES: dict[str, str] = {
    "general": "",
    "colleges": """PAGE MODE: College discovery.
- Show a MIX of colleges across fields and institute types: engineering (IIT, NIT, BIT), medical (AIIMS, NMCH, PMCH), law (NLU), central universities (DU, BHU) and other state/government colleges.
- When the student names a stream/field/state ("medical", "law in Bihar", "engineering in Jharkhand"), recommend the best-fit colleges from the Govt Drish database first, then at most 1-2 well-known genuine alternatives.
- For every college you name, include: name, city, ownership (Govt/Pvt), NIRF rank and one key course. Finish by telling the student to open a college profile for cutoffs and course-wise fees.""",
    "exams": """PAGE MODE: Entrance exams and the admission path.
- Explain WHICH entrance exam grants admission WHERE. Examples: JEE Advanced -> IITs; JEE Main -> NITs/IIITs/GFTIs; NEET UG -> AIIMS, NMCH, PMCH and other government/private medical colleges; CUET UG -> DU, BHU and other central universities; CLAT -> NLUs; CAT -> IIMs/MBA; CUET PG / university entrance -> PG courses.
- For each exam give: who conducts it, who is eligible, roughly when it is held, and which Govt Drish colleges accept it.
- If the student asks "which exam for <college>", answer with the exam name in one line first, then the full path. Never invent cutoffs — say which year to verify.""",
    "courses": """PAGE MODE: Courses and programmes.
- Tell the student WHICH courses/degrees they can pursue and WHICH colleges offer them.
- Group by stream: Engineering (B.Tech CSE/ECE/ME/Civil), Medical (MBBS/BDS/BAMS/BHMS), Commerce (B.Com/BBA), Science (B.Sc), Arts (BA), Law (BA LLB/LLB), Management (BBA/MBA).
- Use the database college->course list provided for specific colleges. If the student names a college, list that college's courses with duration and fees.""",
    "scholarships": """PAGE MODE: Scholarships, fee waivers and financial aid.
- Use LIVE Google Search to find currently-open schemes: national (NSP, PMSS, Post-Matric), state schemes and private/NGO scholarships, plus tuition-fee waivers and full fee waivers.
- Explicitly cover special categories: SC/ST/OBC/EWS/minority/girls/PwD, AND wards of defence personnel / army / ex-servicemen (e.g. Army Welfare Education Society, defence quota fee concessions).
- For each scheme give: name, eligibility, benefit amount, deadline (with the year) and the official portal. Always tell the student to verify on the official portal.""",
    "test_series": f"""PAGE MODE: Practice and mock tests.
- Recommend the Govt Drish free Test Series at {TEST_SERIES_URL} and tell the student which exam-level mocks to start with.
- Keep it short and motivating, at most 3 sentences.
- ALWAYS include the exact link {TEST_SERIES_URL} in the reply.""",
}


def get_mode_instructions(mode: str) -> str:
    return PAGE_MODES.get(mode or "general", "")


# --------------------------------------------------------------------------
# Language helpers
# --------------------------------------------------------------------------

def detect_lang(text: str, lang: str = "auto") -> str:
    """Return 'hi' or 'en'. Explicit request wins, else Devanagari detection."""
    if lang in ("hi", "en"):
        return lang
    return "hi" if _DEVANAGARI.search(text or "") else "en"


def _tokens(text: str) -> list[str]:
    return [
        token
        for token in re.findall(r"[a-z0-9]+", (text or "").lower())
        if token not in _STOPWORDS and len(token) > 1
    ]


# --------------------------------------------------------------------------
# Local (database) matching — always runs, also used as the AI fallback
# --------------------------------------------------------------------------

def local_college_search(query: str, limit: int = 8) -> list:
    from .models import College

    colleges = list(College.objects.all())
    if not colleges:
        return []

    q = (query or "").lower()
    tokens = _tokens(query)
    if not tokens:
        return sorted(colleges, key=lambda c: c.nirf_rank)[:limit]

    wants_best = any(t in ("best", "top", "nirf", "ranking", "rank") for t in tokens)

    scored: list[tuple[float, object]] = []
    for college in colleges:
        course_names = " ".join(c.name for c in college.courses.all())
        haystack = (
            f"{college.name} {college.city} {college.state} "
            f"{college.ownership_type} {course_names}"
        ).lower()
        score = sum(10 for token in tokens if token in haystack)
        if college.state.lower() in q:
            score += 25
        if college.city.lower() in q:
            score += 30
        if wants_best:
            score += max(0.0, 20.0 - college.nirf_rank) / 5.0
        scored.append((score, college))

    scored.sort(key=lambda pair: (-pair[0], pair[1].nirf_rank))
    matched = [college for score, college in scored if score > 0]
    if not matched and (wants_best or any(word in q for word in _COLLEGE_WORDS)):
        # College-ish query with no exact DB hit ("best MBA college"):
        # fall back to best-ranked so the UI still has cards to show next
        # to the AI answer. Small talk ("hello") correctly returns [].
        matched = sorted(colleges, key=lambda c: c.nirf_rank)
    return matched[:limit]


def local_scholarship_search(
    query: str = "",
    profile: dict | None = None,
    limit: int = 8,
) -> list:
    from .models import Scholarship

    profile = profile or {}
    results = Scholarship.objects.all()

    category = str(profile.get("category") or "").strip()
    state = str(profile.get("state") or "").strip()
    income_raw = profile.get("income")

    if category:
        results = results.filter(
            Q(eligible_category__iexact=category) | Q(eligible_category__iexact="All")
        )
    if income_raw not in (None, "", 0, "0"):
        try:
            results = results.filter(max_income__gte=int(income_raw))
        except (TypeError, ValueError):
            pass
    if state:
        results = results.filter(Q(state__iexact=state) | Q(state__iexact="All"))

    scholarships = list(results.order_by("max_income")[:limit])

    if not scholarships and not (category or state or income_raw):
        tokens = _tokens(query)
        if tokens:
            scholarships = [
                scholarship
                for scholarship in Scholarship.objects.all()
                if any(token in scholarship.name.lower() for token in tokens)
            ][:limit]
        if not scholarships:
            scholarships = list(Scholarship.objects.all()[:limit])

    return scholarships


def detect_intent(query: str) -> str:
    """'colleges' | 'scholarships' | 'both' from the free-text query."""
    q = (query or "").lower()
    has_scholarship = any(word in q for word in _SCHOLARSHIP_WORDS)
    has_college = any(word in q for word in _COLLEGE_WORDS)
    if has_scholarship and not has_college:
        return "scholarships"
    if has_scholarship and has_college:
        return "both"
    return "colleges"


# --------------------------------------------------------------------------
# Gemini (same model + Google Search grounding as the website bot)
# --------------------------------------------------------------------------

def _extract_text(payload: dict) -> str:
    try:
        parts = payload["candidates"][0]["content"]["parts"]
    except (KeyError, IndexError, TypeError):
        return ""
    return "".join(part.get("text", "") for part in parts).strip()


def call_gemini(system_prompt: str, user_prompt: str, timeout: int = 12) -> str | None:
    """Call Gemini with Google Search grounding, then retry without tools."""
    api_key = getattr(django_settings, "GEMINI_API_KEY", "")
    if not api_key:
        return None

    url = f"{GEMINI_BASE_URL}/{GEMINI_MODEL}:generateContent?key={api_key}"

    # Try dynamic search retrieval first, then the plain search tool, then
    # no tools (free-tier quota often gates the paid grounding feature).
    tool_variants = [
        [
            {
                "google_search_retrieval": {
                    "dynamicRetrievalConfig": {
                        "mode": "MODE_DYNAMIC",
                        "dynamicThreshold": 0.4,
                    }
                }
            }
        ],
        [{"google_search": {}}],
        [],
    ]

    for tools in tool_variants:
        body = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 700},
        }
        if tools:
            body["tools"] = tools

        request = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError:
            # Bad tool/quota for this variant -> try the next one.
            continue
        except Exception:
            # Timeout / DNS / network: do not burn more time, fall back to
            # the local keyword engine.
            return None

        text = _extract_text(payload)
        if text:
            return text

    return None


def _build_system_prompt(language: str, voice: bool, mode: str = "general") -> str:
    if voice:
        language_rule = (
            "Reply in simple HINGLISH (Roman-script Hindi), the way an Indian "
            "counsellor speaks: friendly, spoken, max 2 short sentences."
            if language == "en"
            else "हमेशा सरल हिंदी में जवाब दें, बोलचाल वाली, अधिकतम 2 छोटे वाक्य।"
        )
        style = "This answer will be read ALOUD by text-to-speech: keep it under 2 short sentences, no markdown, no lists."
    else:
        language_rule = (
            "Always reply in English."
            if language == "en"
            else "हमेशा स्पष्ट हिंदी में उत्तर दें (Devanagari)."
        )
        style = (
            "Format: 2-4 short sentences OR a compact bullet list of at most "
            "4 bullets. Maximum 60 words. No markdown headings."
        )

    mode_block = get_mode_instructions(mode)
    mode_section = f"\n\n{mode_block}" if mode_block else ""

    return f"""You are Govt Drish AI Search, the search intelligence inside Govt Drish \
(India's exam-to-admission platform) used by the website search bar, the voice \
assistant and the scholarship tool.

LANGUAGE (highest priority): {language_rule}

YOUR JOB:
- Answer the student's search directly and practically using LIVE Google Search \
grounding for current facts (NIRF rankings, JEE/NEET/counselling cutoffs, \
scholarship deadlines and amounts, fee revisions). Never invent numbers — if a \
figure is uncertain, say which year/source to verify.
- You are also given JSON results from the Govt Drish database. PREFER those for \
specific recommendations (their links are on the page); you may add 1-2 real, \
well-known alternatives if genuinely useful.
- {style}
- Never state, repeat or guess any phone number. Govt Drish does not publish \
phone numbers; direct contact questions to the on-site enquiry form.
- Never fabricate scholarships or colleges that do not exist.
- Always give ONE concrete next step (open a college profile, apply a filter, \
check a deadline).{mode_section}"""


def _serialize_colleges(colleges: list) -> list[dict]:
    return [
        {
            "id": college.id,
            "name": college.name,
            "slug": college.slug,
            "city": college.city,
            "state": college.state,
            "ownership_type": college.ownership_type,
            "nirf_rank": college.nirf_rank,
            "cutoff_rank": college.cutoff_rank,
            "courses": [
                {"name": course.name, "fees": course.total_fees}
                for course in college.courses.all()[:5]
            ],
        }
        for college in colleges
    ]


def _serialize_scholarships(scholarships: list) -> list[dict]:
    return [
        {
            "name": scholarship.name,
            "category": scholarship.eligible_category,
            "max_income": scholarship.max_income,
            "state": scholarship.state,
            "amount": scholarship.amount,
        }
        for scholarship in scholarships
    ]


# --------------------------------------------------------------------------
# Local reply (used when Gemini is unavailable / unconfigured)
# --------------------------------------------------------------------------

def build_local_reply(
    query: str,
    intent: str,
    colleges: list,
    scholarships: list,
    language: str,
    profile: dict | None = None,
    mode: str = "general",
) -> str:
    q = (query or "").lower()
    hi = language == "hi"
    profile = profile or {}

    # Test-series page: always point to the practice site.
    if mode == "test_series":
        if hi:
            return (
                "तैयारी शुरू करने के लिए Govt Drish की फ्री टेस्ट सीरीज़ देखें: "
                f"{TEST_SERIES_URL} — अपने एग्ज़ाम के मॉक टेस्ट से शुरू करें।"
            )
        return (
            "Start your practice with the free Govt Drish Test Series: "
            f"{TEST_SERIES_URL} — begin with the mock tests for your target exam."
        )

    fee_words = ("fees", "fee", "paise", "cost", "price", "फीस", "पैसे")
    if any(word in q for word in fee_words) and intent == "colleges" and not colleges:
        return (
            "फीस की जानकारी के लिए कृपया कॉलेज का नाम बताइए — मैं उसके कोर्स-वार फीस और "
            "स्कॉलरशिप दिखा दूँगा।"
            if hi
            else "Please tell me the college name for fee details — I will show its course-wise fees and any scholarships you can use."
        )

    if intent in ("colleges", "both") and colleges:
        names = ", ".join(college.name for college in colleges[:3])
        top = colleges[0]
        if mode == "exams":
            intro_en = "These colleges accept the entrance exams you asked about: "
            intro_hi = "आपके बताए एंट्रेंस एग्ज़ाम से इन कॉलेजों में प्रवेश मिलता है: "
        elif mode == "courses":
            intro_en = "You can pursue various courses at these colleges: "
            intro_hi = "इन कॉलेजों में आप ये कोर्स कर सकते हैं: "
        else:
            intro_en = ""
            intro_hi = ""
        if hi:
            reply = (
                f"{intro_hi}आपके लिए {len(colleges)} कॉलेज मिले — {names} सबसे ऊपर है "
                f"({top.city}, NIRF #{top.nirf_rank}). प्रोफ़ाइल खोलकर कट-ऑफ और फीस ज़रूर देखें।"
            )
        else:
            reply = (
                f"{intro_en}Found {len(colleges)} colleges for you — {names} lead the list "
                f"({top.city}, NIRF #{top.nirf_rank}). Open a profile to check cutoff and fees."
            )
        if intent == "both" and scholarships:
            reply += (
                f" साथ ही {len(scholarships)} स्कॉलरशिप मिलीं।"
                if hi
                else f" I also found {len(scholarships)} scholarships for you."
            )
        return reply

    if intent == "scholarships":
        if scholarships:
            first = scholarships[0]
            if hi:
                return (
                    f"आपके प्रोफ़ाइल के लिए {len(scholarships)} स्कॉलरशिप मिलीं — "
                    f"पहली: {first.name} ({first.amount}). पात्रता ज़रूर जाँचें।"
                )
            return (
                f"{len(scholarships)} scholarships match your profile — top match: "
                f"{first.name} ({first.amount}). Check the eligibility before applying."
            )
        if hi:
            return (
                "इस प्रोफ़ाइल से मेल खाती स्कॉलरशिप अभी डेटाबेस में नहीं मिली। "
                "आय या राज्य बदलकर दोबारा देखें, या Google पर ताज़ा डेडलाइन जाँचें।"
            )
        return (
            "No scholarship in our database matches this profile yet. Try changing "
            "the income or state, and always verify live deadlines on the official portal."
        )

    # Generic greeting fallback (keeps the original Hinglish voice feel).
    if hi:
        return (
            "नमस्ते! मैं Govt Drish असिस्टेंट हूँ — कॉलेज, कोर्स या स्कॉलरशिप के बारे में "
            "पूछिए, मैं लाइव जानकारी के साथ जवाब दूँगा।"
        )
    return (
        "Namaste! Ask me about colleges, courses, cutoffs or scholarships — "
        "I answer with live, up-to-date information."
    )


# --------------------------------------------------------------------------
# Public entry point
# --------------------------------------------------------------------------

def _ai_cache_seconds() -> int:
    try:
        return int(getattr(django_settings, "AI_SEARCH_CACHE_SECONDS", DEFAULT_AI_CACHE_SECONDS))
    except (TypeError, ValueError):
        return DEFAULT_AI_CACHE_SECONDS


def _ai_cache_key(mode: str, language: str, query: str) -> str:
    digest = hashlib.sha1(query.strip().lower().encode("utf-8")).hexdigest()
    return f"ai_search:{mode}:{language}:{digest}"


def run_ai_search(
    query: str,
    intent: str = "auto",
    lang: str = "auto",
    profile: dict | None = None,
    voice: bool = False,
    limit: int = 8,
    mode: str = "general",
) -> dict:
    """
    One call = AI answer + local DB matches.

    `mode` scopes the AI to a website section (general|colleges|exams|courses|
    scholarships|test_series) so each page gets the right kind of answer.

    Returns:
        {
          "reply": str, "action": "show_results"|"ask_details",
          "source": "gemini"|"local", "language": "hi"|"en",
          "intent": str, "mode": str, "colleges": [...], "scholarships": [...],
        }
    """
    query = (query or "").strip()
    profile = profile or {}
    language = detect_lang(query, lang)

    if mode not in PAGE_MODES:
        mode = "general"

    # Each page nudges intent: scholarships page -> scholarships, test series
    # page -> short practice answer with the test-series link.
    if mode == "scholarships" and intent == "auto":
        intent = "scholarships"
    if intent not in ("colleges", "scholarships", "both"):
        intent = detect_intent(query)

    colleges: list = []
    scholarships: list = []
    if intent in ("colleges", "both"):
        colleges = local_college_search(query, limit=limit)
    if intent in ("scholarships", "both"):
        scholarships = local_scholarship_search(query, profile=profile, limit=limit)

    reply = None
    source = "local"

    if query:
        cache_key = _ai_cache_key(mode, language, query)
        cached_reply = cache.get(cache_key)
        if cached_reply:
            # Same question asked recently (page reopen / another visitor):
            # reuse the answer so we do NOT spend another Gemini credit.
            reply = cached_reply
            source = "gemini"
        else:
            system_prompt = _build_system_prompt(language, voice=voice, mode=mode)
            user_prompt = (
                f"Search query: {query}\n"
                f"Detected intent: {intent}\n"
                f"Detected language: {language}\n"
            )
            if profile:
                user_prompt += f"Student profile: {json.dumps(profile)}\n"
            user_prompt += (
                "\nGovt Drish database results (prefer these for cards/links):\n"
                f"colleges: {json.dumps(_serialize_colleges(colleges), ensure_ascii=False)}\n"
                f"scholarships: {json.dumps(_serialize_scholarships(scholarships), ensure_ascii=False)}\n"
            )
            reply = call_gemini(system_prompt, user_prompt)
            if reply:
                source = "gemini"
                cache.set(cache_key, reply, _ai_cache_seconds())

    if not reply:
        reply = build_local_reply(
            query, intent, colleges, scholarships, language, profile, mode=mode
        )
        source = "local"

    has_results = bool(colleges or scholarships)
    return {
        "reply": reply,
        "action": "show_results" if has_results else "ask_details",
        "source": source,
        "language": language,
        "intent": intent,
        "mode": mode,
        "colleges": _serialize_colleges(colleges),
        "scholarships": _serialize_scholarships(scholarships),
    }
