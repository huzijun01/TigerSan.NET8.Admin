namespace TigerSan.NET8.EFCore.Base
{
    public interface IAuthorityService : IIdServiceBase<AuthorityEntity>
    {
        public Task<List<AuthorityEntity>> GetListByRole(long? role = null, int? pageSize = null, int? pageNumber = null);
    }
}
