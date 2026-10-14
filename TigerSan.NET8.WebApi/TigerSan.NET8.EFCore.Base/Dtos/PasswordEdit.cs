namespace TigerSan.NET8.EFCore.Base
{
    public class PasswordEdit
    {
        public long Id { get; set; }
        public string Password { get; set; } = string.Empty;
        public string OldPassword { get; set; } = string.Empty;
    }
}
