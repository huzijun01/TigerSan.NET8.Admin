using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("inventory_record")]
    public class InventoryRecordEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Site { get; set; }
        [SnakeColumn]
        public int InStore { get; set; }
        [SnakeColumn]
        public int Stolid { get; set; }
        [SnakeColumn]
        public int Add { get; set; }
        [SnakeColumn]
        public int Reduce { get; set; }
        [SnakeColumn]
        public DateTime Time { get; set; }
    }
}
