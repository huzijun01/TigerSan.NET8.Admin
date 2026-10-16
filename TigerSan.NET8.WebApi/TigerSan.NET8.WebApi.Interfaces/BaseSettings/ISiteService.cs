using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Interfaces.Models
{
    public interface ISiteService : IIdNameServiceBase<SiteEntity>
    {
        /// <summary>获取“所属公司”集合</summary>
        public Task<ApiResult<List<IdName>>> GetBelongCompanyList(List<CompanyEntity>? accessibleCompanies);
        /// <summary>获取“所属类型”集合</summary>
        public Task<ApiResult<List<IdName>>> GetBelongSiteTypeList(long? company = null);
    }
}
