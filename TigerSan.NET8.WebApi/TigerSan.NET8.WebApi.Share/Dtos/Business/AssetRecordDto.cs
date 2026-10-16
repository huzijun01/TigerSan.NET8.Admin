using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class AssetRecordDto : AssetRecordEntity
    {
        public string TagId { get; set; } = string.Empty;
        public string? StationId { get; set; }
        public string? StationName { get; set; }
        public string? SiteName { get; set; }
        public string? Addr { get; set; }
        public string? AddrDetail { get; set; }
        public string? TargetSiteName { get; set; }
        public string? TargetAddr { get; set; }
        public string? TargetAddrDetail { get; set; }
        public string FullAddr { get => Address != null ? Address : $"{Addr} {AddrDetail}".Trim(); }
        public string FullTarget { get => $"{TargetAddr} {TargetAddrDetail}".Trim(); }
    }
}
