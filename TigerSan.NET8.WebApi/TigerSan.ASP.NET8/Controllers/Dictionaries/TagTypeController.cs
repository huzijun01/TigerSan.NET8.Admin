using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    public class TagTypeController : IdNameControllerBase<TagTypeEntity, ITagTypeService>
    {
        #region 【Ctor】
        public TagTypeController(ITagTypeService service) : base(service)
        {
        }
        #endregion 【Ctor】
    }
}
