using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class AuthorityService<TDbContext> :
        IdServiceBase<AuthorityEntity, TDbContext>,
        IAuthorityService
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Ctor】
        static AuthorityService()
        {
            SetDbSetConfig(nameof(AuthorityEntity.Role))
                .SetParent(typeof(RoleEntity), nameof(_db.Roles));
        }

        public AuthorityService(TDbContext db) : base(db, db.Authorities)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 根据“角色”获取“数据”集合
        /// <summary>根据“角色”获取“数据”集合</summary>
        public async Task<List<AuthorityEntity>> GetListByRole(long? role = null, int? pageSize = null, int? pageNumber = null)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();

                if (role != null)
                {
                    queryable = queryable.Where(i => i.Role == role);
                }

                return await queryable.GetPage(pageSize, pageNumber).ToListAsync();
            }
            catch (Exception e)
            {
                LogHelper.Instance.Error(e.GetMessage());
                return new List<AuthorityEntity>();
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        /// <summary>添加“单条数据”</summary>
        public override async Task<ApiResult<AuthorityEntity>> Add(AuthorityEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 删除“旧权限”：
                await _db.Authorities.Where(a => a.Role == entity.Role).ExecuteDeleteAsync();

                var res = await base.Add(entity, false);

                // “保存更改”并“提交事务”：
                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return res;
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return ApiResults<AuthorityEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 添加“多条数据”
        /// <summary>添加“多条数据”</summary>
        public override async Task<ApiResult<object>> AddRange(List<AuthorityEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 删除“旧权限”：
                entities.Select(e => e.Role).Distinct().ToList().ForEach(async r =>
                {
                    await _db.Authorities.Where(a => a.Role == r).ExecuteDeleteAsync();
                });

                // “保存更改”并“提交事务”：
                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
                return await base.AddRange(entities, false);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [增]
        #endregion 【Functions】
    }
}
