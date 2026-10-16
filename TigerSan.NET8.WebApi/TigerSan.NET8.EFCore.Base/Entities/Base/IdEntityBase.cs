using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TigerSan.NET8.EFCore.Base
{
    public abstract class IdEntityBase
    {
        [Key]
        [SnakeColumn]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public void UpdateId()
        {
            Id = Uuid7Generator.GenerateLong();
        }
    }
}
