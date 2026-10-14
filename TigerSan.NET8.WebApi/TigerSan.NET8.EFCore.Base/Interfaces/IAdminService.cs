using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public interface IAdminService : IIdNameServiceBase<AdminEntity>
    {
        public Task<ApiResult<AdminEntity>> GetByName(string name, bool clearPassword = true);
    }
}
