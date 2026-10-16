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
    public class SiteService : IdNameServiceBase<SiteEntity, AppDbContext>, ISiteService
    {
        #region 【Ctor】
        static SiteService()
        {
            SetDbSetConfig(nameof(SiteEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public SiteService(AppDbContext db) : base(db, db.Sites)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 获取“所属公司”集合
        public async Task<ApiResult<List<IdName>>> GetBelongCompanyList(List<CompanyEntity>? accessibleCompanies)
        {
            try
            {
                var companys = await _dbSet
                    .AsNoTracking()
                    .Select(i => i.Company)
                    .Distinct()
                    .ToListAsync();

                if (companys.Count < 1) return DbResults.EmptyIdNameList;

                if (accessibleCompanies == null)
                {
                    return MyResults<List<IdName>>.IsNull(nameof(accessibleCompanies));
                }

                companys = companys.Where(i => accessibleCompanies.Any(a => a.Id == i)).ToList();

                var list = await _db.Companies
                    .AsNoTracking()
                    .Where(i => companys.Contains(i.Id))
                    .Select(i => new IdName(i.Id, i.Name))
                    .ToListAsync();

                return MyResults<List<IdName>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“所属类型”集合
        public async Task<ApiResult<List<IdName>>> GetBelongSiteTypeList(long? company = null)
        {
            try
            {
                var queryable = _dbSet
                    .AsNoTracking();

                if (company != null)
                {
                    queryable = queryable.Where(i => i.Company == company);
                }

                var siteTypes = await queryable
                    .Distinct()
                    .Select(i => i.Type)
                    .ToListAsync();

                if (siteTypes.Count < 1) return DbResults.EmptyIdNameList;

                var list = await _db.SiteTypes
                    .AsNoTracking()
                    .Where(i => siteTypes.Contains(i.Id))
                    .Select(i => new IdName(i.Id, i.Name))
                    .ToListAsync();

                return MyResults<List<IdName>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [删]
        #region 删除“单条数据”
        public new async Task<ApiResult<object>> Remove(long id, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
                if (entity == null)
                {
                    return MyResults<object>.ResourceNotExist;
                }

                await _db.Transfers.Where(i => i.Site == id).ExecuteDeleteAsync();
                await _db.InventoryRecords.Where(i => i.Site == id).ExecuteDeleteAsync();
                _dbSet.Remove(entity);
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

        #region 删除“多条数据”
        public new async Task<ApiResult<object>> RemoveRange(List<long> ids, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                if (ids.Count < 1) return MyResults<object>.OperationSuccess;

                var finds = _dbSet.Where(i => ids.Contains(i.Id));

                var count = await finds.CountAsync();
                if (count < 1) return MyResults<object>.ResourceNotExist;
                else if (count < ids.Count) return MyResults<object>.SomeResourceNotExist;

                await _db.Transfers.Where(i => ids.Contains(i.Site)).ExecuteDeleteAsync();
                await _db.InventoryRecords.Where(i => ids.Contains(i.Site)).ExecuteDeleteAsync();
                await finds.ExecuteDeleteAsync();
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
        #endregion [删]
        #endregion 【Functions】
    }
}
