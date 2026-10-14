using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Interfaces.Models
{
    public interface IAssetStateRecordService : IIdServiceBase<AssetStateRecordEntity>
    {
        // 查:
        /// <summary>获取“完整数据”</summary>
        public Task<ApiResult<AssetStateRecordDto>> GetFull(long id);
        /// <summary>获取“完整数据”集合</summary>
        public Task<ApiResult<List<AssetStateRecordDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null);
        /// <summary>获取“完整数据”集合（多公司求和）</summary>
        public Task<ApiResult<List<AssetStateRecordDto>>> GetSumFullList(List<long> companies);
        // Other:
        /// <summary>盘点</summary>
        public Task<ApiResult<object>> Inventory(long company);
        /// <summary>盘点全部</summary>
        public Task<ApiResult<object>> InventoryAll(bool isBeginTransaction = true);
    }
}
