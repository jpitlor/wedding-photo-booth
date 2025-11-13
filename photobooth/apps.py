import logging

from django.apps import AppConfig

class PhotoboothConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'photobooth'

    big_picture_path = ""
    small_picture_folder_path = ""
    photo_printer_width = 0
    photo_printer_height = 0
    resend_api_key = ""

    def ready(self):
        logging.basicConfig(filename="photobooth.log", level=logging.DEBUG)

        # noinspection PyBroadException
        # The exception could be concerning, but it likely is the result of
        # the database not being migrated yet
        try:
            from photobooth.mosaic.image_manipulation import init_mosaic
            from photobooth.printer.printer import init_printer

            init_mosaic(self.big_picture_path, self.photo_printer_width, self.photo_printer_height)
            init_printer()
        except:
            pass
