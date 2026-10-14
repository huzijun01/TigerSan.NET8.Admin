namespace TigerSan.NET8.EFCore.Base
{
    public class PersonFullEntity : PersonEntity
    {
        public long Company { get; set; }
        public long Department { get; set; }
    }
}
