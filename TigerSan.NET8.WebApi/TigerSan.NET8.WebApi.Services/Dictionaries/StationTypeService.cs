using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Services.Models
{
    public class StationTypeService : IdNameServiceBase<StationTypeEntity, AppDbContext>, IStationTypeService
    {
        #region 【Ctor】
        public StationTypeService(AppDbContext db) : base(db, db.StationTypes)
        {
        }
        #endregion 【Ctor】
    }
}
