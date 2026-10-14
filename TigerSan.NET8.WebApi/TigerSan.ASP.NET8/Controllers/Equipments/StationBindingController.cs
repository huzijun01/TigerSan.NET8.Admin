using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    public class StationBindingController : IdControllerBase<StationBindingEntity, IStationBindingService>
    {
        #region 【Ctor】
        public StationBindingController(IStationBindingService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpPost]
        [Route("Last")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<StationBindingEntity>> GetLast(long? station = null, long? tag = null)
        {
            return await _service.GetLast(station, tag);
        }

        [HttpPost]
        [Route("FullList")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<StationBindingDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetFullList(pageSize, pageNumber, sort, ascending, filter);
        }
        #endregion [查]
        #endregion 【Functions】
    }
}
