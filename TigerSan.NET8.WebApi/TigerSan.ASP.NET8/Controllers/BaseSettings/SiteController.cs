using Microsoft.AspNetCore.Mvc;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.WebApi.Controllers
{
    [FilterByCompany]
    public class SiteController : IdNameControllerBase<SiteEntity, ISiteService>
    {
        #region 【Ctor】
        public SiteController(ISiteService service) : base(service)
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

        [HttpGet]
        [Route("BelongSiteTypeList")]
        /// <summary>获取“所属公司”集合</summary>
        public async Task<ApiResult<List<IdName>>> GetBelongSiteTypeList(long? company = null)
        {
            return await _service.GetBelongSiteTypeList(company);
        }
        #endregion [查]
        #endregion 【Functions】
    }
}
