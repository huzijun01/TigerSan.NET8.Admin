using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class IdNameServiceBase<TEntity, TDbContext> :
        IdNameRepeatableServiceBase<TEntity, TDbContext>,
        IIdNameServiceBase<TEntity>
        where TEntity : IdName
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Ctor】
        public IdNameServiceBase(TDbContext db, DbSet<TEntity> dbSet) : base(db, dbSet)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [增]
        #region 添加“单条数据”
        public override async Task<ApiResult<TEntity>> Add(TEntity entity, bool isBeginTransaction = true)
        {
            // 检验“名称”是否重复:
            if (await _dbSet.AnyAsync(i => i.Name == entity.Name))
            {
                return ApiResults<TEntity>.NameRepeated;
            }

            return await base.Add(entity, isBeginTransaction);
        }
        #endregion

        #region 添加“多条数据”
        public override async Task<ApiResult<object>> AddRange(List<TEntity> entities, bool isBeginTransaction = true)
        {
            // 检验“名称”是否重复:
            var names = entities.Select(e => e.Name).ToList();
            if (await _dbSet.AnyAsync(i => names.Contains(i.Name)))
            {
                return ApiResults<object>.NameRepeated;
            }

            return await base.AddRange(entities, isBeginTransaction);
        }
        #endregion
        #endregion [增]

        #region [改]
        #region 修改“单条数据”
        /// <summary>修改“单条数据”</summary>
        public override async Task<ApiResult<object>> Edit(TEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 检验“资源”是否存在:
                var find = await _dbSet.FirstOrDefaultAsync(i => i.Id == entity.Id);
                if (find == null)
                {
                    return ApiResults<object>.ResourceNotExist;
                }

                // 检验“名称”是否重复:
                if (await _dbSet.AnyAsync(i => i.Name == entity.Name && i.Id != entity.Id))
                {
                    return ApiResults<object>.NameRepeated;
                }

                // 修改“数据”:
                find.ShallowCopy(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return ApiResults<object>.OperationSuccess;
        }
        #endregion

        #region 修改“多条数据”
        /// <summary>修改“多条数据”</summary>
        public override async Task<ApiResult<object>> EditRange(List<TEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                if (entities.Count < 1) return ApiResults<object>.OperationSuccess;

                var ids = entities.Select(i => i.Id).ToList();

                // 检验“资源”是否存在:
                var finds = await _dbSet.Where(i => ids.Contains(i.Id)).ToListAsync();
                if (finds.Count < 1)
                {
                    return ApiResults<object>.ResourceNotExist;
                }
                else if (finds.Count < ids.Count)
                {
                    return ApiResults<object>.SomeResourceNotExist;
                }

                foreach (var find in finds)
                {
                    var entity = entities.FirstOrDefault(i => i.Id == find.Id);
                    if (entity == null)
                    {
                        return ApiResults<object>.SomeResourceNotExist;
                    }

                    // 检验“名称”是否重复:
                    if (await _dbSet.AnyAsync(i => i.Name == entity.Name && i.Id != entity.Id))
                    {
                        return ApiResults<object>.NameRepeated;
                    }

                    // 修改“数据”:
                    find.ShallowCopy(entity);
                }

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
                return ApiResults<object>.OperationSuccess;
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [改]
        #endregion 【Functions】
    }
}
