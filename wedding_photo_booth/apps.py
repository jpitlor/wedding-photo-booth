import os

from photobooth.apps import PhotoboothConfig


class MyPhotoboothConfig(PhotoboothConfig):
    big_picture_path = os.environ["BIG_PICTURE_PATH"]
    photo_printer_width = int(os.environ["PHOTO_PRINTER_WIDTH"])
    photo_printer_height = int(os.environ["PHOTO_PRINTER_HEIGHT"])
    resend_api_key = os.environ["RESEND_API_KEY"]