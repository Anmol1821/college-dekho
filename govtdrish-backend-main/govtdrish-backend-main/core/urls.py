from django.contrib import admin
from django.urls import path, include

from colleges.views import VoiceCounselorView, AISearchView, HometownAlumniView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Specific API routes first (they must not be swallowed by the
    # college-slug catch-all router mounted on api/colleges/).
    path(
        "api/colleges/<int:college_id>/hometown-alumni/",
        HometownAlumniView.as_view(),
        name="hometown-alumni",
    ),
    path("api/colleges/", include("colleges.urls")),

    path("api/voice-counselor/", VoiceCounselorView.as_view(), name="voice-counselor"),
    path("api/ai-search/", AISearchView.as_view(), name="ai-search"),
]
