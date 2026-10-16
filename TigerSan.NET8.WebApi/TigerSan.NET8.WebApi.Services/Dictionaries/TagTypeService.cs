using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Services.Models
{
    public class TagTypeService : IdNameServiceBase<TagTypeEntity, AppDbContext>, ITagTypeService
    {
        #region 【Ctor】
        public TagTypeService(AppDbContext db) : base(db, db.TagTypes)
        {
        }
        #endregion 【Ctor】
    }
}
