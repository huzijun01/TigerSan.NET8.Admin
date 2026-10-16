using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Interfaces.Models
{
    public interface IBaseStationService : IIdNameServiceBase<BaseStationEntity>
    {
        /// <summary>获取“完整数据”</summary>
        public Task<ApiResult<BaseStationDto>> GetFull(
            List<long> companies,
            long? id,
            string? macAddr = null);
        /// <summary>根据“MAC地址”获取“单条数据”</summary>
        public Task<ApiResult<BaseStationEntity>> GetByMacAddr(string macAddr);
        /// <summary>获取“完整数据”集合</summary>
        public Task<ApiResult<List<BaseStationDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null);
        /// <summary>获取“完整数据”集合（id、macAddr）</summary>
        public Task<ApiResult<List<BaseStationDto>>> GetFullList1(
            List<long> companies,
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            long? id = null,
            string? macAddr = null);
        /// <summary>获取“所属公司”集合</summary>
        public Task<ApiResult<List<IdName>>> GetBelongCompanyList(List<CompanyEntity>? accessibleCompanies);
        /// <summary>获取“所属场地”集合</summary>
        public Task<ApiResult<List<IdName>>> GetBelongSiteList(long? company = null);
        /// <summary>获取“所属基站类型”集合</summary>
        public Task<ApiResult<List<IdName>>> GetBelongStationTypeList(long? company = null, long? site = null);
        /// <summary>获取“场地”</summary>
        public Task<ApiResult<SiteEntity>> GetSite(long id);
        /// <summary>获取“场地”字典</summary>
        public Task<ApiResult<Dictionary<long, SiteEntity>>> GetSiteDict(List<long> ids);
        /// <summary>获取“位置”</summary>
        public Task<ApiResult<PositionDto>> GetPosition(long asset);
        /// <summary>获取“位置”集合</summary>
        public Task<ApiResult<List<PositionDto>>> GetPositionList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null);

        /// <summary>更新“在线状态”</summary>
        public Task<ApiResult<object>> UpdateOnlineState();
    }
}
