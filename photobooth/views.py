import base64
import io
from io import BytesIO
from typing import cast

from PIL import Image
from django.apps import apps
from django.forms.models import model_to_dict
from django.http import JsonResponse, FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

from photobooth.apps import PhotoboothConfig
from photobooth.email import email
from photobooth.forms import PrintImageForm
from photobooth.models import BigImage, MosaicTile
from photobooth.mosaic import image_manipulation
from photobooth.mosaic.exceptions import MosaicFullException
from photobooth.printer import printer
from photobooth.printer.printer import PrinterInstance

JORDAN_CASSIE_EMAIL = "jandc@pitlor.dev"

# Normally, CSRF protection is good, but this will never be deployed anywhere
@csrf_exempt
def print_image(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    form = PrintImageForm(request.POST)
    if not form.is_valid():
        return JsonResponse({"error": form.errors}, status=400)

    config = cast(PhotoboothConfig, apps.get_app_config('photobooth'))
    image_base64 = form.cleaned_data["image"][len("data:image/png;base64,"):]
    image_bytes = io.BytesIO(base64.decodebytes(bytes(image_base64, "utf-8")))
    image = Image.open(image_bytes).convert("RGBA")

    # Always send to Jordan and Cassie
    emails = [JORDAN_CASSIE_EMAIL]
    if form.cleaned_data["email_to_me"]:
        emails.append(form.cleaned_data["email"])
    email.send_email(config.resend_api_key, image, emails)

    if form.cleaned_data["print"]:
        printer.print_image(image, PrinterInstance.PERSONAL)

    if form.cleaned_data["print_in_mosaic"]:
        try:
            overlaid_image = image_manipulation.overlay_tile(image)
            printer.print_image(overlaid_image, PrinterInstance.MOSAIC)
        except MosaicFullException:
            return JsonResponse({"message": "The mosaic is already full"}, status=500)

    return JsonResponse({"message": ""}, status=200)


def get_tile(request, tile_number: int):
    # First, we need to calculate the tile size using the image dimensions stored
    # in the database and the tile count in the config
    config = cast(PhotoboothConfig, apps.get_app_config('photobooth'))

    # Then we can actually get the calculated tile image
    image = image_manipulation.get_tile(tile_number, (config.photo_printer_height, config.photo_printer_width))

    # And return it to the browser
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    buffer.seek(0)
    return FileResponse(buffer, filename=f"tile_{tile_number}.png")


def get_big_image(request):
    result = model_to_dict(BigImage.objects.first())
    return JsonResponse(result)


@csrf_exempt
def reset(request):
    BigImage.objects.all().delete()
    MosaicTile.objects.all().delete()

    config = cast(PhotoboothConfig, apps.get_app_config('photobooth'))
    image_manipulation.init_mosaic(config.big_picture_path, config.photo_printer_height, config.photo_printer_width)
    return HttpResponse(status=200)


def get_logs(request):
    result = open("photobooth.log").read()
    return JsonResponse({"logs": result}, status=200)
