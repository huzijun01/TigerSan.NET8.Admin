using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    public class StationTypeController : IdNameControllerBase<StationTypeEntity, IStationTypeService>
    {
        #region 【Ctor】
        public StationTypeController(IStationTypeService service) : base(service)
        {
        }
        #endregion 【Ctor】
    }
}
