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
    public class BatchService : IdServiceBase<BatchEntity, AppDbContext>, IBatchService
    {
        #region 【Ctor】
        static BatchService()
        {
            SetDbSetConfig(nameof(BatchEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public BatchService(AppDbContext db) : base(db, db.Batches)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 获取“公司”
        /// <summary>获取“公司”</summary>
        public async Task<ApiResult<CompanyEntity>> GetCompany(long id)
        {
            try
            {
                var batch = await _dbSet.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
                if (batch == null)
                {
                    LogHelper.Instance.IsNull(nameof(batch));
                    return MyResults<CompanyEntity>.ResourceNotExist;
                }

                var company = await _db.Companies.AsNoTracking().FirstOrDefaultAsync(c => c.Id == batch.Company);
                if (company == null)
                {
                    LogHelper.Instance.IsNull(nameof(company));
                    return MyResults<CompanyEntity>.ResourceNotExist;
                }

                return MyResults<CompanyEntity>.Success(null, company);
            }
            catch (Exception e)
            {
                return MyResults<CompanyEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“公司”字典
        /// <summary>获取“公司”字典</summary>
        public async Task<ApiResult<Dictionary<long, CompanyEntity>>> GetCompanyDict(List<long> ids)
        {
            var dict = new Dictionary<long, CompanyEntity>();
            try
            {
                foreach (var id in ids)
                {
                    var batch = await _dbSet.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
                    if (batch == null)
                    {
                        LogHelper.Instance.IsNull(nameof(batch));
                        continue;
                    }

                    var company = await _db.Companies.AsNoTracking().FirstOrDefaultAsync(c => c.Id == batch.Company);
                    if (company == null)
                    {
                        LogHelper.Instance.IsNull(nameof(company));
                        continue;
                    }

                    dict.Add(id, company);
                }

                return MyResults<Dictionary<long, CompanyEntity>>.Success(null, dict);
            }
            catch (Exception e)
            {
                return MyResults<Dictionary<long, CompanyEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        /// <summary>添加“单条数据”</summary>
        public override async Task<ApiResult<BatchEntity>> Add(BatchEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                entity.UpdateId();
                entity.ShipmentTime = DateTimeHelper.GetBeijingNow();
                _dbSet.Add(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return MyResults<BatchEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<BatchEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 添加“多条数据”
        /// <summary>添加“多条数据”</summary>
        public override async Task<ApiResult<object>> AddRange(List<BatchEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                entities.UpdateId();
                entities.ForEach(e => e.ShipmentTime = DateTimeHelper.GetBeijingNow());
                await _dbSet.AddRangeAsync(entities);

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
