import base64
import io
from io import BytesIO
from typing import cast

from PIL import Image
from django.apps import apps
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt

from photobooth.apps import PhotoboothConfig
from photobooth.email import email
from photobooth.forms import PrintImageForm
from photobooth.models import BigImage
from photobooth.mosaic import image_manipulation
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
    # TODO: crop this in the browser
    image = Image.open(image_bytes).convert("RGBA").crop((0, 0, 633, 633))
    tile_number = -1

    # Always send to Jordan and Cassie
    emails = [JORDAN_CASSIE_EMAIL]
    if form.cleaned_data["email_to_me"]:
        emails.append(form.cleaned_data["email"])
    email.send_email(config.resend_api_key, image, emails)

    if form.cleaned_data["print"]:
        printer.print_image(image, PrinterInstance.PERSONAL)

    if form.cleaned_data["print_in_mosaic"]:
        (overlaid_image, actual_tile_number) = image_manipulation.overlay_tile(image)
        printer.print_image(overlaid_image, PrinterInstance.MOSAIC)
        tile_number = actual_tile_number

    return JsonResponse({'tileNumber': tile_number})


def get_tile(request, tile_number: int):
    # First, we need to calculate the tile size using the image dimensions stored
    # in the database and the tile count in the config
    config = cast(PhotoboothConfig, apps.get_app_config('photobooth'))
    big_image = BigImage.objects.first()
    tile_width = int(big_image.width / config.tiles_per_row)
    tile_height = int(big_image.height / config.tiles_per_column)

    # Then we can actually get the calculated tile image
    image = image_manipulation.get_tile(tile_number, (tile_width, tile_height))

    # And return it to the browser
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    buffer.seek(0)
    return FileResponse(buffer, filename="tile.jpg")
