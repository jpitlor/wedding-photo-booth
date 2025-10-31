from typing import cast

from PIL import Image
from django.apps import apps
from django.http import JsonResponse

from photobooth.apps import PhotoboothConfig
from photobooth.email import email
from photobooth.forms import PrintImageForm
from photobooth.mosaic import image_manipulation
from photobooth.printer import printer
from photobooth.printer.printer import PrinterInstance

JORDAN_CASSIE_EMAIL = "jandc@pitlor.dev"


def print_image(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    form = PrintImageForm(request.POST, request.FILES)
    if not form.is_valid():
        return JsonResponse({"error": form.errors}, status=400)

    config = cast(PhotoboothConfig, apps.get_app_config('photobooth'))
    image = Image.open(form.image)
    tile_number = -1

    # Always send to Jordan and Cassie
    emails = [JORDAN_CASSIE_EMAIL]
    if form.email_to_me:
        emails.append(form.email)
    email.send_email(config.resend_api_key, image, emails)

    if form.print:
        printer.print_image(image, PrinterInstance.PERSONAL)

    if form.print_in_mosaic:
        (overlaid_image, actual_tile_number) = image_manipulation.overlay_tile(image)
        printer.print_image(overlaid_image, PrinterInstance.MOSAIC)
        tile_number = actual_tile_number

    return JsonResponse({'tileNumber': tile_number})
