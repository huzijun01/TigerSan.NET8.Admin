using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Services.Models
{
    public class ScenarioService : IdNameServiceBase<ScenarioEntity, AppDbContext>, IScenarioService
    {
        #region 【Ctor】
        public ScenarioService(AppDbContext db) : base(db, db.Scenarios)
        {
        }
        #endregion 【Ctor】
    }
}
