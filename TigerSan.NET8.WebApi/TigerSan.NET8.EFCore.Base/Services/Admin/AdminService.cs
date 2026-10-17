using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class AdminService<TDbContext> :
        IdNameServiceBase<AdminEntity, TDbContext>,
        IAdminService
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Ctor】
        public AdminService(TDbContext db) : base(db, db.Admins)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 根据“名称”获取“数据”
        /// <summary>根据“名称”获取“数据”</summary>
        public async Task<ApiResult<AdminEntity>> GetByName(string name, bool clearPassword = true)
        {
            var res = ApiResults<AdminEntity>.OperationSuccess;

            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Name == name);
                if (entity == null)
                {
                    return ApiResults<AdminEntity>.UserNotExist;
                }

                if (clearPassword) entity.PasswordHash = string.Empty;
                res.Data = entity;
            }
            catch (Exception e)
            {
                res = ApiResults<AdminEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return res;
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        /// <summary>添加“单条数据”</summary>
        public override async Task<ApiResult<AdminEntity>> Add(AdminEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                entity.UpdateId();
                entity.PasswordHash = new PasswordHasher<AdminEntity>().HashPassword(entity, entity.Password);
                _dbSet.Add(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return ApiResults<AdminEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return ApiResults<AdminEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [增]

        #region [改]
        #region 修改“单条数据”
        /// <summary>修改“单条数据”</summary>
        public override async Task<ApiResult<object>> Edit(AdminEntity entity, bool isBeginTransaction = true)
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
                    entity.PasswordHash = new PasswordHasher<AdminEntity>().HashPassword(entity, entity.Password);
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
