using System.ComponentModel.DataAnnotations.Schema;

namespace TigerSan.NET8.EFCore.Base
{
    [Table("role")]
    public class RoleEntity : IdName
    {
        [SnakeColumn]
        public long Department { get; set; }
    }
}
