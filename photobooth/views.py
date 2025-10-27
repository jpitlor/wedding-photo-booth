from PIL import Image
from django.http import JsonResponse

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

    image = Image.open(form.image)
    tile_number = -1

    # Always send to Jordan and Cassie
    email.send_email(image, JORDAN_CASSIE_EMAIL)

    if form.email_to_me:
        email.send_email(image, form.email)

    if form.print:
        printer.print_image(image, PrinterInstance.PERSONAL)

    if form.print_in_mosaic:
        (overlaid_image, actual_tile_number) = image_manipulation.overlay_tile(image)
        printer.print_image(overlaid_image, PrinterInstance.MOSAIC)
        tile_number = actual_tile_number

    return JsonResponse({'tileNumber': tile_number})
