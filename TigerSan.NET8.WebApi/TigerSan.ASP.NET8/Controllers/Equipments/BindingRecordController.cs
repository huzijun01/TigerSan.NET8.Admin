using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    public class BindingRecordController : IdControllerBase<BindingRecordEntity, IBindingRecordService>
    {
        #region 【Ctor】
        public BindingRecordController(IBindingRecordService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpPost]
        [Route("Last")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<BindingRecordEntity>> GetLast(long? asset = null, long? tag = null)
        {
            return await _service.GetLast(asset, tag);
        }

        [HttpPost]
        [Route("FullList")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<BindingRecordDto>>> GetFullList(
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
