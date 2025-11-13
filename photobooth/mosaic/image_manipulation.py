import hashlib
import logging
from io import BytesIO
from random import randint
from typing import Tuple

from PIL import Image, ImageDraw
from django.core.files.uploadedfile import InMemoryUploadedFile

from photobooth.models import BigImage, MosaicTile
from photobooth.mosaic.exceptions import MosaicFullException


def init_mosaic(big_image_path: str, tile_width: int, tile_height: int):
    logging.info("Initializing mosaic models")

    logging.debug("Opening image and calculating hash")
    file = open(big_image_path, 'rb')
    image_hash = hashlib.md5(file.read()).hexdigest()

    # If there is an existing image and it has the same hash,
    # then we can do nothing
    existing_model = BigImage.objects.filter(image_hash=image_hash)
    if len(existing_model) > 0:
        logging.debug("Big image has not changed - no work left")
        return

    # If there is an existing image with a different hash, we
    # should clear the existing mosaic
    all_models = BigImage.objects.all()
    if len(all_models) > 0:
        logging.debug("Deleting old mosaic tiles")
        all_models.delete()
        MosaicTile.objects.all().delete()

    # Finally, we can save our new image and its tiles
    image = Image.open(big_image_path)
    tiles_per_column = image.height // tile_height
    tiles_per_row = image.width // tile_width
    if tile_height * tiles_per_column != image.height or tile_width * tiles_per_row != image.width:
        logging.warning(
            "Image dimensions not an even multiple of printer image size. Cropping to %sx%s",
            tiles_per_row * tile_width,
            tiles_per_column * tile_height)
    new_model = BigImage(image_hash=image_hash,
                         width=image.width,
                         height=image.height,
                         tile_width=tile_width,
                         tile_height=tile_height,
                         row_count=tiles_per_column,
                         column_count=tiles_per_row)

    logging.info("Saving tile models")
    for x in range(tiles_per_row):
        for y in range(tiles_per_column):
            index = y * tiles_per_row + x
            tile = image.crop((x * tile_width, y * tile_height, (x + 1) * tile_width, (y + 1) * tile_height))
            buffer = BytesIO()
            tile.save(buffer, format='PNG')
            tile_file = InMemoryUploadedFile(buffer, None, f"tile_{index}.png", 'image/png', buffer.getbuffer().nbytes, None)
            tile = MosaicTile(index=index, image=tile_file)
            tile.save()

    logging.info("Saving metadata model")
    new_model.save()

    logging.info("Finished initializing mosaic models")


def overlay_tile(image: Image.Image) -> Image.Image:
    # First, we need to find a random image that hasn't been printed
    logging.info("Finding not-printed tiles")
    tiles = MosaicTile.objects.filter(is_printed=False)
    if len(tiles) == 0:
        raise MosaicFullException()

    logging.debug("Picking random tile")
    tile = tiles[randint(0, len(tiles) - 1)]

    # Update it so it isn't picked next time
    tile.is_printed = True

    # Overlay the image
    logging.info("Overlaying provided image")
    tile_image = Image.open(tile.image).convert("RGBA")
    image.putalpha(128)
    overlaid_image = Image.alpha_composite(tile_image, image)
    buffer = BytesIO()
    overlaid_image.save(buffer, format='PNG')
    overlaid_image_file = InMemoryUploadedFile(buffer, None, f"tile_{tile.index}.png", 'image/png', buffer.getbuffer().nbytes, None)
    tile.image = overlaid_image_file

    logging.info("Saving tile updates to database")
    tile.save()
    return overlaid_image


def get_tile(tile_number: int, default_size: Tuple[int, int]) -> Image.Image:
    tile = MosaicTile.objects.get(index=tile_number)
    if tile.is_printed:
        return Image.open(tile.image)
    else:
        x = default_size[0] / 2 - (64 if tile_number < 99 else 96)
        y = default_size[1] / 2 - 64
        image = Image.new("RGB", default_size, (221, 221, 221))
        draw = ImageDraw.Draw(image)
        draw.text((x, y),
                  text=str(tile_number + 1),
                  fill="white",
                  align="center",
                  font_size=128)
        return image
