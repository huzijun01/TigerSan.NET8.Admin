using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public interface IIdNameServiceBase<TEntity> : IIdServiceBase<TEntity> where TEntity : IdName
    {
        // 查:
        /// <summary>获取“ID名称对”集合</summary>
        public Task<ApiResult<List<IdName>>> SelectIdName(bool? isDistinct = null, FilterDto? filter = null);
    }
}
