using System.ComponentModel.DataAnnotations.Schema;

namespace TigerSan.NET8.EFCore.Base
{
    [Table("authority")]
    public class AuthorityEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Role { get; set; }
        [SnakeColumn]
        public string Path { get; set; } = string.Empty;
        [SnakeColumn]
        public bool IsReadonly { get; set; } = false;
    }
}
