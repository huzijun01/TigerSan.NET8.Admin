using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("asset_record")]
    public class AssetRecordEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Asset { get; set; }
        [SnakeColumn]
        public long Tag { get; set; }
        [SnakeColumn]
        public long? Site { get; set; }
        [SnakeColumn]
        public long? TargetSite { get; set; }
        [SnakeColumn]
        public DateTime ReportTime { get; set; }
        [SnakeColumn]
        public AssetStates State { get; set; } = AssetStates.NoRecord;
        // Tag:
        [SnakeColumn]
        public OnlineStates OnlineState { get; set; } = OnlineStates.Offline;
        [SnakeColumn]
        public LocationModes? LocationMode { get; set; }
        [SnakeColumn]
        public long? Station { get; set; }
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
        public string? Address { get; set; }

        #region 是否“移动”
        /// <summary>是否“移动”</summary>
        public static bool IsMoved(AssetRecordEntity oldRecord, AssetRecordEntity newRecord)
        {
            if (oldRecord.Longitude == null || oldRecord.Latitude == null
                || newRecord.Longitude == null || newRecord.Latitude == null) return false;
            var p1 = new Point2(oldRecord.Longitude.Value, oldRecord.Latitude.Value);
            var p2 = new Point2(newRecord.Longitude.Value, newRecord.Latitude.Value);
            return p1.Haversine(p2) > GlobalSettings.DistanceThresholdMeters;
        }
        #endregion

        #region 是否“相等”
        public bool Equals(AssetRecordEntity? other)
        {
            if (other == null) return false;
            return OnlineState == other.OnlineState
                && State == other.State;
        }
        #endregion

        #region 是否“无需添加”
        public bool NoNeedAdd(AssetRecordEntity? lastRecord)
        {
            return lastRecord != null && Equals(lastRecord) && !IsMoved(lastRecord, this);
        }
        #endregion
    }
}
