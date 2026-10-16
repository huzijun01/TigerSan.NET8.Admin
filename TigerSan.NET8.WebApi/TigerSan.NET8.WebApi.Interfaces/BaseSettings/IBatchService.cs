using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Interfaces.Models
{
    public interface IBatchService : IIdServiceBase<BatchEntity>
    {
        public Task<ApiResult<CompanyEntity>> GetCompany(long id);
        public Task<ApiResult<Dictionary<long, CompanyEntity>>> GetCompanyDict(List<long> ids);
    }
}
