using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    [FilterByCompany]
    public class BatchController : IdControllerBase<BatchEntity, IBatchService>
    {
        #region 【Ctor】
        public BatchController(IBatchService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpPost]
        [Route("IdBatchIdList")]
        /// <summary>获取“ID批次ID对”集合</summary>
        public async Task<ApiResult<List<IdValue<string>>>> GetIdBatchIdList(bool? isDistinct = null, [FromBody] FilterDto? filter = null)
        {
            return await _service.SelectIdValue(i => i.BatchId, isDistinct, filter);
        }
        #endregion [查]
        #endregion 【Functions】
    }
}
