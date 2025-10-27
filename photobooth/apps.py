from django.apps import AppConfig
from photobooth.mosaic.image_manipulation import init_mosaic

class PhotoboothConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'photobooth'

    big_picture_path = ""
    small_picture_folder_path = ""
    tiles_per_row = 1
    tiles_per_column = 1

    def ready(self):
        init_mosaic(self.big_picture_path, self.tiles_per_row, self.tiles_per_column)
