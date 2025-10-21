using ImageMagick;

namespace dev.pitlor.wedding_photo_booth.api;

public class ImageService
{
    private readonly IReadOnlyList<IMagickImage<byte>> _bigImageTiles;

    public ImageService(AppSettings appSettings)
    {
        var bigPicture = new MagickImage(appSettings.BigPicturePath);
        var geometry = new MagickGeometry
        {
            Width = bigPicture.Width / appSettings.MosaicWidth,
            Height = bigPicture.Height / appSettings.MosaicHeight
        };
        _bigImageTiles = bigPicture.CropToTiles(geometry);
    }
    
    public MagickImage GetTintedImage(string imagePath, int i)
    {
        using var littlePicture = new MagickImage(imagePath);
        var tile = new MagickImage(_bigImageTiles[i]);
        tile.Composite(littlePicture, CompositeOperator.Overlay);
        return tile;
    }

    public MagickImage GetTile(int i)
    {
        return new MagickImage(_bigImageTiles[i]);
    }
}