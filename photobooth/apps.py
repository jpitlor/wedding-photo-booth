from django.apps import AppConfig

class PhotoboothConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'photobooth'

    big_picture_path = ""
    small_picture_folder_path = ""
    tiles_per_row = 1
    tiles_per_column = 1
    resend_api_key = ""

    def ready(self):
        from photobooth.mosaic.image_manipulation import init_mosaic
        from photobooth.printer.printer import init_printer

        init_mosaic(self.big_picture_path, self.tiles_per_row, self.tiles_per_column)
        init_printer()
        pass
