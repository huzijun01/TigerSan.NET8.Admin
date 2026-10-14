using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public interface ICompanyService : IIdNameServiceBase<CompanyEntity>
    {
        public Task<List<long>> GetSubCompanyIds(long id);
        public Task<ApiResult<List<CompanyEntity>>> GetAccessibleCompanies(long rootCompany);
    }
}
