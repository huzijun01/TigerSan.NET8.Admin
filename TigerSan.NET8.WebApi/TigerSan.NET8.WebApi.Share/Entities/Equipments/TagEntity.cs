using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    /// <summary>设备类型</summary>
    public enum EqpTypes
    {
        /// <summary>标签</summary>
        Tag = 0,
        /// <summary>定位器</summary>
        Locator = 1,
        /// <summary>工牌</summary>
        WorkCard = 2,
    }

    /// <summary>定位模式</summary>
    public enum LocateModes
    {
        /// <summary>基站</summary>
        BaseStation = 0,
        /// <summary>移动基站</summary>
        CellTower = 1,
        /// <summary>卫星</summary>
        Satellite = 2,
        /// <summary>WiFi</summary>
        WiFi = 3,
        /// <summary>WiFi+蓝牙</summary>
        WiFi_Bluetooth = 4,
        /// <summary>移动基站+蓝牙</summary>
        CellTower_Bluetooth = 5,
    }

    [Table("tag")]
    public class TagEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Batch { get; set; }
        [SnakeColumn]
        public long Type { get; set; }
        [SnakeColumn]
        public long? Station { get; set; } // 当前连接的基站（不作为绑定标志）
        [SnakeColumn]
        public string? StationId { get; set; } // 基站绑定标志
        [SnakeColumn]
        public bool? IsFall { get; set; }
        [SnakeColumn]
        public bool IsEnable { get; set; } = false;
        [SnakeColumn]
        public EqpTypes EqpType { get; set; } = EqpTypes.Tag;
        [SnakeColumn]
        public OnlineStates OnlineState { get; set; } = OnlineStates.Offline;
        [SnakeColumn]
        public LocationModes? LocationMode { get; set; }
        [SnakeColumn]
        public string TagId { get; set; } = string.Empty;
        [SnakeColumn]
        public long? Asset { get; set; }
        [SnakeColumn]
        public string? AssetId { get; set; }
        [SnakeColumn]
        public string? Rfid { get; set; }
        [SnakeColumn]
        public string? Imei { get; set; }
        [SnakeColumn]
        public string? Iccid { get; set; }
        [SnakeColumn]
        public int? Battery { get; set; }
        [SnakeColumn]
        public int? Signal { get; set; }
        [SnakeColumn]
        public double? Temperature { get; set; }
        [SnakeColumn]
        public double? Longitude { get; set; }
        [SnakeColumn]
        public double? Latitude { get; set; }
        [SnakeColumn]
        public string? Comment { get; set; }
        [SnakeColumn]
        public DateTime? ReportTime { get; set; }
        [SnakeColumn]
        public string? Image { get; set; }

        #region 是否“移动”
        /// <summary>是否“移动”</summary>
        public static bool IsMoved(AssetRecordEntity lastRecord, TagEntity newTag)
        {
            if (lastRecord.Longitude == null || lastRecord.Latitude == null
                || newTag.Longitude == null || newTag.Latitude == null) return false;
            var p1 = new Point2(lastRecord.Longitude.Value, lastRecord.Latitude.Value);
            var p2 = new Point2(newTag.Longitude.Value, newTag.Latitude.Value);
            return p1.Haversine(p2) > GlobalSettings.DistanceThresholdMeters;
        }
        #endregion

        #region 是否“过期”
        /// <summary>是否“过期”</summary>
        public static bool IsExpired(AssetEntity asset, BaseStationEntity? oldStation)
        {
            var signalCompareStartTime = DateTimeHelper.GetBeijingNow().AddSeconds(-(oldStation?.ReportInterval ?? GlobalSettings.TagReportIntervalSeconds));
            return asset.ReportTime == null || asset.ReportTime < signalCompareStartTime;
        }
        #endregion

        #region 是否为“信号更强”的“不同基站”
        /// <summary>是否为“信号更强”的“不同基站”</summary>
        public static bool IsStrongerDifferent(AssetEntity asset, TagEntity newTag)
        {
            if (asset.Station == null || asset.Signal == null
                || newTag.Station == null || newTag.Signal == null
                || asset.Station == newTag.Station) return false;
            return newTag.Signal < asset.Signal;
        }
        #endregion
    }
}
