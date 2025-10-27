import hashlib
from io import BytesIO
from random import randint
from typing import Tuple

from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile

from photobooth.models import BigImage, MosaicTile


def init_mosaic(big_image_path: str, tiles_per_row: int, tiles_per_column: int):
    # Get hash of new file
    file = open(big_image_path, 'rb')
    image_hash = hashlib.md5(file.read()).hexdigest()

    # If there is an existing image and it has the same hash,
    # then we can do nothing
    existing_model = BigImage.objects.filter(image_hash=image_hash)
    if len(existing_model) > 0:
        return

    # If there is an existing image with a different hash, we
    # should clear the existing mosaic
    all_models = BigImage.objects.all()
    if len(all_models) > 0:
        all_models.delete()
        MosaicTile.objects.all().delete()

    # Finally, we can save our new image and its tiles
    image = Image.open(big_image_path)
    new_model = BigImage(image_hash=image_hash)
    tile_width = image.width / tiles_per_row
    tile_height = image.height / tiles_per_column
    for x in range(tiles_per_row):
        for y in range(tiles_per_column):
            index = y * tiles_per_row + x
            tile = image.crop((x * tile_width, y * tile_height, x * (tile_width + 1), y * (tile_height + 1)))
            buffer = BytesIO()
            tile.save(buffer, format='JPEG')
            tile_file = InMemoryUploadedFile(buffer, None, f"tile_{index}.jpg", 'image/jpeg', buffer.getbuffer().nbytes, None)
            tile = MosaicTile(index=index, image=tile_file)
            tile.save()
    new_model.save()


def overlay_tile(image: Image.Image) -> Tuple[Image.Image, int]:
    # First, we need to find a random image that hasn't been printed
    tiles = MosaicTile.objects.filter(is_printed=False)
    i = randint(0, len(tiles) - 1)
    tile = tiles[i]

    # Update it so it isn't picked next time
    tile.is_printed = True

    # Overlay the image
    tile_image = Image.open(tile.image)
    overlaid_image = Image.alpha_composite(tile_image, image)
    tile.image = overlaid_image
    tile.save()

    return overlaid_image, i
