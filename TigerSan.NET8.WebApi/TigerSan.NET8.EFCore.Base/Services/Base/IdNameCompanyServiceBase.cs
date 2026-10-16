using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class IdNameCompanyServiceBase<TEntity, TDbContext> :
        IdNameRepeatableServiceBase<TEntity, TDbContext>,
        IIdNameServiceBase<TEntity>
        where TEntity : IdNameCompany
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Ctor】
        public IdNameCompanyServiceBase(TDbContext db, DbSet<TEntity> dbSet) : base(db, dbSet)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 获取“单条数据”
        /// <summary>获取“单条数据”</summary>
        public new virtual async Task<ApiResult<TEntity>> Get(long id)
        {
            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
                if (entity == null)
                {
                    return ApiResults<TEntity>.ResourceNotExist;
                }

                // 添加“公司名称”:
                var parent = _dbSetConfig.Parent;
                if (parent != null && parent.DbSetName == nameof(_db.Companies))
                {
                    var company = await _db.Companies.FirstOrDefaultAsync(i => i.Id == entity.Company);
                    if (company != null) entity.CompanyName = company.Name;
                }

                return ApiResults<TEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                return ApiResults<TEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“数据”集合
        /// <summary>获取“数据”集合</summary>
        public new virtual async Task<ApiResult<List<TEntity>>> GetList(
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

                var list = await queryable.GetPage(pageSize, pageNumber).ToListAsync();

                // 添加“公司名称”:
                var parent = _dbSetConfig.Parent;
                if (parent != null && parent.DbSetName == nameof(_db.Companies))
                {
                    var companies = await _db.Companies.Select(i => new IdName(i.Id, i.Name)).ToListAsync();
                    if (companies != null)
                    {
                        foreach (var item in list)
                        {
                            var company = companies.FirstOrDefault(i => i.Id == item.Company);
                            if (company != null) item.CompanyName = company.Name;
                        }
                    }
                }

                return ApiResults<List<TEntity>>.Success(null, list);
            }
            catch (Exception e)
            {
                return ApiResults<List<TEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        public override async Task<ApiResult<TEntity>> Add(TEntity entity, bool isBeginTransaction = true)
        {
            // 检验“名称”是否重复:
            if (await _dbSet.AnyAsync(i => i.Company == entity.Company && i.Name == entity.Name))
            {
                return ApiResults<TEntity>.NameRepeated;
            }

            return await base.Add(entity, isBeginTransaction);
        }
        #endregion

        #region 添加“多条数据”
        public override async Task<ApiResult<object>> AddRange(List<TEntity> entities, bool isBeginTransaction = true)
        {
            foreach (var entity in entities)
            {
                if (await _dbSet.AnyAsync(i => i.Company == entity.Company && i.Name == entity.Name))
                {
                    return ApiResults<object>.NameRepeated;
                }
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
                if (await _dbSet.AnyAsync(i => i.Company == entity.Company && i.Name == entity.Name && i.Id != entity.Id))
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
                    if (await _dbSet.AnyAsync(i => i.Company == entity.Company && i.Name == entity.Name && i.Id != entity.Id))
                    {
                        return ApiResults<object>.NameRepeated;
                    }

                    // 修改“数据”:
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
        #endregion 【Functions】
    }
}
