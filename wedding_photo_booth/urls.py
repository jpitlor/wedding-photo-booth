from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("api/", include("photobooth.urls")),
    path('admin/', admin.site.urls),
]
