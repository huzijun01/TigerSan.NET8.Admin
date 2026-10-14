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
    public class InventoryRecordService : IdServiceBase<InventoryRecordEntity, AppDbContext>, IInventoryRecordService
    {
        #region 【Ctor】
        static InventoryRecordService()
        {
            SetDbSetConfig(nameof(InventoryRecordEntity.Site))
                .SetParent(typeof(SiteEntity), nameof(_db.Sites), nameof(SiteEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public InventoryRecordService(AppDbContext db) : base(db, db.InventoryRecords)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [private]
        #region 获取“完整数据”
        /// <summary>获取“完整数据”</summary>
        private async Task<ApiResult<InventoryRecordDto>> GetFull(InventoryRecordEntity entity)
        {
            var dto = new InventoryRecordDto();
            dto.ShallowCopy(entity);

            var site = await _db.Sites.AsNoTracking().FirstOrDefaultAsync(i => i.Id == entity.Site);
            if (site == null)
            {
                return MyResults<InventoryRecordDto>.SiteNotExist;
            }
            dto.SiteName = site.Name;

            var company = await _db.Companies.AsNoTracking().FirstOrDefaultAsync(i => i.Id == site.Company);
            if (company == null)
            {
                return MyResults<InventoryRecordDto>.CompanyNotExist;
            }
            dto.CompanyName = company.Name;

            return MyResults<InventoryRecordDto>.Success(null, dto);
        }
        #endregion
        #endregion [private]

        #region [查]
        #region 获取“单条完整数据”
        public async Task<ApiResult<InventoryRecordDto>> GetFull(long id)
        {
            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
                if (entity == null)
                {
                    return MyResults<InventoryRecordDto>.ResourceNotExist;
                }

                var res = await GetFull(entity);
                if (res.Data == null)
                {
                    return MyResults<InventoryRecordDto>.Error(res.Message);
                }

                return MyResults<InventoryRecordDto>.Success(null, res.Data);
            }
            catch (Exception e)
            {
                return MyResults<InventoryRecordDto>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”集合
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<InventoryRecordDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            try
            {
                await InventoryAll(false);
                var list = new List<InventoryRecordDto>();

                // 获取“数据”集合:
                var resGetList = await GetList(pageSize, pageNumber, sort, ascending, filter);
                var entities = resGetList.Data;
                if (entities == null)
                {
                    return MyResults<List<InventoryRecordDto>>.Error(resGetList.Message);
                }

                // 添加“数据”:
                foreach (var entity in entities)
                {
                    var res = await GetFull(entity);
                    if (res.Data == null)
                    {
                        return MyResults<List<InventoryRecordDto>>.Error(res.Message);
                    }
                    list.Add(res.Data);
                }

                return MyResults<List<InventoryRecordDto>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<InventoryRecordDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [Other]
        #region 盘点
        public async Task<ApiResult<object>> Inventory(long site)
        {
            try
            {
                var date = DateTime.Now.Date;

                var baseStations = await _db.BaseStations
                    .AsNoTracking()
                    .Where(i => i.Site == site)
                    .Select(i => i.Id)
                    .ToListAsync();

                var assetIds = await _db.Tags
                    .AsNoTracking()
                    .Where(i => i.Asset != null && i.Station != null && baseStations.Contains(i.Station.Value))
                    .Select(i => i.Asset)
                    .ToListAsync();

                var inStore = await _db.Assets
                    .AsNoTracking()
                    .Where(i => assetIds.Contains(i.Id) && i.State == AssetStates.InStore)
                    .CountAsync();

                var stolid = await _db.Assets
                    .AsNoTracking()
                    .Where(i => assetIds.Contains(i.Id) && i.State == AssetStates.Stolid)
                    .CountAsync();

                var record = await _dbSet.FirstOrDefaultAsync(i => i.Site == site && i.Time == date);
                if (record == null)
                {
                    record = new InventoryRecordEntity
                    {
                        Site = site,
                        Time = date,
                        InStore = inStore,
                        Stolid = stolid
                    };
                    record.UpdateId();

                    await _dbSet.AddAsync(record);
                }
                else
                {
                    record.InStore = inStore;
                    record.Stolid = stolid;
                    _dbSet.Update(record);
                }

                await _db.SaveChangesAsync();
                return MyResults<object>.Success();
            }
            catch (Exception e)
            {
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 盘点全部
        public async Task<ApiResult<object>> InventoryAll(bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                var siteIds = await _db.Sites.AsNoTracking().Select(i => i.Id).ToListAsync();

                foreach (var siteId in siteIds)
                {
                    await Inventory(siteId);
                }

                var cutoffDate = DateTime.Now.Date.AddDays(-7);
                await _dbSet.Where(r => r.Time < cutoffDate).ExecuteDeleteAsync();

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
                return MyResults<object>.Success();
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 增加“资产”
        public async Task<ApiResult<object>> AddAsset(long site)
        {
            try
            {
                await Inventory(site);

                var record = await _dbSet.FirstOrDefaultAsync(i => i.Site == site && i.Time == DateTime.Now.Date);
                if (record == null)
                {
                    return MyResults<object>.Error($"No inventory record found for site {site} on {DateTime.Now.Date}");
                }

                ++record.Add;

                await _db.SaveChangesAsync();
                return MyResults<object>.Success();
            }
            catch (Exception e)
            {
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 减少“资产”
        public async Task<ApiResult<object>> ReduceAsset(long site)
        {
            try
            {
                await Inventory(site);

                var record = await _dbSet.FirstOrDefaultAsync(i => i.Site == site && i.Time == DateTime.Now.Date);
                if (record == null)
                {
                    return MyResults<object>.Error($"No inventory record found for site {site} on {DateTime.Now.Date}");
                }

                ++record.Reduce;

                await _db.SaveChangesAsync();
                return MyResults<object>.Success();
            }
            catch (Exception e)
            {
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [Other]
        #endregion 【Functions】
    }
}
