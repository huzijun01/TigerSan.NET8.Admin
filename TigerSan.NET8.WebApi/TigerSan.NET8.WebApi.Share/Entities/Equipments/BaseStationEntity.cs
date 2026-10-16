using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("base_station")]
    public class BaseStationEntity : IdName
    {
        [SnakeColumn]
        public long Type { get; set; }
        [SnakeColumn]
        public long Site { get; set; }
        [SnakeColumn]
        public bool IsEnable { get; set; } = false;
        [SnakeColumn]
        public bool IsMobile { get; set; } = false;
        [SnakeColumn]
        public OnlineStates OnlineState { get; set; } = OnlineStates.Offline;
        [SnakeColumn]
        public string MacAddr { get; set; } = string.Empty;
        [SnakeColumn]
        public int HeartbeatInterval { get; set; }
        [SnakeColumn]
        public int ReportInterval { get; set; }
        [SnakeColumn]
        public long MonthOffline { get; set; }
        [SnakeColumn]
        public DateTime CreateTime { get; set; } = DateTimeHelper.GetBeijingNow();
        [SnakeColumn]
        public DateTime? ReportTime { get; set; } = null;
        [SnakeColumn]
        public LocationModes? LocationMode { get; set; }
        [SnakeColumn]
        public double? Longitude { get; set; }
        [SnakeColumn]
        public double? Latitude { get; set; }
        [SnakeColumn]
        public string? Image { get; set; }
        /// <summary>经纬度是否可用</summary>
        [JsonIgnore]
        public bool IsValidLngLat { get => Longitude != null && Latitude != null && Longitude != 0 && Latitude != 0; }
        //public bool IsValidLngLat { get => Verify.IsValidLongitude(Longitude) && Verify.IsValidLatitude(Latitude); }
    }
}
