namespace TigerSan.NET8.EFCore.Base
{
    public class AdminController : IdNameControllerBase<AdminEntity, IAdminService>
    {
        #region 【Ctor】
        public AdminController(IAdminService service) : base(service)
        {
        }
        #endregion 【Ctor】
    }
}
