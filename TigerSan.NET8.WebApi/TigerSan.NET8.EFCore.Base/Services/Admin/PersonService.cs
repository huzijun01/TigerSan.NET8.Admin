using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class PersonService<TDbContext> :
        IdServiceBase<PersonEntity, TDbContext>, 
        IPersonService
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Ctor】
        public PersonService(TDbContext db) : base(db, db.Persons)
        {
        }

        static PersonService()
        {
            SetDbSetConfig(nameof(PersonEntity.Role))
                .SetParent(typeof(RoleEntity), nameof(_db.Roles), nameof(RoleEntity.Department))
                .SetParent(typeof(DepartmentEntity), nameof(_db.Departments), nameof(DepartmentEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [private]
        /// <summary>获取“完整数据”</summary>
        private async Task<PersonFullEntity> GetPersonFullEntity(PersonEntity person, bool clearPassword = true)
        {
            var entity = new PersonFullEntity();

            entity.ShallowCopy(person);
            if (clearPassword) entity.PasswordHash = string.Empty;
            entity.Department = await _db.Roles.Where(r => r.Id == person.Role).Select(r => r.Department).FirstOrDefaultAsync();
            entity.Company = await _db.Departments.Where(d => d.Id == entity.Department).Select(d => d.Company).FirstOrDefaultAsync();

            return entity;
        }
        #endregion [private]

        #region [查]
        #region 获取“完整登录数据”
        /// <summary>获取“完整登录数据”</summary>
        /// <param name="search">用户名/电话/邮箱</param>
        /// <returns></returns>
        public async Task<ApiResult<PersonFullEntity>> GetLoginFull(string search, bool clearPassword = true)
        {
            var res = ApiResults<PersonFullEntity>.OperationSuccess;

            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Username == search || i.Phone != null && i.Phone == search || i.Mail != null && i.Mail == search);
                if (entity == null)
                {
                    return ApiResults<PersonFullEntity>.UserNotExist;
                }

                res.Data = await GetPersonFullEntity(entity, clearPassword);
            }
            catch (Exception e)
            {
                res = ApiResults<PersonFullEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return res;
        }
        #endregion

        #region 获取“完整数据”集合
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<PersonFullEntity>>> GetFullList(
            string? name = null,
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            try
            {
                var list = new List<PersonFullEntity>();

                var queryable = _dbSet.AsNoTracking();

                var res = await GetFilter(queryable, filter);
                queryable = res.Data;
                if (queryable == null)
                {
                    return ApiResults<List<PersonFullEntity>>.Error(res.Message);
                }

                if (name != null && name.Trim() != "")
                {
                    queryable = queryable.Where(i => i.Username.Contains(name) || i.Nickname.Contains(name));
                }

                var resSort = queryable.Sort(sort, ascending);
                queryable = resSort.Data;
                if (queryable == null)
                {
                    return ApiResults<List<PersonFullEntity>>.Error(resSort.Message);
                }

                var persons = await queryable.GetPage(pageSize, pageNumber).ToListAsync();

                // 添加“权限”:
                foreach (var person in persons)
                {
                    var entity = await GetPersonFullEntity(person);
                    list.Add(entity);
                }

                return ApiResults<List<PersonFullEntity>>.Success(null, list);
            }
            catch (Exception e)
            {
                return ApiResults<List<PersonFullEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“所属公司”集合
        /// <summary>获取“所属公司”集合</summary>
        public async Task<ApiResult<List<IdName>>> GetBelongCompanyList(List<CompanyEntity>? accessibleCompanies)
        {
            try
            {
                var roles = await _dbSet
                    .AsNoTracking()
                    .Select(i => i.Role)
                    .Distinct()
                    .ToListAsync();

                if (roles.Count < 1) return DbResults.EmptyIdNameList;

                var departments = await _db.Roles
                    .AsNoTracking()
                    .Where(i => roles.Contains(i.Id))
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
                var roles = await _dbSet
                    .AsNoTracking()
                    .Select(i => i.Role)
                    .Distinct()
                    .ToListAsync();

                if (roles.Count < 1) return DbResults.EmptyIdNameList;

                var departments = await _db.Roles
                    .AsNoTracking()
                    .Where(i => roles.Contains(i.Id))
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

        #region 获取“所属角色”集合
        /// <summary>获取“所属角色”集合</summary>
        public async Task<ApiResult<List<IdName>>> GetBelongRoleList(long? department = null)
        {
            try
            {
                var roles = await _dbSet
                    .AsNoTracking()
                    .Select(i => i.Role)
                    .Distinct()
                    .ToListAsync();

                if (roles.Count < 1) return DbResults.EmptyIdNameList;

                var queryable = _db.Roles
                    .AsNoTracking()
                    .Where(i => roles.Contains(i.Id));

                if (department != null)
                {
                    queryable = queryable.Where(i => i.Department == department);
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
        public override async Task<ApiResult<PersonEntity>> Add(PersonEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                entity.UpdateId();
                entity.PasswordHash = new PasswordHasher<PersonEntity>().HashPassword(entity, entity.Password);
                _dbSet.Add(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return ApiResults<PersonEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return ApiResults<PersonEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [增]

        #region [改]
        #region 修改“单条数据”
        /// <summary>修改“单条数据”</summary>
        public override async Task<ApiResult<object>> Edit(PersonEntity entity, bool isBeginTransaction = true)
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

                if (entity.Password.Trim() == "")
                {
                    entity.PasswordHash = find.PasswordHash; // 保持原密码不变
                }
                else
                {
                    entity.PasswordHash = new PasswordHasher<PersonEntity>().HashPassword(entity, entity.Password);
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
        #endregion 【Functions】
    }
}
