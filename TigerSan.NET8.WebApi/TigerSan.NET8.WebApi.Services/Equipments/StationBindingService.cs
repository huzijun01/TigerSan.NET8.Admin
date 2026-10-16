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
    public class StationBindingService : IdServiceBase<StationBindingEntity, AppDbContext>, IStationBindingService
    {
        #region 【Ctor】
        public StationBindingService(AppDbContext db) : base(db, db.StationBindings)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region 获取“最新数据”
        /// <summary>获取“最新数据”</summary>
        public async Task<ApiResult<StationBindingEntity>> GetLast(
            long? station = null,
            long? tag = null)
        {
            try
            {
                StationBindingEntity? entity = null;

                if (station != null)
                {
                    entity = await _dbSet.AsNoTracking()
                        .Where(x => x.Station == station)
                        .OrderByDescending(r => r.Time)
                        .FirstOrDefaultAsync();
                }
                else if (tag != null)
                {
                    entity = await _dbSet.AsNoTracking()
                        .Where(x => x.Tag == tag)
                        .OrderByDescending(r => r.Time)
                        .FirstOrDefaultAsync();
                }

                return MyResults<StationBindingEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                return MyResults<StationBindingEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”集合
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<StationBindingDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            try
            {
                var list = new List<StationBindingDto>();

                // 获取“数据”集合:
                var resGetList = await GetList(pageSize, pageNumber, sort, ascending, filter);
                var entities = resGetList.Data;
                if (entities == null)
                {
                    return MyResults<List<StationBindingDto>>.Error(resGetList.Message);
                }

                // 添加“数据”:
                foreach (var entity in entities)
                {
                    var dto = new StationBindingDto();
                    dto.ShallowCopy(entity);

                    // 添加“资产ID”:
                    var station = await _db.BaseStations.FirstOrDefaultAsync(i => i.Id == dto.Station);
                    if (station == null)
                    {
                        return MyResults<List<StationBindingDto>>.StationNotFound(dto.Station.ToString());
                    }
                    dto.StationId = station.MacAddr;

                    // 添加“标签ID”:
                    var tag = await _db.Tags.FirstOrDefaultAsync(i => i.Id == dto.Tag);
                    if (tag == null)
                    {
                        return MyResults<List<StationBindingDto>>.TagNotExist;
                    }
                    dto.TagId = tag.TagId;

                    list.Add(dto);
                }

                return MyResults<List<StationBindingDto>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<StationBindingDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region [增]
        #region 添加“单条数据”
        /// <summary>添加“单条数据”</summary>
        public new async Task<ApiResult<StationBindingEntity>> Add(StationBindingEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                var res = await GetLast(entity.Station, entity.Tag);
                if (res.IsError) return res;
                var lastRecord = res.Data;
                if (lastRecord != null && lastRecord.Equals(entity)) return MyResults<StationBindingEntity>.RecordAlreadyExists;

                entity.UpdateId();
                _dbSet.Add(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return MyResults<StationBindingEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<StationBindingEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 添加“多条数据”
        /// <summary>添加“多条数据”</summary>
        public new async Task<ApiResult<object>> AddRange(List<StationBindingEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                foreach (var entity in entities)
                {
                    await Add(entity, false);
                }

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
        #endregion 【Functions】
    }
}
