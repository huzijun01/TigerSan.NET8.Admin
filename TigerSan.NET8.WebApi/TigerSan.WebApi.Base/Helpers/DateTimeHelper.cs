using System;
using System.Globalization;
using TigerSan.CsvLog;

namespace TigerSan.WebApi.Base
{
    public static class DateTimeHelper
    {
        #region  获取北京时区信息
        /// <summary>
        /// 获取北京时区信息。
        /// 兼容 Windows 和 Linux/macOS
        /// </summary>
        public static TimeZoneInfo GetBeijingTimeZoneInfo()
        {
            try
            {
                // 优先尝试 IANA 时区 ID (Linux/macOS/.NET 6+ Windows 均支持)
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Shanghai");
            }
            catch (TimeZoneNotFoundException)
            {
                try
                {
                    // 回退到 Windows 时区 ID
                    return TimeZoneInfo.FindSystemTimeZoneById("China Standard Time");
                }
                catch (TimeZoneNotFoundException)
                {
                    // 极端情况：如果都找不到，抛出异常或返回固定偏移
                    // 这里选择抛出异常，因为静默失败可能导致更严重的数据错误
                    throw new InvalidOperationException("Unable to find Beijing Time Zone info on this system.");
                }
            }
        }
        #endregion

        #region 获取“当前北京时间”
        /// <summary>获取“当前北京时间”</summary>
        public static DateTime GetBeijingNow()
        {
            TimeZoneInfo beijingZone = GetBeijingTimeZoneInfo();

            // 将当前 UTC 时间转换为北京时间
            return TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, beijingZone).DateTime;
        }
        #endregion

        #region 获取“北京时间”
        /// <summary>
        /// 将传入的日期字符串转化为北京时间。
        /// </summary>
        /// <param name="strTime">日期字符串</param>
        /// <param name="ignoreZ">
        /// true: 忽略字符串中的时区信息/Kind，直接将解析出的“时分秒”视为北京时间返回（适用于上游错误标记Kind的场景）。
        /// false: 正常进行时区转换，确保返回的是物理意义上的北京时间。
        /// </param>
        /// <returns>代表北京时间的 DateTime (Kind 通常为 Unspecified 或 Local，取决于具体需求，此处保持与无参方法一致的逻辑)</returns>
        public static DateTime GetBeijingNow(string strTime, bool ignoreZ = false)
        {
            if (string.IsNullOrWhiteSpace(strTime))
            {
                LogHelper.Instance.Warning($"Input time string is null or empty.");
                return GetBeijingNow();
            }

            DateTime parsedTime;
            // 使用 RoundtripKind 尽量保留原始字符串中的时区意图，或者使用 AdjustToUniversal 等
            // 这里使用 InvariantCulture 避免区域设置干扰
            bool success = DateTime.TryParse(strTime, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out parsedTime);

            if (!success)
            {
                LogHelper.Instance.Warning($"Invalid time format: '{strTime}', fallback to current Beijing time.");
                return GetBeijingNow();
            }

            TimeZoneInfo beijingZone = GetBeijingTimeZoneInfo();

            // 上游可能已经把 UTC+8 的时间算好了，但错误地标记为 DateTimeKind.Utc。
            if (ignoreZ)
            {
                // 不再进行时区偏移计算。
                return DateTime.SpecifyKind(parsedTime, DateTimeKind.Unspecified);
            }
            else
            {
                // 目标：无论输入是 Utc、Local 还是 Unspecified，都要转换成准确的北京时间。
                switch (parsedTime.Kind)
                {
                    case DateTimeKind.Utc:
                        // 如果明确是 UTC，直接转换为北京时间
                        return TimeZoneInfo.ConvertTimeFromUtc(parsedTime, beijingZone);

                    case DateTimeKind.Local:
                        // 如果是本地时间，先转为 UTC，再转为北京时间（防止本地时区不是北京时区的情况）
                        return TimeZoneInfo.ConvertTime(parsedTime, beijingZone);

                    case DateTimeKind.Unspecified:
                    default:
                        // 对于未指定类型的时间，最安全的做法通常是假设它为 UTC（如果是国际标准接口）
                        return TimeZoneInfo.ConvertTimeFromUtc(parsedTime, beijingZone);
                }
            }
        }
        #endregion
    }
}
