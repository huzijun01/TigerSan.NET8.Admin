using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    /// <summary>位置信息</summary>
    public class PositionDto : IdEntityBase
    {
        public string Info { get; set; } = string.Empty;
        public DateTime? ReportTime { get; set; }
        public LocationModes? LocationMode { get; set; }
        public double? Longitude { get; set; }
        public double? Latitude { get; set; }
    }

    /// <summary>定位记录</summary>
    public class LocationRecord
    {
        public DateTime ReportTime { get; set; }
        public LocationModes? LocationMode { get; set; }
        public double? Longitude { get; set; }
        public double? Latitude { get; set; }
        public string? Address { get; set; }
        public long? Site { get; set; }
        public long? Station { get; set; }
        public string? StationName { get; set; }
    }
}
