using dev.pitlor.wedding_photo_booth.api;
using ImageMagick;

var appSettings = new AppSettings();
const string corsPolicy = "policy";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicy, cors =>
    {
        cors.AllowAnyHeader();
        cors.AllowAnyMethod();
        cors.AllowAnyOrigin();
    });
});

var app = builder.Build();
var littlePictures = Directory
    .GetFiles(appSettings.SmallPictureFolderPath)
    .Where(file => !file.EndsWith("dsstore"))
    .ToArray();
var imageService = new ImageService(appSettings);

app.UseCors(corsPolicy);

app
    .MapGet("/images", () => new { images = littlePictures })
    .RequireCors(corsPolicy);
app
    .MapGet("/big-image", () =>
    {
        var image = File.OpenRead(appSettings.BigPicturePath);
        return TypedResults.File(image, "image/jpeg");
    })
    .RequireCors(corsPolicy);
app
    .MapGet("/tinted-image/{i:int}", (int i) =>
    {
        var path = littlePictures[i];
        return TypedResults.File(imageService.GetTintedImage(path, i).ToByteArray(), "image/jpeg");
    })
    .RequireCors(corsPolicy);
app
    .MapGet("/little-image/{i:int}", (int i) =>
    {
        var path = littlePictures[i];
        var image = File.OpenRead(path);
        return TypedResults.File(image, "image/jpeg");
    })
    .RequireCors(corsPolicy);
app
    .MapGet("/tile/{i:int}", (int i) =>
    {
        return TypedResults.File(imageService.GetTile(i).ToByteArray(), "image/jpeg");
    })
    .RequireCors(corsPolicy);

app.Run();