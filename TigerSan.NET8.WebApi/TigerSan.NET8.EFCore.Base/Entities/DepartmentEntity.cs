using System.ComponentModel.DataAnnotations.Schema;

namespace TigerSan.NET8.EFCore.Base
{
    [Table("department")]
    public class DepartmentEntity : IdName
    {
        [SnakeColumn]
        public long Company { get; set; }
    }
}
