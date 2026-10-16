using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class IdServiceBase<TEntity, TDbContext> :
        IIdServiceBase<TEntity>
        where TEntity : IdEntityBase
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Fields】
        /// <summary>删除前</summary>
        public static DbIdDelegate<TDbContext>? _beforeDelete;
        /// <summary>批量删除前</summary>
        public static DbIdsDelegate<TDbContext>? _beforeRangeDelete;
        /// <summary>DB</summary>
        public TDbContext _db;
        /// <summary>当前表</summary>
        public DbSet<TEntity> _dbSet;
        /// <summary>“当前表”配置</summary>
        protected readonly static DbSetConfig _dbSetConfig = new DbSetConfig(typeof(TEntity), DbContextBase<TDbContext>.GetDbSetName(typeof(DbSet<TEntity>)));
        #endregion 【Fields】

        #region 【Props】
        /// <summary>“当前表”配置</summary>
        public DbSetConfig DbSetConfig { get => _dbSetConfig; }
        #endregion 【Props】

        #region 【Ctor】
        public IdServiceBase(TDbContext db, DbSet<TEntity> dbSet)
        {
            _db = db;
            _dbSet = dbSet;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [static]
        #region 修改“当前表”配置
        /// <summary>修改“当前表”配置</summary>
        public static DbSetConfig SetDbSetConfig(string parentIdPropName)
        {
            _dbSetConfig.ParentIdPropName = parentIdPropName;
            return _dbSetConfig;
        }
        #endregion
        #endregion [static]

        #region 获取“过滤器数据”
        /// <summary>获取“过滤器数据”</summary>
        public virtual async Task<ApiResult<IQueryable<TEntity>>> GetFilter(IQueryable<TEntity> queryable, FilterDto? filter = null)
        {
            try
            {
                if (filter != null)
                {
                    if (filter.Filters != null)
                    {
                        var res = queryable.GetFilters(filter.Filters);
                        if (res.Data == null)
                            return ApiResults<IQueryable<TEntity>>.Error(res.Message);

                        queryable = res.Data;
                    }

                    if (filter.Parent != null)
                    {
                        var res = await queryable.GetParentFilter(
                            _dbSetConfig.ParentIdPropName,
                            _db,
                            _dbSetConfig.Parent,
                            filter.Parent);
                        if (res.Data == null)
                            return ApiResults<IQueryable<TEntity>>.Error(res.Message);

                        queryable = res.Data;
                    }
                }

                return ApiResults<IQueryable<TEntity>>.Success(null, queryable);
            }
            catch (Exception e)
            {
                return ApiResults<IQueryable<TEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region [查]
        #region 获取“单条数据”
        public virtual async Task<ApiResult<TEntity>> Get(long id)
        {
            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
                if (entity == null)
                {
                    return ApiResults<TEntity>.ResourceNotExist;
                }
                return ApiResults<TEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                return ApiResults<TEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“总数”
        public virtual async Task<ApiResult<int>> GetCount(FilterDto? filter = null)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();

                var res = await GetFilter(queryable, filter);
                queryable = res.Data;
                if (queryable == null)
                {
                    return ApiResults<int>.Error(res.Message);
                }

                return ApiResults<int>.Success(null, await queryable.CountAsync());
            }
            catch (Exception e)
            {
                return ApiResults<int>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“数据”集合（ids）
        public virtual async Task<ApiResult<List<TEntity>>> GetList(List<long> ids)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();

                queryable = queryable.Where(i => ids.Contains(i.Id));

                return ApiResults<List<TEntity>>.Success(null, await queryable.ToListAsync());
            }
            catch (Exception e)
            {
                return ApiResults<List<TEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“数据”集合
        public virtual async Task<ApiResult<List<TEntity>>> GetList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();

                var res = await GetFilter(queryable, filter);
                queryable = res.Data;
                if (queryable == null)
                {
                    return ApiResults<List<TEntity>>.Error(res.Message);
                }

                var resSort = queryable.Sort(sort, ascending);
                queryable = resSort.Data;
                if (queryable == null)
                {
                    return ApiResults<List<TEntity>>.Error(resSort.Message);
                }

                return ApiResults<List<TEntity>>.Success(null, await queryable.GetPage(pageSize, pageNumber).ToListAsync());
            }
            catch (Exception e)
            {
                return ApiResults<List<TEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“字段”集合
        public virtual async Task<ApiResult<List<TField>>> Select<TField>(
            Func<TEntity, TField> selector,
            bool isDistinct = false,
            FilterDto? filter = null)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();
                var res = await GetFilter(queryable, filter);
                if (res.Data == null)
                {
                    return ApiResults<List<TField>>.Error(res.Message);
                }
                queryable = res.Data;

                var list = queryable.Select(selector);

                if (isDistinct)
                {
                    list = list.Distinct();
                }

                return ApiResults<List<TField>>.Success(null, list.ToList());
            }
            catch (Exception e)
            {
                return ApiResults<List<TField>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“ID值对”集合
        public virtual async Task<ApiResult<List<IdValue<TField>>>> SelectIdValue<TField>(
            Func<TEntity, TField> selector,
            bool? isDistinct = null,
            FilterDto? filter = null)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();
                var res = await GetFilter(queryable, filter);
                if (res.Data == null)
                {
                    return ApiResults<List<IdValue<TField>>>.Error(res.Message);
                }
                queryable = res.Data;

                var list = queryable.Select(i => new IdValue<TField>(selector(i), i.Id));

                if (isDistinct ?? false)
                {
                    list = list.Distinct();
                }

                return ApiResults<List<IdValue<TField>>>.Success(null, list.ToList());
            }
            catch (Exception e)
            {
                return ApiResults<List<IdValue<TField>>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region “单条数据”是否存在
        public virtual async Task<ApiResult<bool>> IsExists(long id)
        {
            try
            {
                var exists = await _dbSet.AsNoTracking().AnyAsync(i => i.Id == id);
                return ApiResults<bool>.Success(null, exists);
            }
            catch (Exception e)
            {
                return ApiResults<bool>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region “多条数据”是否存在
        public virtual async Task<ApiResult<bool>> IsExistsRange(List<long> ids)
        {
            try
            {
                var exists = await _dbSet.AsNoTracking().AnyAsync(i => ids.Contains(i.Id));
                return ApiResults<bool>.Success(null, exists);
            }
            catch (Exception e)
            {
                return ApiResults<bool>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        public virtual async Task<ApiResult<TEntity>> Add(TEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                entity.UpdateId();
                _dbSet.Add(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return ApiResults<TEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return ApiResults<TEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 添加“多条数据”
        public virtual async Task<ApiResult<object>> AddRange(List<TEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                entities.UpdateId();
                await _dbSet.AddRangeAsync(entities);

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
        #endregion [增]

        #region [改]
        #region 修改“单条数据”
        public virtual async Task<ApiResult<object>> Edit(TEntity entity, bool isBeginTransaction = true)
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
        public virtual async Task<ApiResult<object>> EditRange(List<TEntity> entities, bool isBeginTransaction = true)
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

                // 修改“数据”:
                foreach (var find in finds)
                {
                    var entity = entities.FirstOrDefault(i => i.Id == find.Id);
                    if (entity == null)
                    {
                        return ApiResults<object>.SomeResourceNotExist;
                    }
                    find.ShallowCopy(entity);
                }

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
        #endregion [改]

        #region [删]
        #region 删除“单条数据”
        public virtual async Task<ApiResult<object>> Remove(long id, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
                if (entity == null)
                {
                    return ApiResults<object>.ResourceNotExist;
                }

                // 执行“删除前”操作：
                if (_beforeDelete != null)
                {
                    var res = await _beforeDelete.Invoke(_db, id);
                    if (res.IsError)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        return res;
                    }
                }

                _dbSet.Remove(entity);
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

        #region 删除“多条数据”
        public virtual async Task<ApiResult<object>> RemoveRange(List<long> ids, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                if (ids.Count < 1) return ApiResults<object>.OperationSuccess;

                var finds = _dbSet.Where(i => ids.Contains(i.Id));

                var count = await finds.CountAsync();
                if (count < 1) return ApiResults<object>.ResourceNotExist;
                else if (count < ids.Count) return ApiResults<object>.SomeResourceNotExist;

                // 执行“删除前”操作：
                if (_beforeRangeDelete != null)
                {
                    var res = await _beforeRangeDelete.Invoke(_db, ids);
                    if (res.IsError)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        return res;
                    }
                }

                await finds.ExecuteDeleteAsync();
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
        #endregion [删]
        #endregion 【Functions】
    }
}
