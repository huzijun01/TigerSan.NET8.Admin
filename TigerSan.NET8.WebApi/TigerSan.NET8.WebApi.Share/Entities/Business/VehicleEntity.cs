using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("vehicle")]
    public class VehicleEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Company { get; set; }
        [SnakeColumn]
        public string Plate { get; set; } = string.Empty;
        [SnakeColumn]
        public string? Logistics { get; set; }
        [SnakeColumn]
        public string? Driver { get; set; }
        [SnakeColumn]
        public string? Phone { get; set; }
    }
}
