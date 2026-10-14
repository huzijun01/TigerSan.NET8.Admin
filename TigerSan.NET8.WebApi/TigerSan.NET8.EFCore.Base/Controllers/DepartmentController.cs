using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    [FilterByCompany]
    public class DepartmentController : IdNameControllerBase<DepartmentEntity, IDepartmentService>
    {
        #region 【Ctor】
        public DepartmentController(IDepartmentService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpGet]
        [Route("BelongCompanyList")]
        /// <summary>获取“所属公司”集合</summary>
        public async Task<ApiResult<List<IdName>>> GetBelongCompanyList()
        {
            return await _service.GetBelongCompanyList(AccessibleCompanies);
        }
        #endregion [查]
        #endregion 【Functions】
    }
}
