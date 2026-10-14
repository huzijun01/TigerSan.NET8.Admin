using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Interfaces.Models
{
    public interface IBindingRecordService : IIdServiceBase<BindingRecordEntity>
    {
        public Task<ApiResult<BindingRecordEntity>> GetLast(long? asset = null, long? tag = null);
        public Task<ApiResult<List<BindingRecordDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null);
    }
}
