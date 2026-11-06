import logging
import time
from enum import Enum

from PIL.Image import Image, Resampling, new as NewImage
from io import BytesIO
from threading import Thread

from photobooth.printer.ivy2 import Ivy2Printer

mosaic_printer_mac_address = "28:D4:1E:28:47:70"
mosaic_printer = Ivy2Printer()
personal_printer_mac_address = "60:6E:41:46:34:60"
personal_printer = Ivy2Printer()

PRINT_START_WIDTH = 1920
PRINT_START_HEIGHT = 1280
PRINT_FINAL_WIDTH = 1616
PRINT_FINAL_HEIGHT = 640

class PrinterInstance(Enum):
    MOSAIC = 1,
    PERSONAL = 2

should_ping = True

def periodic_ping():
    global should_ping
    while should_ping:
        time.sleep(1)

        if mosaic_printer.is_connected():
            mosaic_printer.check_print_worthiness()
        else:
            mosaic_printer.connect(mosaic_printer_mac_address)

        if personal_printer.is_connected():
            personal_printer.check_print_worthiness()
        else:
            personal_printer.connect(personal_printer_mac_address)


periodic_check_thread = Thread(target=periodic_ping)


def init_printer():
    logging.info("Connecting to mosaic printer")
    mosaic_printer.connect(mosaic_printer_mac_address)
    logging.info("Connecting to personal printer")
    personal_printer.connect(personal_printer_mac_address)
    periodic_check_thread.start()


def prepare_image(image: Image):
    width, height = image.size

    scale_factor = max(PRINT_START_WIDTH / width, PRINT_START_HEIGHT / height)
    scaled_width = int(width * scale_factor)
    scaled_height = int(height * scale_factor)

    if scaled_width != width or scaled_height != height:
        image = image.resize(
            (scaled_width, scaled_height), Resampling.LANCZOS
        )

    offset = (
        (PRINT_START_WIDTH - scaled_width) // 2,
        (PRINT_START_HEIGHT - scaled_height) // 2
    )

    out_image = NewImage("RGB", (PRINT_START_WIDTH, PRINT_START_HEIGHT))
    out_image.paste(image, offset)

    out_image = out_image.resize(
        (PRINT_FINAL_WIDTH, PRINT_FINAL_HEIGHT),
        Resampling.LANCZOS
    )

    with BytesIO() as out_stream:
        out_image.save(out_stream, format="JPEG", quality=100)
        return out_stream.getvalue()

def print_image(image: Image, instance: PrinterInstance):
    global should_ping
    should_ping = False
    periodic_check_thread.join()
    if instance == PrinterInstance.MOSAIC:
        logging.info("Printing to mosaic printer")
        mosaic_printer.print(prepare_image(image))
    elif instance == PrinterInstance.PERSONAL:
        logging.info("Printing to personal printer")
        personal_printer.print(prepare_image(image))

    should_ping = True
    periodic_check_thread.start()


def check_print_worthiness():
    mosaic_printer.check_print_worthiness()
    personal_printer.check_print_worthiness()