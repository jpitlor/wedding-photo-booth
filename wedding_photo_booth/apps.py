import os

from photobooth.apps import PhotoboothConfig


class MyPhotoboothConfig(PhotoboothConfig):
    big_picture_path = "/Users/jpitlor/Downloads/EJPHOTOGRAPHYJordP-9.jpgdv.jpg"
    small_picture_folder_path = "/Users/jpitlor/Downloads/immich-20251020_171754"
    tiles_per_row = 10
    tiles_per_column = 15
    resend_api_key = os.environ["RESEND_API_KEY"]