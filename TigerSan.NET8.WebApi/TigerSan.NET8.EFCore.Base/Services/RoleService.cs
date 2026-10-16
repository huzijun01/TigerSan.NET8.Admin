using System.Data;
using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class RoleService<TDbContext> :
        IdNameServiceBase<RoleEntity, TDbContext>,
        IRoleService
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Fields】
        private IAuthorityService _authorityService;
        #endregion 【Fields】

        #region 【Ctor】
        static RoleService()
        {
            SetDbSetConfig(nameof(RoleEntity.Department))
                .SetParent(typeof(DepartmentEntity), nameof(_db.Departments), nameof(DepartmentEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public RoleService(TDbContext db, IAuthorityService authorityService) : base(db, db.Roles)
        {
            _authorityService = authorityService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [Private]
        #region 过滤权限
        /// <summary>过滤权限</summary>
        private async Task<ApiResult<object>> FilterAuthorities(UserInfo userInfo, List<AuthorityEntity> authorities)
        {
            var res = ApiResults<object>.OperationSuccess;

            if (userInfo.IsRoot) return res;

            var finds = await _db.Authorities.Where(a => a.Role == userInfo.Role).ToListAsync();

            var unavailables = new List<AuthorityEntity>();

            foreach (var authority in authorities)
            {
                var find = finds.FirstOrDefault(i => i.Path == authority.Path);
                if (find == null)
                {
                    unavailables.Add(authority);
                    res = ApiResults<object>.SomeAuthoritiesUnavailable;
                    continue;
                }

                if (find.IsReadonly && !authority.IsReadonly)
                {
                    authority.IsReadonly = true;
                    res = ApiResults<object>.SomeAuthoritiesUnavailable;
                    continue;
                }
            }

            unavailables.ForEach(u => authorities.Remove(u));

            return res;
        }
        #endregion
        #endregion [Private]

        #region [查]
        #region 获取“完整数据”集合
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<RoleAuthorityEntity>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            var list = new List<RoleAuthorityEntity>();

            try
            {
                var res = await base.GetList(pageSize, pageNumber, sort, ascending, filter);
                var roles = res.Data;
                if (roles == null)
                {
                    return ApiResults<List<RoleAuthorityEntity>>.Error(res.Message);
                }

                // 添加“权限”:
                foreach (var role in roles)
                {
                    var authorities = await _authorityService.GetListByRole(role.Id);
                    var entity = new RoleAuthorityEntity();
                    entity.ShallowCopy(role);
                    entity.Authorities = authorities;
                    entity.Company = await _db.Departments.Where(d => d.Id == role.Department).Select(d => d.Company).FirstOrDefaultAsync();

                    list.Add(entity);
                }

                return ApiResults<List<RoleAuthorityEntity>>.Success(null, list);
            }
            catch (Exception e)
            {
                return ApiResults<List<RoleAuthorityEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“所属公司”集合
        /// <summary>获取“所属公司”集合</summary>
        public async Task<ApiResult<List<IdName>>> GetBelongCompanyList(List<CompanyEntity>? accessibleCompanies)
        {
            try
            {
                var departments = await _dbSet
                    .AsNoTracking()
                    .Select(i => i.Department)
                    .Distinct()
                    .ToListAsync();

                if (departments.Count < 1) return DbResults.EmptyIdNameList;

                var companys = await _db.Departments
                    .AsNoTracking()
                    .Where(d => departments.Contains(d.Id))
                    .Select(d => d.Company)
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
                    .Select(i => new IdName(i.Id, i.Name))
                    .ToListAsync();

                return ApiResults<List<IdName>>.Success(null, list);
            }
            catch (Exception e)
            {
                return ApiResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“所属部门”集合
        /// <summary>获取“所属部门”集合</summary>
        public async Task<ApiResult<List<IdName>>> GetBelongDepartmentList(long? company = null)
        {
            try
            {
                var departments = await _dbSet
                    .AsNoTracking()
                    .Select(i => i.Department)
                    .Distinct()
                    .ToListAsync();

                if (departments.Count < 1) return DbResults.EmptyIdNameList;

                var queryable = _db.Departments
                    .AsNoTracking()
                    .Where(i => departments.Contains(i.Id));

                if (company != null)
                {
                    queryable = queryable.Where(i => i.Company == company);
                }

                var list = await queryable
                    .Select(i => new IdName(i.Id, i.Name))
                    .ToListAsync();

                return ApiResults<List<IdName>>.Success(null, list);
            }
            catch (Exception e)
            {
                return ApiResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        /// <summary>添加“单条数据”</summary>
        public async Task<ApiResult<object>> Add(UserInfo userInfo, RoleAuthorityEntity entity, bool isBeginTransaction = true)
        {
            var res = ApiResults<object>.OperationSuccess;
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 验证“名称是否重复”：
                if (await _dbSet.AnyAsync(r => r.Department == entity.Department && r.Name == entity.Name))
                {
                    return ApiResults<object>.NameRepeated;
                }

                // 过滤权限：
                var resFilterAuthorities = await FilterAuthorities(userInfo, entity.Authorities);
                if (!resFilterAuthorities.IsSuccess) res = resFilterAuthorities;

                // 更新“ID”：
                entity.UpdateId();
                entity.Authorities.UpdateId();
                entity.Authorities.ForEach(a => a.Role = entity.Id); // 设置“权限”的“角色ID”

                // 添加“数据”：
                _dbSet.Add(entity);
                // “保存更改”：
                await _db.SaveChangesAsync();

                // 添加“权限”：
                var resSub = await _authorityService.AddRange(entity.Authorities, false);
                if (resSub.IsError)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    return resSub;
                }

                // “提交事务”：
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
            }
            catch (Exception e)
            {
                res = ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
            }

            return res;
        }
        #endregion

        #region 添加“多条数据”
        /// <summary>添加“多条数据”</summary>
        public async Task<ApiResult<object>> AddRange(UserInfo userInfo, List<RoleAuthorityEntity> entities, bool isBeginTransaction = true)
        {
            var res = ApiResults<object>.OperationSuccess;
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 验证“名称是否重复”：
                foreach (var entity in entities)
                {
                    if (await _dbSet.AnyAsync(i => i.Department == entity.Department && i.Name == entity.Name))
                    {
                        return ApiResults<object>.NameRepeated;
                    }
                }

                // 更新“ID”：
                entities.UpdateId();

                foreach (var entity in entities)
                {
                    // 过滤权限：
                    var resFilterAuthorities = await FilterAuthorities(userInfo, entity.Authorities);
                    if (!resFilterAuthorities.IsSuccess) res = resFilterAuthorities;

                    // 更新“ID”：
                    entity.Authorities.UpdateId();

                    // 添加“权限”：
                    var resSub = await _authorityService.AddRange(entity.Authorities, false);
                    if (resSub.IsError)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        return resSub;
                    }
                }

                // 添加“数据”：
                await _dbSet.AddRangeAsync(entities);

                // “保存更改”并“提交事务”：
                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
            }
            catch (Exception e)
            {
                res = ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
            }

            return res;
        }
        #endregion
        #endregion [增]

        #region [改]
        #region 修改“单条数据”
        /// <summary>修改“单条数据”</summary>
        public async Task<ApiResult<object>> Edit(UserInfo userInfo, RoleAuthorityEntity entity, bool isBeginTransaction = true)
        {
            var res = ApiResults<object>.OperationSuccess;
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            if (userInfo.Role == entity.Id) return ApiResults<object>.CannotModifyOwnRole;

            try
            {
                // 验证“资源是否存在”：
                var find = await _dbSet.FirstOrDefaultAsync(i => i.Id == entity.Id);
                if (find == null)
                {
                    return ApiResults<object>.ResourceNotExist;
                }

                // 验证“名称是否重复”：
                if (await _dbSet.AnyAsync(r => r.Department == find.Department && r.Name == entity.Name && r.Id != find.Id))
                {
                    return ApiResults<object>.NameRepeated;
                }

                // 更新“数据”：
                find.Name = entity.Name;

                // 删除“角色”相关的“权限”：
                await _db.Authorities.Where(a => a.Role == entity.Id).ExecuteDeleteAsync();

                // 过滤权限：
                var resFilterAuthorities = await FilterAuthorities(userInfo, entity.Authorities);
                if (!resFilterAuthorities.IsSuccess) res = resFilterAuthorities;

                // 更新“权限”：
                foreach (var authority in entity.Authorities)
                {
                    authority.UpdateId();
                    authority.Role = entity.Id; // 设置“权限”的“角色ID”
                }

                // 添加“权限”：
                var resAuthority = await _authorityService.AddRange(entity.Authorities, false);
                if (resAuthority.IsError)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    return resAuthority;
                }

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
            }
            catch (Exception e)
            {
                res = ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
            }

            return res;
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
                // 是否已被使用：
                if (await _db.Persons.AnyAsync(p => p.Role == id))
                {
                    return ApiResults<object>.ResourceBeenOccupied;
                }

                // 删除“角色”相关的“权限”：
                await _db.Authorities.Where(a => a.Role == id).ExecuteDeleteAsync();

                // 获取“单条数据”：
                var entity = await _dbSet.FirstOrDefaultAsync(i => i.Id == id);

                // 验证“资源是否存在”：
                if (entity == null)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
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

                // 是否已被使用：
                if (await _db.Persons.AnyAsync(p => ids.Contains(p.Role)))
                {
                    return ApiResults<object>.ResourceBeenOccupied;
                }

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

                // 删除“角色”相关的“权限”：
                await _db.Authorities.Where(a => ids.Contains(a.Role)).ExecuteDeleteAsync();

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
