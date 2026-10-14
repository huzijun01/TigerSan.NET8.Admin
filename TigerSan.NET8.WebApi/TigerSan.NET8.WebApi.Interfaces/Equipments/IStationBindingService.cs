using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Interfaces.Models
{
    public interface IStationBindingService : IIdServiceBase<StationBindingEntity>
    {
        public Task<ApiResult<StationBindingEntity>> GetLast(long? station = null, long? tag = null);
        public Task<ApiResult<List<StationBindingDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null);
    }
}
