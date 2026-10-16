using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public delegate Task<ApiResult<object>> DbIdDelegate<TDbContext>(TDbContext db, long id) where TDbContext : DbContextBase<TDbContext>;
    public delegate Task<ApiResult<object>> DbIdsDelegate<TDbContext>(TDbContext db, IList<long> ids) where TDbContext : DbContextBase<TDbContext>;
}
