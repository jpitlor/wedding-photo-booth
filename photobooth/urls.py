from django.urls import path

from . import views

urlpatterns = [
    path("print", views.print_image, name="print_image"),
]