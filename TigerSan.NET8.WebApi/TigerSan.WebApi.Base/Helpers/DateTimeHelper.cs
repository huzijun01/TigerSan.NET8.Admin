using System;

namespace TigerSan.WebApi.Base
{
    public static class DateTimeHelper
    {
        #region 获取“当前UTC时间”
        /// <summary>当前UTC时间</summary>
        public static DateTime GetUtcNow()
        {
            return DateTime.UtcNow.AddHours(8);
        }
        #endregion
    }
}
