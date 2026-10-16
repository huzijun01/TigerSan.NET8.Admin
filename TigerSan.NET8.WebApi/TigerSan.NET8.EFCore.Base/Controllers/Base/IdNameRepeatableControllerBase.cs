using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;


namespace TigerSan.NET8.EFCore.Base
{
    [ApiController]
    [Route("[controller]")]
    public abstract class IdNameRepeatableControllerBase<TEntity, TIIdNameRepeatableService> : IdControllerBase<TEntity, TIIdNameRepeatableService> where TEntity : IdName where TIIdNameRepeatableService : IIdNameServiceBase<TEntity>
    {
        #region 【Ctor】
        public IdNameRepeatableControllerBase(TIIdNameRepeatableService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        [HttpPost]
        [Route("SelectIdName")]
        /// <summary>获取“ID名称对”集合</summary>
        public virtual async Task<ApiResult<List<IdName>>> SelectIdName(bool? isDistinct, [FromBody] FilterDto? filter = null)
        {
            return await _service.SelectIdName(isDistinct, filter);
        }
        #endregion 【Functions】
    }
}
