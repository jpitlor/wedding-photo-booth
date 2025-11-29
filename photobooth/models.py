from django.db import models

class BigImage(models.Model):
    image_hash = models.CharField(max_length=200, unique=True)
    width = models.IntegerField(default=0)
    height = models.IntegerField(default=0)
    tile_width = models.IntegerField(default=0)
    tile_height = models.IntegerField(default=0)
    row_count = models.IntegerField(default=0)
    column_count = models.IntegerField(default=0)


class MosaicTile(models.Model):
    index = models.IntegerField()
    image = models.ImageField()
    is_printed = models.BooleanField(default=False)

class FormSubmission(models.Model):
    image = models.CharField(max_length=999999)
    email_to_me = models.BooleanField()
    email = models.CharField(max_length=200)
    print = models.BooleanField()
    print_in_mosaic = models.BooleanField()