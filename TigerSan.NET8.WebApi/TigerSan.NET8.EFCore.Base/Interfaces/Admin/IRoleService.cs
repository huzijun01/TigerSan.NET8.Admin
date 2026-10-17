using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public interface IRoleService : IIdNameServiceBase<RoleEntity>
    {
        public Task<ApiResult<List<RoleAuthorityEntity>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null);
        public Task<ApiResult<List<IdName>>> GetBelongCompanyList(List<CompanyEntity>? accessibleCompanies);
        public Task<ApiResult<List<IdName>>> GetBelongDepartmentList(long? company = null);
        public Task<ApiResult<object>> Add(UserInfo userInfo, RoleAuthorityEntity entity, bool isBeginTransaction = true);
        public Task<ApiResult<object>> AddRange(UserInfo userInfo, List<RoleAuthorityEntity> entities, bool isBeginTransaction = true);
        public Task<ApiResult<object>> Edit(UserInfo userInfo, RoleAuthorityEntity entity, bool isBeginTransaction = true);
    }
}
