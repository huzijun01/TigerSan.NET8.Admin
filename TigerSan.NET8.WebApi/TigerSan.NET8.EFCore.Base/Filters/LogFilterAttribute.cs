using System.Text;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class LogFilterAttribute : Attribute, IAsyncActionFilter
    {
        #region [Private]
        #region 获取“请求体”字符串
        private static string GetBodyString(ActionExecutingContext? context)
        {
            if (context == null)
            {
                LogHelper.Instance.IsNull(nameof(context));
                return string.Empty;
            }

            string strRes;

            try
            {
                var body = context.ActionArguments.FirstOrDefault().Value;
                if (body == null) return string.Empty;

                strRes = JsonConvert.SerializeObject(body, Formatting.Indented);
            }
            catch (Exception e)
            {
                strRes = e.GetMessage();
            }

            return string.IsNullOrEmpty(strRes) ? string.Empty : $"Body: {Environment.NewLine}{strRes}";
        }
        #endregion

        #region 获取“结果”字符串
        private static string GetResultString(ActionExecutedContext? context)
        {
            if (context == null)
            {
                LogHelper.Instance.IsNull(nameof(context));
                return string.Empty;
            }

            string strRes;
            try
            {
                var objResult = context.Result as ObjectResult;
                if (objResult == null)
                {
                    strRes = $"The {nameof(objResult)} is null!";
                }
                else
                {
                    var actionResult = objResult.Value as ApiResults<object>;
                    if (actionResult == null)
                    {
                        strRes = JsonConvert.SerializeObject(objResult.Value, Formatting.Indented);
                    }
                    else
                    {
                        strRes = JsonConvert.SerializeObject(actionResult, Formatting.Indented);
                    }
                }
            }
            catch (Exception e)
            {
                strRes = e.GetMessage();
            }
            return strRes;
        }
        #endregion
        #endregion [Private]

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"[Begin]");
            sb.AppendLine($"Controller: {context.RouteData.Values["controller"]}");
            sb.AppendLine($"Action: {context.RouteData.Values["action"]}");
            sb.AppendLine(GetBodyString(context));
            LogHelper.Instance.ColorWriteLine(sb.ToString(), ConsoleColor.Green);

            var res = await next();
            string strRes = GetResultString(res);

            sb.Clear();
            sb.AppendLine($"[End]");
            sb.AppendLine($"Controller: {context.RouteData.Values["controller"]}");
            sb.AppendLine($"Action: {context.RouteData.Values["action"]}");
            sb.AppendLine($"Result: ");
            sb.AppendLine(strRes);
            LogHelper.Instance.ColorWriteLine(sb.ToString(), ConsoleColor.Cyan);
        }
    }
}
