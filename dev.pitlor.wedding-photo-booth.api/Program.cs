using dev.pitlor.wedding_photo_booth.api;
using ImageMagick;

var appSettings = new AppSettings();

var bigPictureStream = new FileStream(appSettings.BigPicturePath, FileMode.Open);
var smallPicturePaths = Directory.GetFiles(appSettings.SmallPictureFolderPath);

using var imageFromStream = new MagickImage(bigPictureStream);