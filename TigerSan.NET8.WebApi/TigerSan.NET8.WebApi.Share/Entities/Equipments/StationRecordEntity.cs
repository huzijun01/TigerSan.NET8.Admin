using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("station_record")]
    public class StationRecordEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Station { get; set; }
        [SnakeColumn]
        public DateTime ReportTime { get; set; } = DateTimeHelper.GetBeijingNow();
        [SnakeColumn]
        public OnlineStates OnlineState { get; set; } = OnlineStates.Offline;
        [SnakeColumn]
        public LocationModes? LocationMode { get; set; }
        [SnakeColumn]
        public double? Longitude { get; set; }
        [SnakeColumn]
        public double? Latitude { get; set; }
        [SnakeColumn]
        public string? Address { get; set; }

        #region 是否“移动”
        /// <summary>是否“移动”</summary>
        public static bool IsMoved(StationRecordEntity oldRecord, StationRecordEntity newRecord)
        {
            if (oldRecord.Longitude == null || oldRecord.Latitude == null
                || newRecord.Longitude == null || newRecord.Latitude == null) return false;
            var p1 = new Point2(oldRecord.Longitude.Value, oldRecord.Latitude.Value);
            var p2 = new Point2(newRecord.Longitude.Value, newRecord.Latitude.Value);
            return p1.Haversine(p2) > GlobalSettings.DistanceThresholdMeters;
        }
        #endregion

        #region 是否“相等”
        public bool Equals(StationRecordEntity? other)
        {
            if (other == null) return false;
            return OnlineState == other.OnlineState;
        }
        #endregion

        #region 是否“无需添加”
        public bool NoNeedAdd(StationRecordEntity? lastRecord)
        {
            return lastRecord != null && Equals(lastRecord) && !IsMoved(lastRecord, this);
        }
        #endregion

        #region 复制“基站”状态
        public StationRecordEntity Copy(BaseStationEntity baseStation, string? address)
        {
            Station = baseStation.Id;
            ReportTime = baseStation.ReportTime ?? DateTimeHelper.GetBeijingNow();
            OnlineState = baseStation.OnlineState;
            LocationMode = baseStation.LocationMode;
            Longitude = baseStation.Longitude;
            Latitude = baseStation.Latitude;
            Address = address;
            return this;
        }
        #endregion
    }
}
