import logging
from enum import Enum

from PIL.Image import Image

from photobooth.printer.ivy2 import Ivy2Printer

mosaic_printer_mac_address = "28:D4:1E:28:47:70"
mosaic_printer = Ivy2Printer()
personal_printer_mac_address = "60:6E:41:46:34:60"
personal_printer = Ivy2Printer()

class PrinterInstance(Enum):
    MOSAIC = 1,
    PERSONAL = 2


def init_printer():
    logging.info("Connecting to mosaic printer")
    mosaic_printer.connect(mosaic_printer_mac_address)
    logging.info("Connecting to personal printer")
    personal_printer.connect(personal_printer_mac_address)


def print_image(image: Image, instance: PrinterInstance):
    if instance == PrinterInstance.MOSAIC:
        logging.info("Printing to mosaic printer")
        mosaic_printer.print(image.tobytes())
    elif instance == PrinterInstance.PERSONAL:
        logging.info("Printing to personal printer")
        personal_printer.print(image.tobytes())