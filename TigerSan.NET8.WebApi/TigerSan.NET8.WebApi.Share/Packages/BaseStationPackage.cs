using Newtonsoft.Json;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.WebApi.Share.Packages
{
    /// <summary>基站定位模式</summary>
    public enum StationLocationModes
    {
        WifiScan = 1,
        AGPS = 2,
        GPS = 3,
    }

    /// <summary>“基站”数据包</summary>
    public class BaseStationPackage : PackageBase
    {
        /// <summary>数据</summary>
        [JsonProperty("data")]
        public BaseStationData Data { get; set; } = new BaseStationData();

        #region 【Functions】
        #region 反序列化
        public static new BaseStationPackage? Deserialize(string str)
        {
            try
            {
                return JsonConvert.DeserializeObject<BaseStationPackage>(str);
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

    #region “基站”数据
    /// <summary>“基站”数据</summary>
    public class BaseStationData : DataBase
    {
        /// <summary>经度</summary>
        [JsonProperty("j")]
        public double Longitude { get; set; }

        /// <summary>纬度</summary>
        [JsonProperty("w")]
        public double Latitude { get; set; }

        /// <summary>定位模式</summary>
        [JsonProperty("h")]
        public StationLocationModes LocationMode { get; set; }

        /// <summary>标签数据集合（内置蓝牙）</summary>
        [JsonProperty("nodes0")]
        public List<BluetoothTagData> TagDatas0 { get; set; } = new List<BluetoothTagData>();

        /// <summary>标签数据集合（外置蓝牙）</summary>
        [JsonProperty("nodes1")]
        public List<BluetoothTagData> TagDatas1 { get; set; } = new List<BluetoothTagData>();

        /// <summary>经纬度是否可用</summary>
        [JsonIgnore]
        public bool IsValidLngLat { get => Longitude != 0 && Latitude != 0; }
    }
    #endregion

    #region “蓝牙标签”数据
    /// <summary>“蓝牙标签”数据</summary>
    public class BluetoothTagData
    {
        /// <summary>标签ID</summary>
        [JsonProperty("M")]
        public string TagId { get; set; } = string.Empty;

        /// <summary>电量</summary>
        [JsonProperty("b")]
        public int Battery { get; set; }

        /// <summary>温度</summary>
        [JsonProperty("t")]
        public double Temperature { get; set; }

        /// <summary>信号强度（原始数据）</summary>
        [JsonProperty("r")]
        public int SignalRaw { get; set; }

        /// <summary>状态</summary>
        [JsonProperty("w")]
        public int Status { get; set; }

        /// <summary>信号强度</summary>
        [JsonIgnore]
        public int Signal { get => 256 - SignalRaw; }

        /// <summary>是否“脱落”</summary>
        [JsonIgnore]
        public bool? IsFall { get => (Status & (1 << 2)) != 0 ? (Status & (1 << 3)) != 0 : null; }
    }
    #endregion
}
