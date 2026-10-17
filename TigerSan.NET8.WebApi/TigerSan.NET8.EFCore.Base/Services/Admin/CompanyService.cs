using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class CompanyService<TDbContext> :
        IdNameServiceBase<CompanyEntity, TDbContext>,
        ICompanyService
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Fields】
        private IDepartmentService _departmentService;
        #endregion 【Fields】

        #region 【Ctor】
        public CompanyService(TDbContext db, IDepartmentService departmentService) : base(db, db.Companies)
        {
            _departmentService = departmentService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 获取“后代公司ID”集合
        /// <summary>获取“后代公司ID”集合</summary>
        public async Task<List<long>> GetSubCompanyIds(long id)
        {
            var subIds = await _dbSet.AsNoTracking().Where(i => i.Parent == id).Select(i => i.Id).ToListAsync();
            var rootIds = new List<long>(subIds);
            var newRootIds = new List<long>();

            // 添加“后代公司”:
            while (rootIds.Count() > 0)
            {
                newRootIds.Clear();

                // 添加“根公司”:
                foreach (var rootId in rootIds)
                {
                    // “孙公司”集合:
                    var subSubIds = await _dbSet.AsNoTracking().Where(i => i.Parent == rootId).Select(i => i.Id).ToListAsync();
                    newRootIds.AddRange(subSubIds);
                }

                rootIds.Clear();
                rootIds.AddRange(newRootIds);
                subIds.AddRange(rootIds);
            }

            return subIds;
        }
        #endregion

        #region 获取“可访问公司”集合
        /// <summary>获取“可访问公司”集合</summary>
        public async Task<ApiResult<List<CompanyEntity>>> GetAccessibleCompanies(long rootCompany)
        {
            var resGetList = await GetList();
            var companies = resGetList.Data;
            if (companies == null)
            {
                return resGetList;
            }

            var find = companies.FirstOrDefault(c => c.Id == rootCompany);
            if (find == null)
            {
                return ApiResults<List<CompanyEntity>>.ResourceNotExist;
            }

            find.Parent = null; // 设置为“根公司”
            var accessibleCompanies = CompanyHelper.GetSubCompanies(companies, find);
            accessibleCompanies.Add(find);

            return ApiResults<List<CompanyEntity>>.Success(null, accessibleCompanies);
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        /// <summary>添加“单条数据”</summary>
        public override async Task<ApiResult<CompanyEntity>> Add(CompanyEntity entity, bool isBeginTransaction = true)
        {
            if (entity.Parent != null && !await _dbSet.AnyAsync(i => i.Id == entity.Parent))
            {
                return ApiResults<CompanyEntity>.ParentCompanyNotExist(entity.Id, entity.Parent.Value);
            }

            return await base.Add(entity, isBeginTransaction);
        }
        #endregion

        #region 添加“多条数据”
        /// <summary>添加“多条数据”</summary>
        public override async Task<ApiResult<object>> AddRange(List<CompanyEntity> entities, bool isBeginTransaction = true)
        {
            foreach (var entity in entities)
            {
                if (entity.Parent != null && !await _dbSet.AnyAsync(i => i.Id == entity.Parent))
                {
                    return ApiResults<object>.Error($"父公司不存在：{entity.Id}，{entity.Parent}");
                }
            }

            return await base.AddRange(entities, isBeginTransaction);
        }
        #endregion
        #endregion [增]

        #region [改]
        #region 修改“单条数据”
        /// <summary>修改“单条数据”</summary>
        public override async Task<ApiResult<object>> Edit(CompanyEntity entity, bool isBeginTransaction = true)
        {
            if (entity.Parent != null)
            {
                if (!await _dbSet.AnyAsync(i => i.Id == entity.Parent))
                {
                    return ApiResults<object>.Error($"父公司不存在：{entity.Name}，{entity.Parent}");
                }

                var subIds = await GetSubCompanyIds(entity.Id);
                subIds.Add(entity.Id); // 包含自身
                if (subIds.Contains(entity.Parent.Value))
                {
                    return ApiResults<object>.Error($"父公司不能是后代公司：{entity.Name}，{entity.Parent}");
                }
            }

            return await base.Edit(entity, isBeginTransaction);
        }
        #endregion
        #endregion [改]

        #region [删]
        #region 删除“相关部门”
        private async Task<ApiResult<object>> RemoveDepartment(long id)
        {
            try
            {
                // 获取“相关部门”：
                var departments = await _db.Departments.AsNoTracking().Where(i => i.Company == id).Select(i => i.Id).ToListAsync();

                // 删除“相关部门”：
                var resDepartment = await _departmentService.RemoveRange(departments, false);
            }
            catch (Exception e)
            {
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return ApiResults<object>.OperationSuccess;
        }
        #endregion

        #region 删除“单条数据”
        /// <summary>删除“单条数据”</summary>
        public override async Task<ApiResult<object>> Remove(long id, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 获取“公司”：
                var entity = await _dbSet.FirstOrDefaultAsync(i => i.Id == id);

                // 验证“资源是否存在”：
                if (entity == null)
                {
                    return ApiResults<object>.ResourceNotExist;
                }

                // 删除“相关部门”：
                var resDepartment = await RemoveDepartment(id);
                if (resDepartment.IsError)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    return resDepartment;
                }

                // 删除“后代数据”：
                var subIds = await GetSubCompanyIds(id);
                foreach (var subId in subIds)
                {
                    // 删除“相关部门”：
                    var resDepartment1 = await RemoveDepartment(id);
                    if (resDepartment1.IsError)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        return resDepartment1;
                    }
                }

                // 删除“后代公司”：
                _dbSet.RemoveRange(_dbSet.Where(i => subIds.Contains(i.Id)));

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

                // 删除“公司”：
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

                // 删除“后代数据”：
                var subs = _dbSet.AsNoTracking().Where(i => i.Parent != null && ids.Contains(i.Parent.Value)).Select(i => i.Id);
                foreach (var sub in subs)
                {
                    var resSub = await Remove(sub, false); // 递归删除子公司
                    if (resSub.IsError)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        return resSub;
                    }
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
