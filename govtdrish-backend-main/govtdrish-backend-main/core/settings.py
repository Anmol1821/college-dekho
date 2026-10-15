"""
Django settings for core project.

Configuration is environment-driven:
  - Local dev:   create a `.env` file next to this file (see `.env.example`).
  - Production:  set real environment variables (never ship the dev fallbacks).

The `.env` file is loaded with a tiny built-in parser (no extra dependency)
and never overrides variables that are already set in the real environment.
"""
import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent


def load_env_file(path: Path) -> None:
    """Minimal .env loader: KEY=value lines, '#' comments, no interpolation."""
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


load_env_file(BASE_DIR / ".env")

# --- Core toggles -----------------------------------------------------------

# DEBUG comes from the environment only (never hard-coded True).
DEBUG = os.environ.get("DEBUG", "False") == "True"

# Use a real random key in production:  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-dev-only-key-set-DJANGO_SECRET_KEY-for-production",
)

if DEBUG:
    ALLOWED_HOSTS = ["*"]
else:
    ALLOWED_HOSTS = [
        host.strip()
        for host in os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
        if host.strip()
]

# Google Gemini key used by the AI search / voice counselour endpoints.
# Same API (gemini-3.1-flash-lite + Google Search grounding) as the site bot.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# How long a Gemini answer is reused for the same question (seconds) so page
# reloads / other visitors do not spend another API credit. Default: 30 min.
try:
    AI_SEARCH_CACHE_SECONDS = int(os.environ.get("AI_SEARCH_CACHE_SECONDS", "1800"))
except ValueError:
    AI_SEARCH_CACHE_SECONDS = 1800

# In-process cache (LocMemCache) — good enough for a single server and it
# survives between requests. Swap for Redis/Memcached by setting CACHES here.
CACHES = {
    "default": {
        "BACKEND": os.environ.get(
            "CACHE_BACKEND", "django.core.cache.backends.locmem.LocMemCache"
        ),
        "LOCATION": os.environ.get("CACHE_LOCATION", "govtdrish"),
    }
}

# --- Application definition --------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "colleges",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# --- Database ----------------------------------------------------------------
# DATABASE_URL (postgres://... on Heroku) wins, local SQLite is the default.

DATABASES = {
    "default": dj_database_url.config(
        default="sqlite:///db.sqlite3",
        conn_max_age=600,
    )
}

# --- Password validation -----------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- Internationalization ----------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --- Static & media ----------------------------------------------------------
# Plain (non-manifest) storage in DEBUG so `runserver` works without
# collectstatic; manifest storage in production for far-future caching.

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage.CompressedStaticFilesStorage"
            if DEBUG
            else "whitenoise.storage.CompressedManifestStaticFilesStorage"
        ),
    },
}

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- CORS --------------------------------------------------------------------
# Dev (DEBUG=True): allow any origin. Production: only the origins listed
# below plus the comma-separated CORS_ALLOWED_ORIGINS environment variable.

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + [
    origin.strip()
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True

# --- Django REST Framework ---------------------------------------------------
# A global anonymous throttle protects every endpoint (including lead creation).
# The AI search endpoint is NOT tightly throttled here because its Gemini answers
# are cached (see AI_SEARCH_CACHE_SECONDS): the default anon rate is a generous
# ceiling for page loads, while the cache keeps actual API/credit spend low.

REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "600/hour",
        "ai_search": "600/hour",
    },
}
