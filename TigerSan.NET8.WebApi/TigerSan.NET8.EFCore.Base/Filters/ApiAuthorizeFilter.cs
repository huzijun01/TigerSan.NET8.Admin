using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class ApiAuthorizeFilter : IAuthorizationFilter
    {
        #region 【Fields】
        /// <summary>Token信息</summary>
        public static readonly string Token_Info = nameof(Token_Info);
        #endregion 【Fields】

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (context.HasAttribute<NoNeedAuthorizeAttribute>()) return;

            // 是否包含“Authorization头”:
            var authorize = context.GetAuthorization();
            if (string.IsNullOrEmpty(authorize))
            {
                context.Result = new JsonResult(ApiResults<object>.AuthorizationHeaderMissing);
                return;
            }

            // 获取“Token信息”:
            var res = TokenHelper.GetTokenInfo(authorize);
            var tokenInfo = res.Data;
            if (tokenInfo == null)
            {
                context.Result = new JsonResult(res);
                return;
            }

            context.HttpContext.Items.Add(Token_Info, tokenInfo);
        }
    }
}
