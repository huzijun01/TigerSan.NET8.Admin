using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Services.Models
{
    public class VehicleService : IdServiceBase<VehicleEntity, AppDbContext>, IVehicleService
    {
        #region 【Ctor】
        static VehicleService()
        {
            SetDbSetConfig(nameof(VehicleEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public VehicleService(AppDbContext db) : base(db, db.Vehicles)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 获取“ID车牌对”集合
        public async Task<ApiResult<List<IdName>>> SelectIdPlate(FilterDto? filter = null)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();
                var res = await GetFilter(queryable, filter);
                if (res.Data == null)
                {
                    return MyResults<List<IdName>>.Error(res.Message);
                }
                queryable = res.Data;

                var select = queryable.Select(i => new IdName(i.Id, i.Plate));

                return MyResults<List<IdName>>.Success(null, await select.ToListAsync());
            }
            catch (Exception e)
            {
                return MyResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]
        #endregion 【Functions】
    }
}
