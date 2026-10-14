using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class AuthorityController : IdControllerBase<AuthorityEntity, IAuthorityService>
    {
        #region 【Ctor】
        public AuthorityController(IAuthorityService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpPost]
        [Route("ListByRole")]
        /// <summary>根据“角色”获取“数据”集合</summary>
        public async Task<ApiResult<List<AuthorityEntity>>> GetListByRole(long? role = null, int? pageSize = null, int? pageNumber = null)
        {
            var res = ApiResults<List<AuthorityEntity>>.OperationSuccess;
            res.Data = await _service.GetListByRole(role, pageSize, pageNumber);
            return res;
        }
        #endregion [查]
        #endregion 【Functions】
    }
}
