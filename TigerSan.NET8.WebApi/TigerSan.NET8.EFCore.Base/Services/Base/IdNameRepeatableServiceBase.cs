using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class IdNameRepeatableServiceBase<TEntity, TDbContext> :
        IdServiceBase<TEntity, TDbContext>,
        IIdNameServiceBase<TEntity>
        where TEntity : IdName
        where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Ctor】
        public IdNameRepeatableServiceBase(TDbContext db, DbSet<TEntity> dbSet) : base(db, dbSet)
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 获取“ID名称对”集合
        public async Task<ApiResult<List<IdName>>> SelectIdName(bool? isDistinct = null, FilterDto? filter = null)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();
                var res = await GetFilter(queryable, filter);
                if (res.Data == null)
                {
                    return ApiResults<List<IdName>>.Error(res.Message);
                }
                queryable = res.Data;

                var select = queryable.Select(i => new IdName(i));

                if (isDistinct ?? false)
                {
                    select = select.Distinct();
                }

                return ApiResults<List<IdName>>.Success(null, (List<IdName>)await EntityFrameworkQueryableExtensions.ToListAsync<IdName>(select));
            }
            catch (Exception e)
            {
                return ApiResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]
        #endregion 【Functions】
    }
}
