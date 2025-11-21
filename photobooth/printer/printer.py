import logging
from enum import Enum

from PIL.Image import Image

from photobooth.printer.ivy2 import Ivy2Printer

mosaic_printer_mac_address = "aa:bb:cc:dd:ee:ff"
mosaic_printer = Ivy2Printer()
personal_printer_mac_address = "aa:bb:cc:dd:ee:ff"
personal_printer = Ivy2Printer()

class PrinterInstance(Enum):
    MOSAIC = 1,
    PERSONAL = 2


def init_printer():
    pass

    # logging.info("Connecting to mosaic printer")
    # mosaic_printer.connect(mosaic_printer_mac_address)
    # logging.info("Connecting to personal printer")
    # personal_printer.connect(personal_printer_mac_address)


def print_image(image: Image, instance: PrinterInstance):
    pass
    # if instance == PrinterInstance.MOSAIC:
    #     logging.info("Printing to mosaic printer")
    #     mosaic_printer.print(image.tobytes())
    # elif instance == PrinterInstance.PERSONAL:
    #     logging.info("Printing to personal printer")
    #     personal_printer.print(image.tobytes())