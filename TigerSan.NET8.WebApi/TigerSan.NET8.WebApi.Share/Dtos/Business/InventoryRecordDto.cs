using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class InventoryRecordDto : InventoryRecordEntity
    {
        public string CompanyName { get; set; } = string.Empty;
        public string SiteName { get; set; } = string.Empty;
    }
}
