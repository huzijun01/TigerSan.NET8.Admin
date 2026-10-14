using System.Text.RegularExpressions;

namespace TigerSan.WebApi.Base
{
    public static class Verify
    {
        #region 是否为“有效MAC地址”
        public static bool IsValidMacAddr(string? macAddress)
        {
            if (string.IsNullOrWhiteSpace(macAddress)) return false;

            string pattern = @"^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$|^[0-9A-Fa-f]{12}$";
            return Regex.IsMatch(macAddress, pattern);
        }
        #endregion

        #region 经纬度验证
        /// <summary>
        /// 验证经度是否有效
        /// 有效范围：-180 <= Longitude <= 180
        /// </summary>
        /// <param name="longitude">经度值，可为空</param>
        /// <returns>如果值在有效范围内返回 true，否则返回 false</returns>
        public static bool IsValidLongitude(double? longitude)
        {
            if (longitude == null) return false;

            double val = longitude.Value;
            return val >= -180 && val <= 180;
        }

        /// <summary>
        /// 验证纬度是否有效
        /// 有效范围：-90 <= Latitude <= 90
        /// </summary>
        /// <param name="latitude">纬度值，可为空</param>
        /// <returns>如果值在有效范围内返回 true，否则返回 false</returns>
        public static bool IsValidLatitude(double? latitude)
        {
            if (latitude == null) return false;

            double val = latitude.Value;
            return val >= -90 && val <= 90;
        }
        #endregion
    }
}
