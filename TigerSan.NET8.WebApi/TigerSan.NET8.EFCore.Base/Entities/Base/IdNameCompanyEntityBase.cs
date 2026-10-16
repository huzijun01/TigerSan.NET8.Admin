using System.ComponentModel.DataAnnotations.Schema;

namespace TigerSan.NET8.EFCore.Base
{
    public class IdNameCompany : IdName
    {
        [SnakeColumn]
        public long Company { get; set; }
        [NotMapped]
        public string CompanyName { get; set; } = string.Empty;
    }
}
