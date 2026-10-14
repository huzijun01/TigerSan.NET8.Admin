using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    [FilterByCompany]
    public class VehicleController : IdControllerBase<VehicleEntity, IVehicleService>
    {
        #region 【Ctor】
        public VehicleController(IVehicleService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        [HttpPost]
        [Route("SelectIdPlate")]
        /// <summary>获取“ID名称对”集合</summary>
        public virtual async Task<ApiResult<List<IdName>>> SelectIdName([FromBody] FilterDto? filter = null)
        {
            return await _service.SelectIdPlate(filter);
        }
        #endregion 【Functions】
    }
}
