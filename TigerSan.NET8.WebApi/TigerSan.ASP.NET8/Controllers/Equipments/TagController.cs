using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    [FilterByCompany]
    public class TagController : IdControllerBase<TagEntity, ITagService>
    {
        #region 【Ctor】
        public TagController(ITagService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpGet]
        [Route("Full")]
        /// <summary>根据“TagId”或“RFID”获取“单条完整数据”</summary>
        public async Task<ApiResult<TagDto>> GetFull(string? tagId = null, string? rfid = null)
        {
            if (AccessibleCompanyIds == null) return MyResults<TagDto>.AccessibleCompaniesCannotBeNull;
            return await _service.GetFull(AccessibleCompanyIds, tagId, rfid);
        }

        [HttpGet]
        [Route("ByTagId/{tagId}")]
        /// <summary>根据“TagId”获取“单条数据”</summary>
        public async Task<ApiResult<TagEntity>> GetByTagId(string tagId)
        {
            return await _service.GetByTagId(tagId);
        }

        [HttpGet]
        [Route("FullByTagId/{tagId}")]
        /// <summary>根据“TagId”获取“单条完整数据”</summary>
        public async Task<ApiResult<TagDto>> GetFullByTagId(string tagId)
        {
            return await _service.GetFullByTagId(tagId);
        }

        [HttpGet]
        [Route("ByRFID/{rfid}")]
        /// <summary>根据“RFID”获取“单条数据”</summary>
        public async Task<ApiResult<TagEntity>> GetByRFID(string rfid)
        {
            return await _service.GetByRFID(rfid);
        }

        [HttpPost]
        [Route("FullList")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<TagDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetFullList(pageSize, pageNumber, sort, ascending, filter);
        }

        [HttpGet]
        [Route("FullListByStationId/{stationId}")]
        /// <summary>获取“完整数据”集合（根据“基站ID”）</summary>
        public async Task<ApiResult<List<TagDto>>> GetFullListByStationId(string stationId)
        {
            return await _service.GetFullListByStationId(stationId);
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

        #region [增]
        [HttpPost]
        [Route("Batch")]
        /// <summary>批量添加</summary>
        public async Task<ApiResult<object>> AddBatch([FromBody] TagEntity entity)
        {
            return await _service.AddBatch(entity);
        }
        #endregion [增]
        #endregion 【Functions】
    }
}
