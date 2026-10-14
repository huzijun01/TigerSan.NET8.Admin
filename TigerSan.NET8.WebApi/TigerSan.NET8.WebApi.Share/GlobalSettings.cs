namespace TigerSan.NET8.WebApi.Share
{
    public static class GlobalSettings
    {
        /// <summary>最大“坐标”页大小</summary>
        public const int MaxCoordCount = 200;
        /// <summary>“资产记录”保存天数</summary>
        public static double AssetRecordKeepDays = 60;
        /// <summary>“基站记录”保存天数</summary>
        public static double StationRecordKeepDays = 7;
        /// <summary>“距离”阈值（米）</summary>
        public static double DistanceThresholdMeters = 50;
        /// <summary>“滞留”阈值（时）</summary>
        public static double StolidThresholdHours = 24;
        /// <summary>“超时”阈值（时）</summary>
        public static double TimeoutThresholdHours = 24 * 3;
        /// <summary>“标签”上报间隔（秒）</summary>
        public static double TagReportIntervalSeconds = 3600;
        /// <summary>“定位器”上报间隔（秒）</summary>
        public static double LocatorReportIntervalSeconds = 86400 + 3600;
        /// <summary>“MQTT”上报间隔（秒）</summary>
        public static double MqttReportIntervalSeconds = 600;
        /// <summary>“计算”间隔（秒）</summary>
        public static double CalculationIntervalSeconds = 600;
        /// <summary>“在线状态”更新间隔（秒）</summary>
        public static double OnlineStateUpdater_IntervalSeconds = 60;
        /// <summary>“地图”秘钥</summary>
        public static string AMapKey = "10f335d7f69a5534a4b19a30282d896e";
    }
}
