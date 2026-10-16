using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    [FilterByCompany]
    public class RoleController : IdNameControllerBase<RoleEntity, IRoleService>
    {
        #region 【Ctor】
        public RoleController(IRoleService service) : base(service)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpPost]
        [Route("FullList")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<RoleAuthorityEntity>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            return await _service.GetFullList(pageSize, pageNumber, sort, ascending, filter);
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
        /// <summary>获取“所属部门”集合</summary>
        public async Task<ApiResult<List<IdName>>> BelongDepartmentList(long? company = null)
        {
            return await _service.GetBelongDepartmentList(company);
        }
        #endregion [查]

        #region [增]
        #region override
        [HttpPost]
        [Route("Unused")]
        /// <summary>添加“单条数据”</summary>
        public override async Task<ApiResult<RoleEntity>> Add([FromBody] RoleEntity entity)
        {
            return ApiResults<RoleEntity>.ApiUnavailable;
        }

        [HttpPost]
        [Route("Unused/Range")]
        /// <summary>添加“多条数据”</summary>
        public override async Task<ApiResult<object>> AddRange([FromBody] List<RoleEntity> entities)
        {
            return ApiResults<object>.ApiUnavailable;
        }
        #endregion override

        [HttpPost]
        /// <summary>添加“单条数据”</summary>
        public async Task<ApiResult<object>> Add([FromBody] RoleAuthorityEntity entity)
        {
            if(UserInfo == null) return ApiResults<object>.IsNull(nameof(UserInfo));
            return await _service.Add(UserInfo, entity);
        }

        [HttpPost]
        [Route("Range")]
        /// <summary>添加“多条数据”</summary>
        public async Task<ApiResult<object>> AddRange([FromBody] List<RoleAuthorityEntity> entities)
        {
            if(UserInfo == null) return ApiResults<object>.IsNull(nameof(UserInfo));
            return await _service.AddRange(UserInfo, entities);
        }
        #endregion [增]

        #region [改]
        #region override
        [HttpPut]
        [Route("Unused")]
        /// <summary>修改“单条数据”</summary>
        public override async Task<ApiResult<object>> Edit([FromBody] RoleEntity entity)
        {
            return ApiResults<object>.ApiUnavailable;
        }
        #endregion override

        [HttpPut]
        /// <summary>修改“单条数据”</summary>
        public async Task<ApiResult<object>> Edit([FromBody] RoleAuthorityEntity entity)
        {
            if(UserInfo == null) return ApiResults<object>.IsNull(nameof(UserInfo));
            return await _service.Edit(UserInfo, entity);
        }
        #endregion [改]
        #endregion 【Functions】
    }
}
