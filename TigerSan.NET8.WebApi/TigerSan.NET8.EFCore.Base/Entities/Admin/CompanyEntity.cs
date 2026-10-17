using System.ComponentModel.DataAnnotations.Schema;

namespace TigerSan.NET8.EFCore.Base
{
    [Table("company")]
    public class CompanyEntity : IdName
    {
        [SnakeColumn]
        public string Addr { get; set; } = string.Empty;
        [SnakeColumn]
        public long? Parent { get; set; } = null;
    }
}
