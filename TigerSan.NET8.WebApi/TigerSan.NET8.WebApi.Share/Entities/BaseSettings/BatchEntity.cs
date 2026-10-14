using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("batch")]
    public class BatchEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Company { get; set; }
        [SnakeColumn]
        public long Scenario { get; set; }
        [SnakeColumn]
        public string BatchId { get; set; } = string.Empty;
        [SnakeColumn]
        public DateTime ShipmentTime { get; set; } = DateTimeHelper.GetUtcNow();
        [SnakeColumn]
        public string? Manager { get; set; } = string.Empty;
        [SnakeColumn]
        public string? Phone { get; set; } = string.Empty;
        [SnakeColumn]
        public string? Comment { get; set; } = string.Empty;
    }
}
