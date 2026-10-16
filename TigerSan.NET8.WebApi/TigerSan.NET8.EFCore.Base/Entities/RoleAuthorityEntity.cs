namespace TigerSan.NET8.EFCore.Base
{
    public class RoleAuthorityEntity : RoleEntity
    {
        public long Company { get; set; }
        public List<AuthorityEntity> Authorities { get; set; } = new List<AuthorityEntity>();
    }
}
