using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    [FilterByCompany]
    public class StationRecordController : IdControllerBase<StationRecordEntity, IStationRecordService>
    {
        #region 【Ctor】
        public StationRecordController(IStationRecordService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpPost]
        [Route("CoordCount")]
        /// <summary>获取“坐标”总数</summary>
        public async Task<ApiResult<int>> GetC‌oordCount(
            long station,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            FilterDto? filter = null)
        {
            return await _service.GetCoordCount(station, start, end, locationMode, filter);
        }

        [HttpPost]
        [Route("Path")]
        /// <summary>获取“路径”</summary>
        public async Task<ApiResult<List<StationRecordEntity>>> GetPath(
            long station,
            int? pageSize = null,
            int? pageNumber = 1,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetPath(station, pageSize, pageNumber, start, end, locationMode, filter);
        }
        #endregion [查]
        #endregion 【Functions】
    }
}
