using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Interfaces.Models
{
    public interface IAssetService : IIdServiceBase<AssetEntity>
    {
        // 查:
        /// <summary>获取“完整数据”</summary>
        public Task<ApiResult<AssetDto>> GetFull(
            List<long> companies,
            long? id = null,
            string? assetId = null,
            string? rfid = null);
        /// <summary>根据“RFID”获取“单条数据”</summary>
        public Task<ApiResult<AssetEntity>> GetByRFID(string rfid);
        /// <summary>获取“完整数据”集合</summary>
        public Task<ApiResult<List<AssetDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null);
        /// <summary>获取“位置”</summary>
        public Task<ApiResult<PositionDto>> GetPosition(long asset);
        /// <summary>获取“位置”集合</summary>
        public Task<ApiResult<List<PositionDto>>> GetPositionList(
            string? rfid = null,
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null);
        /// <summary>获取“流转”时长分布</summary>
        public Task<ApiResult<AssetCountDto>> GetTravelCounts(List<long> companies);
        /// <summary>获取“停留”时长分布</summary>
        public Task<ApiResult<AssetCountDto>> GetStayCounts(List<long> companies);

        // Other:
        /// <summary>入库</summary>
        public Task<ApiResult<object>> Inbound(List<long> ids, bool isBeginTransaction = true);
        /// <summary>出库</summary>
        public Task<ApiResult<object>> Outbound(long site, List<long> ids, bool isBeginTransaction = true);
    }
}
