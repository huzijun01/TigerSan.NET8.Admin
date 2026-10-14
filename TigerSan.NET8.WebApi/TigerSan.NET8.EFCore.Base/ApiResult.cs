using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class DbResults
    {
        // E:
        public static ApiResult<List<IdName>> EmptyIdNameList { get => ApiResults<List<IdName>>.Success(null, new List<IdName>()); }
    }
}
