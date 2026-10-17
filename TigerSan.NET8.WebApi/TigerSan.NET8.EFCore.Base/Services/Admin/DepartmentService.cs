using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class DepartmentService<TDbContext> :
        IdNameServiceBase<DepartmentEntity, TDbContext>,
        IDepartmentService
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Fields】
        private IRoleService _roleService;
        #endregion 【Fields】

        #region 【Ctor】
        static DepartmentService()
        {
            SetDbSetConfig(nameof(DepartmentEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public DepartmentService(TDbContext db, IRoleService roleService) : base(db, db.Departments)
        {
            _roleService = roleService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 获取“所属公司”集合
        /// <summary>获取“所属公司”集合</summary>
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
                    return ApiResults<List<IdName>>.IsNull(nameof(accessibleCompanies));
                }

                companys = companys.Where(i => accessibleCompanies.Any(a => a.Id == i)).ToList();

                var list = await _db.Companies
                    .AsNoTracking()
                    .Where(i => companys.Contains(i.Id))
                    .Select(i => new IdName { Id = i.Id, Name = i.Name })
                    .ToListAsync();

                return ApiResults<List<IdName>>.Success(null, list);
            }
            catch (Exception e)
            {
                return ApiResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“部门信息”字典
        /// <summary>获取“部门信息”字典</summary>
        public async Task<Dictionary<long, DepartmentInfo>> GetDepartmentInfoDict(List<long> ids)
        {
            var dict = new Dictionary<long, DepartmentInfo>();
            try
            {
                foreach (var id in ids)
                {
                    var department = await _dbSet.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
                    if (department != null)
                    {
                        var company = await _db.Companies.AsNoTracking().FirstOrDefaultAsync(c => c.Id == department.Company);
                        if (company != null)
                        {
                            dict[id] = new DepartmentInfo
                            {
                                DepartmentName = department.Name,
                                Company = company.Id,
                                CompanyName = company.Name
                            };
                        }
                    }
                }

                return dict;
            }
            catch (Exception e)
            {
                LogHelper.Instance.Error(e.GetMessage());
                return dict;
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        /// <summary>添加“单条数据”</summary>
        public override async Task<ApiResult<DepartmentEntity>> Add(DepartmentEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 验证“名称是否重复”：
                if (await _dbSet.AnyAsync(i => i.Company == entity.Company && i.Name == entity.Name))
                {
                    return ApiResults<DepartmentEntity>.NameRepeated;
                }

                entity.UpdateId();
                _dbSet.Add(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return ApiResults<DepartmentEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return ApiResults<DepartmentEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 添加“多条数据”
        /// <summary>添加“多条数据”</summary>
        public override async Task<ApiResult<object>> AddRange(List<DepartmentEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 验证“名称是否重复”：
                foreach (var entity in entities)
                {
                    if (await _dbSet.AnyAsync(i => i.Company == entity.Company && i.Name == entity.Name))
                    {
                        return ApiResults<object>.NameRepeated;
                    }
                }

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
        /// <summary>修改“单条数据”</summary>
        public override async Task<ApiResult<object>> Edit(DepartmentEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                var find = await _dbSet.FirstOrDefaultAsync(i => i.Id == entity.Id);
                if (find == null)
                {
                    return ApiResults<object>.ResourceNotExist;
                }

                // 验证“名称是否重复”：
                if (await _dbSet.AnyAsync(d => d.Company == entity.Company && d.Name == entity.Name && d.Id != find.Id))
                {
                    return ApiResults<object>.NameRepeated;
                }

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
        #endregion [改]

        #region [删]
        #region 删除“单条数据”
        /// <summary>删除“单条数据”</summary>
        public override async Task<ApiResult<object>> Remove(long id, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 获取“单条数据”：
                var entity = await _dbSet.FirstOrDefaultAsync(i => i.Id == id);

                // 验证“资源是否存在”：
                if (entity == null)
                {
                    return ApiResults<object>.ResourceNotExist;
                }

                // 删除“部门”相关的“角色”：
                var roles = await _db.Roles.Where(i => i.Department == id).Select(i => i.Id).ToListAsync();
                var resSub = await _roleService.RemoveRange(roles, false);
                if (resSub.IsError)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    return resSub;
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

                // 删除“数据”：
                _dbSet.Remove(entity);

                // “保存更改”并“提交事务”：
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
        /// <summary>删除“多条数据”</summary>
        public override async Task<ApiResult<object>> RemoveRange(List<long> ids, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                if (ids.Count < 1) return ApiResults<object>.OperationSuccess;

                // 获取“多条数据”：
                var finds = _dbSet.Where(i => ids.Contains(i.Id));

                // 验证“资源是否存在”：
                var count = await finds.CountAsync();
                if (count < 1)
                {
                    return ApiResults<object>.ResourceNotExist;
                }
                else if (count < ids.Count)
                {
                    return ApiResults<object>.SomeResourceNotExist;
                }

                // 删除与这些“部门”相关的“角色”：
                var roles = await _db.Roles.Where(i => ids.Contains(i.Department)).Select(i => i.Id).ToListAsync();
                var resSub = await _roleService.RemoveRange(roles, false);
                if (resSub.IsError)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    return resSub;
                }

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

                // 删除“多条数据”：
                _dbSet.RemoveRange(finds);

                // “保存更改”并“提交事务”：
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
