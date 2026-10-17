using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public interface IDepartmentService : IIdNameServiceBase<DepartmentEntity>
    {
        public Task<ApiResult<List<IdName>>> GetBelongCompanyList(List<CompanyEntity>? AccessibleCompanies);
        public Task<Dictionary<long, DepartmentInfo>> GetDepartmentInfoDict(List<long> ids);
    }
}
