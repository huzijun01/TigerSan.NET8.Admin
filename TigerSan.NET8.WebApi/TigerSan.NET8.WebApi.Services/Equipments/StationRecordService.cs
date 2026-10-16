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
    public class StationRecordService : IdServiceBase<StationRecordEntity, AppDbContext>, IStationRecordService
    {
        #region 【Ctor】
        static StationRecordService()
        {
            SetDbSetConfig(nameof(StationRecordEntity.Station))
                .SetParent(typeof(BaseStationEntity), nameof(_db.BaseStations), nameof(BaseStationEntity.Site))
                .SetParent(typeof(SiteEntity), nameof(_db.Sites), nameof(SiteEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public StationRecordService(AppDbContext db) : base(db, db.StationRecords)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [Private]
        #region 获取“查询条件”
        /// <summary>获取“查询条件”</summary>
        private async Task<ApiResult<IQueryable<StationRecordEntity>>> GetIQueryable(
            long station,
            int? pageSize = null,
            int? pageNumber = null,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            FilterDto? filter = null)
        {
            try
            {
                var queryable = start != null && end != null
                    ? _dbSet.AsNoTracking().Where(i => i.Station == station
                    && i.Longitude != null && i.Longitude.Value > 0
                    && i.Latitude != null && i.Latitude.Value > 0
                    && i.ReportTime >= start && i.ReportTime <= end)
                    : _dbSet.AsNoTracking().Where(i => i.Station == station
                    && i.Longitude != null && i.Longitude.Value > 0
                    && i.Latitude != null && i.Latitude.Value > 0);

                if (locationMode != null)
                {
                    queryable = queryable.Where(i => i.LocationMode == locationMode);
                }

                var res = await GetFilter(queryable, filter);
                queryable = res.Data;
                if (queryable == null)
                {
                    return MyResults<IQueryable<StationRecordEntity>>.Error(res.Message);
                }

                queryable = queryable.OrderByDescending(i => i.ReportTime);

                return MyResults<IQueryable<StationRecordEntity>>.Success(null, queryable.GetPage(pageSize, pageNumber));
            }
            catch (Exception e)
            {
                return MyResults<IQueryable<StationRecordEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [Private]

        #region [查]
        #region 获取“坐标”总数
        public async Task<ApiResult<int>> GetC‌oordCount(
            long station,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            FilterDto? filter = null)
        {
            try
            {
                var res = await GetIQueryable(station, null, null, start, end, locationMode, filter);
                var queryable = res.Data;
                if (queryable == null)
                {
                    return MyResults<int>.Error(res.Message);
                }

                return MyResults<int>.Success(null, await queryable.CountAsync());
            }
            catch (Exception e)
            {
                return MyResults<int>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“路径”
        /// <summary>获取“路径”</summary>
        public async Task<ApiResult<List<StationRecordEntity>>> GetPath(
            long station,
            int? pageSize = GlobalSettings.MaxCoordCount,
            int? pageNumber = 1,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            FilterDto? filter = null)
        {
            try
            {
                var res = await GetIQueryable(station, pageSize, pageNumber, start, end, locationMode, filter);
                var queryable = res.Data;
                if (queryable == null)
                {
                    return MyResults<List<StationRecordEntity>>.Error(res.Message);
                }

                return MyResults<List<StationRecordEntity>>.Success(null, await queryable.ToListAsync());
            }
            catch (Exception e)
            {
                return MyResults<List<StationRecordEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        public new async Task<ApiResult<StationRecordEntity>> Add(StationRecordEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                #region 判断“是否改变”
                var lastRecord = await _dbSet
                        .Where(i => i.Station == entity.Station)
                        .OrderByDescending(i => i.ReportTime)
                        .FirstOrDefaultAsync();
                if (entity.NoNeedAdd(lastRecord)) return MyResults<StationRecordEntity>.Success(null, entity);
                #endregion

                entity.UpdateId();
                _dbSet.Add(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return MyResults<StationRecordEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<StationRecordEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 添加“多条数据”
        public new async Task<ApiResult<object>> AddRange(List<StationRecordEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                var changes = new List<StationRecordEntity>();
                foreach (var entity in entities)
                {
                    #region 判断“是否改变”
                    var lastRecord = await _dbSet
                        .Where(i => i.Station == entity.Station)
                        .OrderByDescending(i => i.ReportTime)
                        .FirstOrDefaultAsync();
                    if (entity.NoNeedAdd(lastRecord)) continue;
                    #endregion

                    entity.UpdateId();
                    changes.Add(entity);
                }

                await _dbSet.AddRangeAsync(changes);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return MyResults<object>.OperationSuccess;
        }
        #endregion
        #endregion [增]

        #region [Others]
        #region 清理“过期数据”
        public async Task<ApiResult<int>> ClearExpiredRecord()
        {
            try
            {
                var expirationThreshold = DateTimeHelper.GetBeijingNow().AddDays(-GlobalSettings.StationRecordKeepDays);

                var deletedCount = await _dbSet
                    .Where(r => r.ReportTime < expirationThreshold)
                    .ExecuteDeleteAsync();

                return MyResults<int>.Success(null, deletedCount);
            }
            catch (Exception e)
            {
                return MyResults<int>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [Others]
        #endregion 【Functions】
    }
}
