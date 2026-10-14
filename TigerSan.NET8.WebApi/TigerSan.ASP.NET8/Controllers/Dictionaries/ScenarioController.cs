using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    public class ScenarioController : IdNameControllerBase<ScenarioEntity, IScenarioService>
    {
        #region 【Ctor】
        public ScenarioController(IScenarioService service) : base(service)
        {
        }
        #endregion 【Ctor】
    }
}
