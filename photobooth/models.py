from django.db import models

class BigImage(models.Model):
    image_hash = models.CharField(max_length=200, unique=True)
    width = models.IntegerField(default=0)
    height = models.IntegerField(default=0)


class MosaicTile(models.Model):
    index = models.IntegerField()
    image = models.ImageField()
    is_printed = models.BooleanField(default=False)