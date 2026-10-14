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
    public class AssetStateRecordService : IdServiceBase<AssetStateRecordEntity, AppDbContext>, IAssetStateRecordService
    {
        #region 【Ctor】
        static AssetStateRecordService()
        {
            SetDbSetConfig(nameof(AssetStateRecordEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public AssetStateRecordService(AppDbContext db) : base(db, db.AssetStateRecords)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [private]
        #region 获取“完整数据”
        /// <summary>获取“完整数据”</summary>
        private async Task<ApiResult<AssetStateRecordDto>> GetFull(AssetStateRecordEntity entity)
        {
            var dto = new AssetStateRecordDto();
            dto.ShallowCopy(entity);

            var company = await _db.Companies.AsNoTracking().FirstOrDefaultAsync(i => i.Id == entity.Company);
            if (company == null)
            {
                return MyResults<AssetStateRecordDto>.CompanyNotExist;
            }
            dto.CompanyName = company.Name;

            return MyResults<AssetStateRecordDto>.Success(null, dto);
        }
        #endregion
        #endregion [private]

        #region [查]
        #region 获取“单条完整数据”
        public async Task<ApiResult<AssetStateRecordDto>> GetFull(long id)
        {
            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
                if (entity == null)
                {
                    return MyResults<AssetStateRecordDto>.ResourceNotExist;
                }

                var res = await GetFull(entity);
                if (res.Data == null)
                {
                    return MyResults<AssetStateRecordDto>.Error(res.Message);
                }

                return MyResults<AssetStateRecordDto>.Success(null, res.Data);
            }
            catch (Exception e)
            {
                return MyResults<AssetStateRecordDto>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”集合
        public async Task<ApiResult<List<AssetStateRecordDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            try
            {
                await InventoryAll(false);
                var list = new List<AssetStateRecordDto>();

                // 获取“数据”集合:
                var resGetList = await GetList(pageSize, pageNumber, sort, ascending, filter);
                var entities = resGetList.Data;
                if (entities == null)
                {
                    return MyResults<List<AssetStateRecordDto>>.Error(resGetList.Message);
                }

                // 添加“数据”:
                foreach (var entity in entities)
                {
                    var res = await GetFull(entity);
                    if (res.Data == null)
                    {
                        return MyResults<List<AssetStateRecordDto>>.Error(res.Message);
                    }
                    list.Add(res.Data);
                }

                return MyResults<List<AssetStateRecordDto>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<AssetStateRecordDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”集合（多公司求和）
        public async Task<ApiResult<List<AssetStateRecordDto>>> GetSumFullList(List<long> companies)
        {
            try
            {
                await InventoryAll(false);
                var entities = await _dbSet.AsNoTracking().Where(i => companies.Contains(i.Company)).ToListAsync();
                if (entities == null || entities.Count == 0)
                {
                    return MyResults<List<AssetStateRecordDto>>.Success(null, []);
                }

                var list = new List<AssetStateRecordDto>();

                // 添加“数据”:
                foreach (var entity in entities)
                {
                    var dto = new AssetStateRecordDto();
                    dto.ShallowCopy(entity);

                    var find = list.FirstOrDefault(i => i.Time == entity.Time);
                    if (find == null)
                    {
                        list.Add(dto);
                    }
                    else
                    {
                        find.Add(dto);
                    }
                }

                return MyResults<List<AssetStateRecordDto>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<AssetStateRecordDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [Other]
        #region 盘点
        public async Task<ApiResult<object>> Inventory(long company)
        {
            try
            {
                var date = DateTime.Now.Date;

                var departmentIds = await _db.Departments
                    .AsNoTracking()
                    .Where(i => i.Company == company)
                    .Select(i => i.Id)
                    .ToListAsync();

                var newRecord = new AssetStateRecordEntity
                {
                    Company = company,
                    Time = date,
                    Count = await _db.Assets.AsNoTracking().Where(i => departmentIds.Contains(i.Department)).CountAsync(),
                    NoRecord = await _db.Assets.AsNoTracking().Where(i => departmentIds.Contains(i.Department) && i.State == AssetStates.NoRecord).CountAsync(),
                    Inbound = await _db.Assets.AsNoTracking().Where(i => departmentIds.Contains(i.Department) && i.State == AssetStates.Inbound).CountAsync(),
                    InStore = await _db.Assets.AsNoTracking().Where(i => departmentIds.Contains(i.Department) && i.State == AssetStates.InStore).CountAsync(),
                    Stolid = await _db.Assets.AsNoTracking().Where(i => departmentIds.Contains(i.Department) && i.State == AssetStates.Stolid).CountAsync(),
                    Outbound = await _db.Assets.AsNoTracking().Where(i => departmentIds.Contains(i.Department) && i.State == AssetStates.Outbound).CountAsync(),
                    InTransit = await _db.Assets.AsNoTracking().Where(i => departmentIds.Contains(i.Department) && i.State == AssetStates.InTransit).CountAsync(),
                    Timeout = await _db.Assets.AsNoTracking().Where(i => departmentIds.Contains(i.Department) && i.State == AssetStates.Timeout).CountAsync()
                };

                var record = await _dbSet.FirstOrDefaultAsync(i => i.Company == company && i.Time == date);
                if (record == null)
                {
                    newRecord.UpdateId();
                    await _dbSet.AddAsync(newRecord);
                }
                else
                {
                    record.ShallowCopy(newRecord, [nameof(IdEntityBase.Id)]);
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

                var companyIds = await _db.Companies
                    .AsNoTracking()
                    .Select(i => i.Id)
                    .ToListAsync();

                foreach (var companyId in companyIds)
                {
                    await Inventory(companyId);
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
        #endregion [Other]
        #endregion 【Functions】
    }
}
