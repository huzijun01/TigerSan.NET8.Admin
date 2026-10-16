using Newtonsoft.Json;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.WebApi.Share.Packages
{
    /// <summary>“4G定位器”数据包</summary>
    public class Locator4gPackage : PackageBase
    {
        /// <summary>数据</summary>
        [JsonProperty("data")]
        public Locator4gData Data { get; set; } = new Locator4gData();

        #region 【Functions】
        #region 反序列化
        public static new Locator4gPackage? Deserialize(string str)
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
        #endregion 【Functions】
    }

    #region “4G定位器”集合数据
    /// <summary>“4G定位器”数据</summary>
    public class Locator4gData : DataBase
    {
        /// <summary>设备类型</summary>
        [JsonProperty("deviceType")]
        public int DeviceType { get; set; }

        /// <summary>软件版本</summary>
        [JsonProperty("ver")]
        public string Version { get; set; } = string.Empty;

        /// <summary>电池电量</summary>
        [JsonProperty("batV")]
        public int Battery { get; set; }

        /// <summary>国际移动设备识别码</summary>
        [JsonProperty("IMEI")]
        public string IMEI { get; set; } = string.Empty;

        /// <summary>集成电路卡识别码</summary>
        [JsonProperty("ICCID")]
        public string ICCID { get; set; } = string.Empty;

        /// <summary>集中器心跳间隔（分钟）</summary>
        [JsonProperty("heartbeat")]
        public int Heartbeat { get; set; }

        /// <summary>重力传感器</summary>
        [JsonProperty("g")]
        public int? GSensor { get; set; }

        /// <summary>辅小区</summary>
        [JsonProperty("scell")]
        public string SCell { get; set; } = string.Empty;

        /// <summary>邻小区</summary>
        [JsonProperty("ncell")]
        public List<string> NCell { get; set; } = new List<string>();

        /// <summary>WiFi扫描</summary>
        [JsonProperty("wifiScan")]
        public List<WifiScanItem> WifiScan { get; set; } = new List<WifiScanItem>();

        /// <summary>是否“脱落”</summary>
        [JsonIgnore]
        public bool? IsFall { get => GSensor == null ? null : GSensor == 1; }

        #region 获取“修正后的BTS”
        /// <summary>获取“修正后的BTS”</summary>
        public static string NormalizeBtsParameter(string btsParam)
        {
            if (string.IsNullOrWhiteSpace(btsParam))
            {
                LogHelper.Instance.Warning("基站参数不能为空");
                return string.Empty;
            }

            // 1. 按逗号分割
            var parts = btsParam.Split(',');

            // 2. 校验基本格式，至少需要5个字段 (MCC, MNC, LAC, CID, Signal)
            if (parts.Length < 5)
            {
                LogHelper.Instance.Warning($"基站参数格式错误，期望至少5段，实际得到: {btsParam}");
                return string.Empty;
            }

            // 3. 处理最后一段信号强度
            // 获取最后一部分（可能是纯信号值，也可能已经包含多余的位）
            string lastPart = parts[parts.Length - 1].Trim();

            // 尝试解析为整数
            if (!int.TryParse(lastPart, out int signalValue))
            {
                LogHelper.Instance.Warning($"信号强度值无法解析为整数: {lastPart}");
                return string.Empty;
            }

            // 4. 执行除以10操作
            // 注意：C#中整数除法 -690 / 10 = -69，符合预期
            int normalizedSignal = signalValue / 10;

            // 5. 构建标准的前5段数据 (取前4段固定信息 + 新的信号值)
            // 无论输入是5段还是6段，我们只保留前4段基础信息，重新组装后两段
            string mcc = parts[0].Trim();
            string mnc = parts[1].Trim();
            string lac = parts[2].Trim();
            string cid = parts[3].Trim();

            // 6. 组装最终字符串：MCC,MNC,LAC,CID,Signal,Mode
            // 高德IoT接口要求第6位为定位模式，通常固定为0
            string result = $"{mcc},{mnc},{lac},{cid},{normalizedSignal},0";

            return result;
        }
        #endregion

        #region 修正“BTS”
        public void NormalizeBts()
        {
            SCell = NormalizeBtsParameter(SCell);
            for (int i = 0; i < NCell.Count; i++)
            {
                NCell[i] = NormalizeBtsParameter(NCell[i]);
            }
        }
        #endregion
    }
    #endregion

    #region WiFi扫描项
    /// <summary>WiFi扫描项</summary>
    public class WifiScanItem
    {
        /// <summary>MAC地址</summary>
        [JsonProperty("M")]
        public string MacAddr { get; set; } = string.Empty;

        /// <summary>信号强度（原始数据）</summary>
        [JsonProperty("r")]
        public int SignalRaw { get; set; }

        /// <summary>信号强度</summary>
        [JsonIgnore]
        public int Signal { get => -SignalRaw; }
    }
    #endregion
}
