using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("transfer")]
    public class TransferEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Asset { get; set; }
        [SnakeColumn]
        public long Site { get; set; }
        [SnakeColumn]
        public long Target { get; set; }
        [SnakeColumn]
        public DateTime StartTime { get; set; } = DateTimeHelper.GetUtcNow();
        [SnakeColumn]
        public DateTime? EndTime { get; set; }
        [SnakeColumn]
        public string Code { get; set; } = string.Empty;
        [SnakeColumn]
        public string AssetId { get; set; } = string.Empty;
        [SnakeColumn]
        public string? Plate { get; set; }
        [SnakeColumn]
        public string? Logistics { get; set; }
        [SnakeColumn]
        public string? Driver { get; set; }
        [SnakeColumn]
        public string? Phone { get; set; }
    }
}
