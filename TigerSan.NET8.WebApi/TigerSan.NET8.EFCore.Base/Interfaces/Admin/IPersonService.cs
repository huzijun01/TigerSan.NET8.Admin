using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public interface IPersonService : IIdServiceBase<PersonEntity>
    {
        public Task<ApiResult<PersonFullEntity>> GetLoginFull(string search, bool clearPassword = true);
        public Task<ApiResult<List<PersonFullEntity>>> GetFullList(
            string? name = null,
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null);
        public Task<ApiResult<List<IdName>>> GetBelongCompanyList(List<CompanyEntity>? accessibleCompanies);
        public Task<ApiResult<List<IdName>>> GetBelongDepartmentList(long? company = null);
        public Task<ApiResult<List<IdName>>> GetBelongRoleList(long? department = null);
    }
}
