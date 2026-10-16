using Newtonsoft.Json;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.WebApi.Share.Packages
{
    public static class PackageType
    {
        /// <summary>基站</summary>
        public static string BaseStation = "bluetooth_tag_data";
        /// <summary>4G定位器</summary>
        public static string Locator4g = "locator4g_position_data";
    }

    public class PackageBase
    {
        /// <summary>类型</summary>
        [JsonProperty("type")]
        public string Type { get; set; } = string.Empty;

        /// <summary>上报时间</summary>
        [JsonProperty("timestamp")]
        public string ReportTime { get; set; } = string.Empty;

        #region 【Functions】
        #region 反序列化
        public static PackageBase? Deserialize(string str)
        {
            try
            {
                return JsonConvert.DeserializeObject<Locator4gPackage>(str);
            }
            catch (Exception e)
            {
                LogHelper.Instance.Error(e.GetMessage());
            }

            return null;
        }
        #endregion

        #region 序列化
        public string Serialize()
        {
            try
            {
                return JsonConvert.SerializeObject(this, Formatting.Indented);
            }
            catch (Exception e)
            {
                LogHelper.Instance.Error(e.GetMessage());
            }

            return string.Empty;
        }
        #endregion
        #endregion 【Functions】
    }

    public class DataBase
    {
        /// <summary>命令</summary>
        [JsonProperty("cmd")]
        public int Command { get; set; }

        /// <summary>上报ID</summary>
        [JsonProperty("rId")]
        public int ReportId { get; set; }

        /// <summary>主题</summary>
        [JsonProperty("topic")]
        public string Topic { get; set; } = string.Empty;

        /// <summary>采集器ID（MAC地址）</summary>
        public string CollectorId { get => Topic.Split('/').Last(); }
    }
}
