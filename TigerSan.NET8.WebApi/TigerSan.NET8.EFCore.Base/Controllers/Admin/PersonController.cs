using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    [FilterByCompany]
    public class PersonController : IdControllerBase<PersonEntity, IPersonService>
    {
        #region 【Ctor】
        public PersonController(IPersonService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpPost]
        [Route("FullList")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<PersonFullEntity>>> GetFullList(
            string? name = null,
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetFullList(name, pageSize, pageNumber, sort, ascending, filter);
        }

        [HttpGet]
        [Route("BelongCompanyList")]
        /// <summary>获取“所属公司”集合</summary>
        public async Task<ApiResult<List<IdName>>> GetBelongCompanyList()
        {
            return await _service.GetBelongCompanyList(AccessibleCompanies);
        }

        [HttpGet]
        [Route("BelongDepartmentList")]
        /// <summary>获取“所属公司”集合</summary>
        public async Task<ApiResult<List<IdName>>> GetBelongDepartmentList(long? company = null)
        {
            return await _service.GetBelongDepartmentList(company);
        }

        [HttpGet]
        [Route("BelongRoleList")]
        /// <summary>获取“所属公司”集合</summary>
        public async Task<ApiResult<List<IdName>>> GetBelongRoleList(long? department = null)
        {
            return await _service.GetBelongRoleList(department);
        }
        #endregion [查]
        #endregion 【Functions】
    }
}
