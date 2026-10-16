using System;
using System.Text;

namespace TigerSan.WebApi.Base
{
    public static class ExceptionExtension
    {
        #region 获取“信息”
        public static string GetMessage(this Exception e)
        {
            var sb = new StringBuilder();
            sb.AppendLine(e.Message);
            if (e.InnerException != null)
            {
                sb.AppendLine(e.InnerException.Message);
            }
            return sb.ToString();
        }
        #endregion
    }
}
