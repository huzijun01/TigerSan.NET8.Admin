using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Interfaces.Models
{
    public interface IVehicleService : IIdServiceBase<VehicleEntity>
    {
        /// <summary>获取“ID车牌对”集合</summary>
        public Task<ApiResult<List<IdName>>> SelectIdPlate(FilterDto? filter = null);
    }
}
