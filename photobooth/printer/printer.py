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
    # mosaic_printer.connect(mosaic_printer_mac_address)
    # personal_printer.connect(personal_printer_mac_address)


def print_image(image: Image, instance: PrinterInstance):
    pass
    # if instance == PrinterInstance.MOSAIC:
    #     mosaic_printer.print(image.tobytes())
    # elif instance == PrinterInstance.PERSONAL:
    #     personal_printer.print(image.tobytes())