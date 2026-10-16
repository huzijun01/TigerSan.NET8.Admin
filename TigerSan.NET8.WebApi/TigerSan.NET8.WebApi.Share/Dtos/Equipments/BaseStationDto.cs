using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class BaseStationDto : BaseStationEntity
    {
        public string TypeName { get; set; } = string.Empty;
        public string SiteName { get; set; } = string.Empty;
        public long Company { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string Addr { get; set; } = string.Empty;
        public string AddrDetail { get; set; } = string.Empty;
    }
}
