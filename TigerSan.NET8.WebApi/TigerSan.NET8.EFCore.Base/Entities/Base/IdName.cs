namespace TigerSan.NET8.EFCore.Base
{
    public class IdName : IdEntityBase
    {
        [SnakeColumn]
        public string Name { get; set; } = string.Empty;

        #region 【Ctor】
        public IdName()
        {
        }

        public IdName(long id, string name)
        {
            Id = id;
            Name = name;
        }

        public IdName(IdName idName)
        {
            Id = idName.Id;
            Name = idName.Name;
        }
        #endregion 【Ctor】
    }
}
