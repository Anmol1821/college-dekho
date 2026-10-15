from django.shortcuts import get_object_or_404
from django.conf import settings as django_settings
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai import PAGE_MODES, run_ai_search
from .models import Alumni, College, Course, Lead, Scholarship
from .serializers import (
    AlumniSerializer,
    CollegeCourseSerializer,
    CollegeDetailSerializer,
    CollegeListSerializer,
    LeadSerializer,
    ScholarshipSerializer,
)


def _hometown_matches(college_id: int, city: str, state: str):
    """
    Hometown Engine: verified alumni of the college, exact city match first,
    state match as the fallback.
    Returns (queryset, match_type) where match_type is 'City' | 'State' | 'None'.
    """
    base = Alumni.objects.filter(college_id=college_id, is_verified=True)

    if city:
        city_matches = base.filter(hometown_city__iexact=city)
        if city_matches.exists():
            return city_matches, "City"

    if state:
        state_matches = base.filter(hometown_state__iexact=state)
        if state_matches.exists():
            return state_matches, "State"

    return base.none(), "None"


class LeadViewSet(viewsets.ModelViewSet):
    """
    Lead capture. Anyone can POST a lead (that is the whole point of the
    funnel); only staff may list/read/update/delete leads so contact data
    is never exposed publicly.
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        if django_settings.DEBUG:
            print("[lead] received:", request.data)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            if django_settings.DEBUG:
                print("[lead] validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CollegeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = College.objects.all()
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CollegeDetailSerializer
        return CollegeListSerializer


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/colleges/courses/
    GET /api/colleges/courses/?college=<slug>
    GET /api/colleges/courses/?q=<text>

    Flat list of every course with its college, so the Courses page can show
    "which college offers which course" without fetching each college.
    """
    queryset = Course.objects.select_related("college").all()
    serializer_class = CollegeCourseSerializer
    pagination_class = None

    def get_queryset(self):
        results = Course.objects.select_related("college").all()
        params = self.request.query_params

        college = (params.get("college") or "").strip()
        if college:
            results = results.filter(college__slug=college)

        q = (params.get("q") or "").strip()
        if q:
            results = results.filter(name__icontains=q)

        return results.order_by("college__nirf_rank", "name")


class ScholarshipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/colleges/scholarships/?category=SC&income=250000&state=Bihar

    Real profile filtering (the frontend sends these params):
      - category: keep schemes for that category and for 'All'
      - income:   keep schemes whose max income >= the student's income
      - state:    keep schemes for that domicile state and for 'All'
    """
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

    def get_queryset(self):
        results = Scholarship.objects.all()
        params = self.request.query_params

        category = (params.get("category") or "").strip()
        state = (params.get("state") or "").strip()
        income_raw = (params.get("income") or "").strip()

        if category:
            results = results.filter(
                eligible_category__iexact=category
            ) | results.filter(eligible_category__iexact="All")
        if income_raw:
            try:
                results = results.filter(max_income__gte=int(income_raw))
            except ValueError:
                pass
        if state:
            results = results.filter(state__iexact=state) | results.filter(
                state__iexact="All"
            )
        return results.distinct()


class HometownAlumniView(APIView):
    """
    GET  /api/colleges/<id>/hometown-alumni/?city=<city>&state=<state>
         -> {count, match_type, profiles}
    POST /api/colleges/<id>/hometown-alumni/ {city, state, phone}
         -> saves a lead and, when a matching senior exists, returns their
            WhatsApp number so the student can start the "vibe check".
    """

    def get(self, request, college_id):
        get_object_or_404(College, pk=college_id)
        city = (request.query_params.get("city") or "").strip()
        state = (request.query_params.get("state") or "").strip()

        matches, match_type = _hometown_matches(college_id, city, state)
        count = matches.count()
        top_profiles = matches[:3]

        return Response(
            {
                "count": count,
                "match_type": match_type,
                "profiles": AlumniSerializer(top_profiles, many=True).data,
            }
        )

    def post(self, request, college_id):
        college = get_object_or_404(College, pk=college_id)
        city = (request.data.get("city") or "").strip()
        state = (request.data.get("state") or "").strip()
        phone = (request.data.get("phone") or "").strip()

        if not phone or len(phone) < 10:
            return Response(
                {"phone": ["Enter a valid 10-digit phone number."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        matches, match_type = _hometown_matches(college_id, city, state)
        profiles = list(matches[:3])

        # Conversion: remember the student even if no senior is available yet.
        lead = Lead.objects.create(
            name="",
            phone=phone,
            email=None,
            college_name=college.name,
            note=f"Hometown alumni vibe check — city: {city or '-'}, state: {state or '-'}, match: {match_type}",
        )

        whatsapp = ""
        for profile in profiles:
            if profile.whatsapp_number:
                whatsapp = profile.whatsapp_number
                break

        return Response(
            {
                "count": matches.count(),
                "match_type": match_type,
                "profiles": AlumniSerializer(profiles, many=True).data,
                "whatsapp_number": whatsapp,
                "lead_saved": lead.pk,
            },
            status=status.HTTP_201_CREATED,
        )


class AISearchView(APIView):
    """
    POST /api/ai-search/
    body: {query, intent?: "auto"|"colleges"|"scholarships"|"both",
           lang?: "auto"|"en"|"hi", mode?: page mode, profile?: {...}}

    mode scopes the AI to a site section so each page answers correctly:
      general | colleges | exams | courses | scholarships | test_series

    -> {reply, action, source, language, intent, mode, colleges, scholarships}
    """

    def post(self, request):
        query = str(request.data.get("query") or request.data.get("text") or "").strip()
        if not query:
            return Response(
                {"error": "query is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        intent = str(request.data.get("intent") or "auto")
        if intent not in ("auto", "colleges", "scholarships", "both"):
            intent = "auto"

        lang = str(request.data.get("lang") or "auto")
        if lang not in ("auto", "en", "hi"):
            lang = "auto"

        mode = str(request.data.get("mode") or "general")
        if mode not in PAGE_MODES:
            mode = "general"

        profile = request.data.get("profile")
        if not isinstance(profile, dict):
            profile = {}

        result = run_ai_search(
            query,
            intent=intent if intent != "auto" else "auto",
            lang=lang,
            profile=profile,
            mode=mode,
        )
        return Response(result)


class VoiceCounselorView(APIView):
    """
    POST /api/voice-counselor/  {text}
    Same AI brain as /api/ai-search/ but tuned for speech (short Hinglish
    reply). Keeps the legacy response keys so old clients still work.
    """

    def post(self, request):
        text = str(request.data.get("text") or "").strip()
        if not text:
            return Response(
                {"error": "text is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if django_settings.DEBUG:
            print(f"[voice] query: {text}")

        result = run_ai_search(text, intent="auto", voice=True)
        colleges = result["colleges"]

        return Response(
            {
                "reply": result["reply"],
                "action": result["action"],
                "source": result["source"],
                "language": result["language"],
                # legacy key + new key (identical payload)
                "data": colleges,
                "colleges": colleges,
                "scholarships": result["scholarships"],
            }
        )
