namespace TigerSan.NET8.EFCore.Base
{
    public class UserInfo : PersonEntity
    {
        public bool IsRoot { get; set; } = false;
        public string Captcha { get; set; } = string.Empty;
        public IdName CompanyIdName { get; set; } = new IdName();
        public IdName DepartmentIdName { get; set; } = new IdName();
        public IdName RoleIdName { get; set; } = new IdName();
        public List<AuthorityEntity> Authorities { get; set; } = new List<AuthorityEntity>();
        public string? Token { get; set; } = string.Empty;
    }
}
