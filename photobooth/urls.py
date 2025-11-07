from django.urls import path

from . import views

urlpatterns = [
    path("print", views.print_image, name="print_image"),
    path("tile/<int:tile_number>", views.get_tile, name="get_tile"),
    path("metadata", views.get_big_image, name="get_big_image"),
]