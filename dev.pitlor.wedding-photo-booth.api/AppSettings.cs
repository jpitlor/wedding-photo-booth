using Microsoft.Extensions.Configuration;

namespace dev.pitlor.wedding_photo_booth.api;

public class AppSettings
{
    private readonly IConfiguration _configuration = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .Build();
    
    public string BigPicturePath => _configuration["BigPicturePath"]!;
    public string SmallPictureFolderPath => _configuration["SmallPictureFolderPath"]!;
    public uint MosaicWidth => Convert.ToUInt32(_configuration["MosaicWidth"]);
    public uint MosaicHeight => Convert.ToUInt32(_configuration["MosaicHeight"]);
}