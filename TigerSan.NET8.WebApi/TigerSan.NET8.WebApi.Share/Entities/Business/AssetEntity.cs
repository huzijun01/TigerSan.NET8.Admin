using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("asset")]
    public class AssetEntity : IdEntityBase
    {
        [SnakeColumn]
        public string AssetId { get; set; } = string.Empty;
        [SnakeColumn]
        public long Department { get; set; }
        [SnakeColumn]
        public long Type { get; set; }
        [SnakeColumn]
        public long? Tag { get; set; }
        [SnakeColumn]
        public string? TagId { get; set; }
        [SnakeColumn]
        public long? Vehicle { get; set; }
        [SnakeColumn]
        public long? Transfer { get; set; }
        [SnakeColumn]
        public bool IsAuto { get; set; } = true;
        [SnakeColumn]
        public bool IsInFence { get; set; } = true;
        [SnakeColumn]
        public string? Name { get; set; } = string.Empty;
        [SnakeColumn]
        public string? Comment { get; set; } = string.Empty;
        [SnakeColumn]
        public ErrorTypes? ErrorType { get; set; }
        [SnakeColumn]
        public DateTime? BindingTime { get; set; }
        // Tag:
        [SnakeColumn]
        public OnlineStates OnlineState { get; set; }
        [SnakeColumn]
        public bool? IsFall { get; set; } = false;
        [SnakeColumn]
        public long? TagType { get; set; }
        [SnakeColumn]
        public long? Station { get; set; } // 最新记录基站
        [SnakeColumn]
        public string? StationId { get; set; } // 最新记录基站ID
        [SnakeColumn]
        public int? Signal { get; set; } // 最新记录基站“信号强度”
        [SnakeColumn]
        public DateTime? ReportTime { get; set; } // 最新记录基站“上报时间”
        // 记录:
        [SnakeColumn]
        public long? LastRecord { get; set; } // 计算时才更新，建议使用GetLast获取最新记录
        [SnakeColumn]
        public AssetStates State { get; set; }
        // 计算:
        [SnakeColumn]
        public DateTime? CalculationTime { get; set; }
        [SnakeColumn]
        public int? DailyMove { get; set; }
        [SnakeColumn]
        public int? MonthlyMove { get; set; }
        [SnakeColumn]
        public int? TotalMove { get; set; }
        [SnakeColumn]
        public double? StayDuration { get; set; }
        [SnakeColumn]
        public double? TravelDuration { get; set; }
        [SnakeColumn]
        public double? OfflineDuration { get; set; }
    }
}
