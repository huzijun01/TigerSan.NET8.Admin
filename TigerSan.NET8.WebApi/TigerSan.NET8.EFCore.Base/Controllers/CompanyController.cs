using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    [FilterByCompany]
    public class CompanyController : IdNameControllerBase<CompanyEntity, ICompanyService>
    {
        #region 【Ctor】
        public CompanyController(ICompanyService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        [HttpGet]
        [Route("SubCompanyIds/{id}")]
        /// <summary>获取“后代公司ID”集合</summary>
        public async Task<ApiResult<List<long>>> GetSubCompanyIds(long id)
        {
            var res = ApiResults<List<long>>.OperationSuccess;
            res.Data = await _service.GetSubCompanyIds(id);
            return res;
        }
        #endregion 【Functions】
    }
}
