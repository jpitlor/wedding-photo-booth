import os

from photobooth.apps import PhotoboothConfig


class MyPhotoboothConfig(PhotoboothConfig):
    big_picture_path = os.environ["BIG_PICTURE_PATH"]
    small_picture_folder_path = os.environ["SMALL_PICTURE_FOLDER_PATH"]
    tiles_per_row = int(os.environ["TILES_PER_ROW"])
    tiles_per_column = int(os.environ["TILES_PER_COLUMN"])
    resend_api_key = os.environ["RESEND_API_KEY"]