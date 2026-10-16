using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class AssetDto : AssetEntity
    {
        public long Company { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        // 记录:
        public string? Rfid { get; set; }
        public string? Plate { get; set; }
        public long? Site { get; set; }
        public string? SiteName { get; set; }
        public int? Battery { get; set; }
        public string? FullAddr { get; set; }
        public string? TransferCode { get; set; }
    }
}
