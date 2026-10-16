using System.ComponentModel.DataAnnotations.Schema;

namespace TigerSan.NET8.EFCore.Base
{
    [Table("person")]
    public class PersonEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Role { get; set; }
        [SnakeColumn]
        public bool IsAdmin { get; set; } = false;
        [SnakeColumn]
        public string Username { get; set; } = string.Empty;
        [SnakeColumn]
        public string Nickname { get; set; } = string.Empty;
        [NotMapped]
        public string Password { get; set; } = string.Empty;
        [Column("password")]
        public string PasswordHash { get; set; } = string.Empty;
        [SnakeColumn]
        public string? Avatar { get; set; }
        [SnakeColumn]
        public string? Phone { get; set; }
        [SnakeColumn]
        public string? Mail { get; set; }
    }
}
