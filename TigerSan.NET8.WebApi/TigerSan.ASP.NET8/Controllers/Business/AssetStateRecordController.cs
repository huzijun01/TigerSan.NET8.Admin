using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    [FilterByCompany]
    public class AssetStateRecordController : IdControllerBase<AssetStateRecordEntity, IAssetStateRecordService>
    {
        #region 【Ctor】
        public AssetStateRecordController(IAssetStateRecordService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpGet]
        [Route("Full")]
        /// <summary>获取“单条完整数据”</summary>
        public async Task<ApiResult<AssetStateRecordDto>> GetFull(long id)
        {

            return await _service.GetFull(id);
        }

        [HttpPost]
        [Route("FullList")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<AssetStateRecordDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetFullList(pageSize, pageNumber, sort, ascending, filter);
        }

        [HttpPost]
        [Route("SumFullList")]
        /// <summary>获取“完整数据”集合（多公司求和）</summary>
        public async Task<ApiResult<List<AssetStateRecordDto>>> GetSumFullList([FromBody] List<long> companies)
        {
            return await _service.GetSumFullList(companies);
        }
        #endregion [查]
        #endregion 【Functions】
    }
}
