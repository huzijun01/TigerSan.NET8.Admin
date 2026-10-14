using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    [FilterByCompany]
    public class AssetController : IdControllerBase<AssetEntity, IAssetService>
    {
        #region 【Ctor】
        public AssetController(IAssetService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpGet]
        [Route("Full")]
        /// <summary>根据“id”或“assetId”或“rfid”获取“单条完整数据”</summary>
        public async Task<ApiResult<AssetDto>> GetFull(
            long? id = null,
            string? assetId = null,
            string? rfid = null)
        {
            if (AccessibleCompanies == null) return MyResults<AssetDto>.AccessibleCompaniesCannotBeNull;
            return await _service.GetFull(AccessibleCompanies.Select(i => i.Id).ToList(), id, assetId, rfid);
        }

        [HttpGet]
        [Route("ByRFID/{rfid}")]
        /// <summary>根据“RFID”获取“单条数据”</summary>
        public async Task<ApiResult<AssetEntity>> GetByRFID(string rfid)
        {
            return await _service.GetByRFID(rfid);
        }

        [HttpPost]
        [Route("FullList")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<AssetDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetFullList(pageSize, pageNumber, sort, ascending, filter);
        }

        [HttpPost]
        [Route("IdAssetIdList")]
        /// <summary>获取“ID资产ID对”集合</summary>
        public async Task<ApiResult<List<IdValue<string>>>> GetIdAssetIdList(bool? isDistinct = null, [FromBody] FilterDto? filter = null)
        {
            return await _service.SelectIdValue(i => i.AssetId, isDistinct, filter);
        }

        [HttpGet]
        [Route("Position/{asset}")]
        /// <summary>获取“位置”</summary>
        public async Task<ApiResult<PositionDto>> GetPosition(long asset)
        {
            return await _service.GetPosition(asset);
        }

        [HttpPost]
        [Route("PositionList")]
        /// <summary>获取“位置”集合</summary>
        public async Task<ApiResult<List<PositionDto>>> GetPositionList(
            string? rfid = null,
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetPositionList(rfid, pageSize, pageNumber, sort, ascending, filter);
        }

        [HttpPost]
        [Route("TravelCounts")]
        /// <summary>获取“流转”时长分布</summary>
        public async Task<ApiResult<AssetCountDto>> GetTravelCounts([FromBody] List<long> companies)
        {
            return await _service.GetTravelCounts(companies);
        }

        [HttpPost]
        [Route("StayCounts")]
        /// <summary>获取“停留”时长分布</summary>
        public async Task<ApiResult<AssetCountDto>> GetStayCounts([FromBody] List<long> companies)
        {
            return await _service.GetStayCounts(companies);
        }

        /// <summary>下载“CSV”</summary>
        [HttpPost("DownloadCsv")]
        public async Task<IActionResult> DownloadCsv(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            var resGetFullList = await GetFullList(pageSize, pageNumber, sort, ascending, filter);
            var dtos = resGetFullList.Data;
            if (dtos == null) return BadRequest(resGetFullList.Message);

            var res = await FileHelper.GetCsv(dtos);
            var file = res.Data;
            if (file == null) return BadRequest(res.Message);

            return file;
        }

        /// <summary>下载“XLSX”</summary>
        [HttpPost("DownloadXlsx")]
        public async Task<IActionResult> DownloadXlsx(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            var resGetFullList = await GetFullList(pageSize, pageNumber, sort, ascending, filter);
            var dtos = resGetFullList.Data;
            if (dtos == null) return BadRequest(resGetFullList.Message);

            var res = await FileHelper.GetXlsx(dtos);
            var file = res.Data;
            if (file == null) return BadRequest(res.Message);

            return file;
        }
        #endregion [查]

        #region [Other]
        [HttpPut]
        [Route("Inbound")]
        /// <summary>入库</summary>
        public async Task<ApiResult<object>> Inbound([FromBody] List<long> ids)
        {
            return await _service.Inbound(ids);
        }

        [HttpPut]
        [Route("Outbound/{site}")]
        /// <summary>出库</summary>
        public async Task<ApiResult<object>> Outbound(long site, [FromBody] List<long> ids)
        {
            return await _service.Outbound(site, ids);
        }
        #endregion [Other]
        #endregion 【Functions】
    }
}
