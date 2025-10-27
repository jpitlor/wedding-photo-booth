from enum import Enum

from PIL.Image import Image


class PrinterInstance(Enum):
    MOSAIC = 1,
    PERSONAL = 2


def print_image(image: Image, instance: PrinterInstance):
    pass