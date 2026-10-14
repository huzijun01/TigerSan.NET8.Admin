using System;
using System.Linq;
using System.Text;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.WebApi.Base
{
    #region 经纬度
    /// <summary>经纬度</summary>
    public class LngLat
    {
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        /// <summary>经纬度是否可用</summary>
        public bool IsValidLngLat { get => Longitude != 0 && Latitude != 0; }

        public LngLat(double longitude, double latitude)
        {
            Longitude = longitude;
            Latitude = latitude;
        }
    }
    #endregion

    #region 位置
    /// <summary>位置</summary>
    public class Location
    {
        public double? Longitude { get; set; }
        public double? Latitude { get; set; }
        public string? Address { get; set; }
        /// <summary>经纬度是否可用</summary>
        public bool IsValidLngLat { get => Longitude != null && Latitude != null && Longitude != 0 && Latitude != 0; }

        public Location(
            double? longitude,
            double? latitude,
            string? address = null)
        {
            Longitude = longitude;
            Latitude = latitude;
            Address = address;
        }
    }
    #endregion

    #region 基站
    public class Cell
    {
        public int MCC { get; set; }
        public int MNC { get; set; }
        public int LAC { get; set; }
        public int CellId { get; set; }
        public int Signal { get; set; }
        public string CellString { get => $"{MCC},{MNC},{LAC},{CellId},{Signal}"; }

        public static Cell? Get(string cellStr)
        {
            var cell = new Cell();
            var parts = cellStr.Split(',');
            if (parts.Length < 5) return null;

            if (!int.TryParse(parts[0], out int mcc)) return null;
            if (!int.TryParse(parts[1], out int mnc)) return null;
            if (!int.TryParse(parts[2], out int lac)) return null;
            if (!int.TryParse(parts[3], out int cellid)) return null;
            if (!int.TryParse(parts[4], out int rawSignal)) return null;

            cell.MCC = mcc;
            cell.MNC = mnc;
            cell.LAC = lac;
            cell.CellId = cellid;
            cell.Signal = rawSignal / 10;

            if (cell.Signal < -100 || cell.Signal > -20)
            {
                //Console.WriteLine($"【基站定位】忽略信号过弱的基站: 原始={rawSignal}, 转换后={signal} dBm");
                return null;
            }

            return cell;
        }
    }
    #endregion

    #region WiFi信息
    public class WifiInfo
    {
        public string Mac { get; set; } = string.Empty;
        public int Signal { get; set; }
        public string? Ssid { get; set; }
        public string ToApiString()
        {
            // 将无分隔符的12位MAC自动转为高德可识别的冒号分隔标准格式
            if (Mac.Length == 12)
            {
                Mac = string.Join(":", Enumerable.Range(0, 6).Select(i => Mac.Substring(i * 2, 2)));
            }
            return $"{Mac},{Signal}";
        }

        public WifiInfo() { }

        public WifiInfo(string mac, int signal, string? ssid = null)
        {
            Mac = mac;
            Signal = signal;
            Ssid = ssid;
        }
    }
    #endregion

    #region 原坐标系枚举
    /// <summary>
    /// 原坐标系枚举
    /// </summary>
    public enum CoordSysType
    {
        /// <summary>
        /// GPS坐标系
        /// </summary>
        gps,
        /// <summary>
        /// MapBar坐标系
        /// </summary>
        mapbar,
        /// <summary>
        /// 百度坐标系
        /// </summary>
        baidu,
        /// <summary>
        /// 高德自身坐标系（不执行转换）
        /// </summary>
        autonavi
    }
    #endregion

    #region 高德坐标转换接口内部响应映射模型
    /// <summary>
    /// 高德坐标转换接口内部响应映射模型
    /// </summary>
    public class AmapConvertApiResponse
    {
        /// <summary>返回状态：值为"0"或"1"，"1"代表接口请求成功，"0"代表接口请求失败</summary>
        public string status { get; set; } = string.Empty;

        /// <summary>返回的状态信息，status为"0"时返回错误原因；请求成功时返回"OK"</summary>
        public string info { get; set; } = string.Empty;

        /// <summary>高德官方状态标识码，常规成功场景返回值为"10000"</summary>
        public string infocode { get; set; } = string.Empty;

        /// <summary>转换之后的坐标结果，多个转换坐标之间使用";"进行分隔和间隔</summary>
        public string locations { get; set; } = string.Empty;
    }
    #endregion

    public static class MapHelper
    {
        #region 根据“WiFi”获取“位置”（2.0）
        public static async Task<ApiResult<Location>> GetLocationByWifiAsync2(
            string amapKey,
            List<WifiInfo> wifiList,
            string? connectedWifiMac = null,
            int? connectedWifiSignal = null,
            string? connectedWifiSsid = null)
        {
            // 参数校验
            if (string.IsNullOrWhiteSpace(amapKey))
                return ApiResults<Location>.Warning("高德地图Key不能为空");

            if (wifiList == null || !wifiList.Any())
                return ApiResults<Location>.Warning("WiFi列表不能为空");

            if (wifiList.Count < 2) return ApiResults<Location>.Warning("WiFi个数过少");

            wifiList = wifiList.OrderByDescending(i => i.Signal).ToList();

            HttpClient? httpClient = null;
            try
            {// 2. 构建 mmac 参数（可选）：当前连接的WiFi，格式同 macs 中的单项
                string mmacParam;
                if (!string.IsNullOrEmpty(connectedWifiMac))
                {
                    // 处理连接WiFi的MAC格式
                    string formattedMac = connectedWifiMac;
                    if (formattedMac.Length == 12)
                    {
                        formattedMac = string.Join(":", Enumerable.Range(0, 6).Select(i => formattedMac.Substring(i * 2, 2)));
                    }
                    // 如果没有提供信号强度，尝试从列表中查找或默认
                    int signal = connectedWifiSignal ?? -70;
                    mmacParam = $"{formattedMac},{signal},,0";
                }
                else
                {
                    var best = wifiList.First();
                    wifiList.Remove(best);
                    mmacParam = $"{best.ToApiString()},,0";
                }

                // 1. 构建 macs 参数：格式为 mac,signal,,0，多个WiFi用 | 分隔
                var macsParts = wifiList.Select(w => $"{w.ToApiString()},,0");
                string macsParam = string.Join("|", macsParts);

                // 3. 构建查询字符串
                var queryParams = new List<string>
                {
                    $"key={Uri.EscapeDataString(amapKey)}",
                    "accesstype=2", // 固定值，表示通过WiFi定位
                    "show_fields=formatted_address,addressComponent", // 固定值，WiFi网络
                    $"mmac={Uri.EscapeDataString(mmacParam)}",
                    $"macs={Uri.EscapeDataString(macsParam)}",
                };

                string queryString = string.Join("&", queryParams);
                string url = $"https://restapi.amap.com/v5/position/IoT?{queryString}";

                // 4. 创建 HttpClient 并发送请求
                httpClient = new HttpClient() { Timeout = TimeSpan.FromSeconds(10) };
                // 设置超时时间，避免长时间等待

                var response = await httpClient.PostAsync(url, null);

                if (!response.IsSuccessStatusCode)
                {
                    return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"HTTP请求失败: {response.StatusCode}"));
                }

                string content = await response.Content.ReadAsStringAsync();

                // 5. 解析响应
                // 使用简单的JSON解析，避免引入额外重型库依赖，这里假设使用 System.Text.Json
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;

                // 检查业务状态码
                string status = root.GetProperty("status").GetString() ?? "0";
                string info = root.GetProperty("info").GetString() ?? "";

                if (status != "1")
                {
                    return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"高德API返回错误: {info} (Infocode: {root.GetProperty("infocode").GetString()})"));
                }

                // 提取位置信息
                double? longitude = null;
                double? latitude = null;
                string? address = null;

                if (root.TryGetProperty("position", out JsonElement positionElement) &&
                    positionElement.TryGetProperty("location", out JsonElement locationElement))
                {
                    string locStr = locationElement.GetString() ?? "";
                    var coords = locStr.Split(',');
                    if (coords.Length == 2 &&
                        double.TryParse(coords[0], out var lng) &&
                        double.TryParse(coords[1], out var lat))
                    {
                        longitude = lng;
                        latitude = lat;
                    }
                }

                // 提取地址信息
                if (root.TryGetProperty("formatted_address", out JsonElement addrElement))
                {
                    address = addrElement.GetString();
                }

                // 如果经纬度无效，返回警告
                if (longitude <= 0 || latitude <= 0)
                {
                    return ApiResults<Location>.Warning("未能获取有效的经纬度信息");
                }

                var locationResult = new Location(longitude, latitude, address);
                return ApiResults<Location>.Success(null, locationResult);
            }
            catch (Exception ex)
            {
                return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"定位请求异常: {ex.Message}"));
            }
            finally
            {
                // 确保释放 HttpClient 资源
                httpClient?.Dispose();
            }
        }
        #endregion

        #region 根据“移动基站”获取“位置”（2.0）
        public static async Task<ApiResult<Location>> GetLocationByCellTowersAsync2(
            string amapKey,
            string bts,
            List<string>? ncells = null,
            string? imei = null)
        {
            // 前置参数校验
            if (string.IsNullOrWhiteSpace(amapKey))
                return ApiResults<Location>.Warning("高德地图Key不能为空");

            if (string.IsNullOrWhiteSpace(bts))
                return ApiResults<Location>.Warning("主基站bts参数不能为空");

            // 复用静态HttpClient避免频繁创建销毁导致的端口占用问题，统一设置10秒超时
            using var httpClient = new HttpClient() { Timeout = TimeSpan.FromSeconds(10) };
            try
            {
                // 构造全量合规请求参数，完全匹配示例代码的参数结构
                var parameters = new Dictionary<string, string>
                {
                    {"key", amapKey},
                    {"accesstype", "1"}, // 固定值，指定基站定位模式
                    {"cdma", "0"}, // 固定值，标记为非CDMA网络，避免触发参数校验不通过
                    {"network", "GSM"}, // 固定值，兼容国内主流移动网络类型
                    {"bts", bts}, // 主基站参数，格式遵循 [MCC,MNC,LAC,CID,信号强度,定位模式] 规范
                    {"show_fields", "formatted_address,addressComponent"} // 返回格式化地址与地址组件
                };

                // 非空时追加可选参数
                if (!string.IsNullOrWhiteSpace(imei))
                {
                    parameters.Add("diu", imei); // 设备唯一标识，规避20001必填参数缺失错误
                }

                if (ncells != null && ncells.Any())
                {
                    // 多个邻区基站用 | 拼接为标准格式
                    parameters.Add("ncells", string.Join("|", ncells));
                }

                // 安全编码拼接查询字符串，彻底避免特殊字符导致的ILLEGAL_REQUEST非法请求错误
                var queryList = new List<string>();
                foreach (var kv in parameters)
                {
                    queryList.Add($"{kv.Key}={kv.Value}");
                }
                string fullUrl = $"https://restapi.amap.com/v5/position/IoT?{string.Join("&", queryList)}";

                // 发送空Body的POST请求，完全对齐示例的请求逻辑
                var response = await httpClient.PostAsync(fullUrl, new StringContent(""));
                if (!response.IsSuccessStatusCode)
                {
                    return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"HTTP请求失败: {response.StatusCode}"));
                }

                string content = await response.Content.ReadAsStringAsync();

                // 结构化解析响应内容
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;

                string status = root.GetProperty("status").GetString() ?? "0";
                string info = root.GetProperty("info").GetString() ?? "";
                string infocode = root.GetProperty("infocode").GetString() ?? "";

                if (status != "1")
                {
                    // 针对历史出现过的错误码做分类提示，快速定位问题
                    switch (infocode)
                    {
                        case "10001":
                            return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"高德API返回密钥无效: {info} (Infocode: {infocode})"));
                        case "20002":
                            return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"高德API返回非法请求: 请检查基站参数格式是否合规，信号强度单位是否为dBm的合理区间"));
                        default:
                            return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"高德API返回错误: {info} (Infocode: {infocode})"));
                    }
                }

                // 提取经纬度信息
                double? longitude = null;
                double? latitude = null;
                string? address = null;

                if (root.TryGetProperty("position", out JsonElement positionElement) &&
                    positionElement.TryGetProperty("location", out JsonElement locationElement))
                {
                    string locStr = locationElement.GetString() ?? "";
                    var coords = locStr.Split(',');
                    if (coords.Length == 2 &&
                        double.TryParse(coords[0], out var lng) &&
                        double.TryParse(coords[1], out var lat))
                    {
                        longitude = lng;
                        latitude = lat;
                    }
                }

                // 提取格式化地址
                if (root.TryGetProperty("formatted_address", out JsonElement addrElement))
                {
                    address = addrElement.GetString();
                }

                if (longitude <= 0 || latitude <= 0)
                {
                    return ApiResults<Location>.Warning("未能获取有效的经纬度信息");
                }

                var locationResult = new Location(longitude, latitude, address);
                return ApiResults<Location>.Success(null, locationResult);
            }
            catch (Exception ex)
            {
                return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"定位请求异常: {ex.Message}"));
            }
            finally
            {
                httpClient.Dispose();
            }
        }
        #endregion

        #region 根据“WiFi”获取“位置”（1.0）
        /// <summary>
        /// 通过 WiFi 列表获取地理位置（高德智能硬件定位接口）
        /// </summary>
        /// <param name="wifiList">扫描到的周边 WiFi 列表（需至少2个有效热点）</param>
        /// <param name="connectedWifiMac">当前连接热点的 MAC（可选，提升精度）</param>
        /// <param name="connectedWifiSignal">当前连接热点的信号强度（可选）</param>
        /// <param name="connectedWifiSsid">当前连接热点的 SSID（可选）</param>
        /// <param name="amapKey">高德 Web 服务 Key</param>
        public static async Task<ApiResult<Location>> GetLocationByWifiAsync1(
            string amapKey,
            IList<WifiInfo> wifiList,
            string? connectedWifiMac = null,
            int? connectedWifiSignal = null,
            string? connectedWifiSsid = null)
        {
            // 1. 基础参数校验
            if (string.IsNullOrEmpty(amapKey))
                return ApiResults<Location>.Warning(LogHelper.Instance.Warning("高德 Key 不能为空"));

            if (wifiList == null || !wifiList.Any())
                return ApiResults<Location>.Warning(LogHelper.Instance.Warning("无有效 WiFi 数据"));

            // 2. 过滤无效数据并限制数量（高德要求2-30个）
            var validWifis = wifiList
                .Where(w => !string.IsNullOrEmpty(w.Mac) && w.Signal != 0)
                .Take(30)
                .ToList();

            if (validWifis.Count < 2)
                return ApiResults<Location>.Warning(LogHelper.Instance.Warning("WiFi 数量不足2个，无法精准定位"));

            // 3. 构建请求 URL
            var httpClient = new HttpClient() { Timeout = TimeSpan.FromSeconds(10) };
            const string apiUrl = "https://apilocate.amap.com/position";

            var urlBuilder = new StringBuilder();
            urlBuilder.Append($"{apiUrl}?accesstype=1"); // 1: WiFi定位
            urlBuilder.Append($"&key={Uri.EscapeDataString(amapKey)}");
            urlBuilder.Append("&output=json");

            // 4. 组装 macs 参数 (格式: mac1,signal1|mac2,signal2...)
            string macsParam = string.Join("|", validWifis.Select(w => w.ToApiString()));
            urlBuilder.Append($"&macs={Uri.EscapeDataString(macsParam)}");

            // 5. 组装 mmac 参数 (当前连接热点，格式: mac,signal,ssid)
            if (!string.IsNullOrEmpty(connectedWifiMac))
            {
                string mmacVal = $"{connectedWifiMac},{connectedWifiSignal ?? 0},{connectedWifiSsid ?? ""}";
                urlBuilder.Append($"&mmac={Uri.EscapeDataString(mmacVal)}");
            }

            try
            {
                // 6. 发送请求
                var response = await httpClient.GetAsync(urlBuilder.ToString());
                if (!response.IsSuccessStatusCode)
                    return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"HTTP请求失败: {response.StatusCode}"));

                var jsonStr = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(jsonStr);
                var root = doc.RootElement;

                // 7. 检查业务状态码
                if (root.TryGetProperty("status", out var statusProp) && statusProp.GetString() == "1")
                {
                    if (root.TryGetProperty("result", out var resultProp))
                    {
                        double? lng = null, lat = null;
                        string? address = null;

                        // 解析坐标 location: "经度,纬度"
                        if (resultProp.TryGetProperty("location", out var locProp))
                        {
                            var coords = locProp.GetString()?.Split(',');
                            if (coords != null && coords.Length == 2)
                            {
                                if (double.TryParse(coords[0], out var parsedLng) &&
                                    double.TryParse(coords[1], out var parsedLat))
                                {
                                    lng = parsedLng;
                                    lat = parsedLat;
                                }
                            }
                        }

                        // 解析地址描述 desc
                        if (resultProp.TryGetProperty("desc", out var descProp))
                            address = descProp.GetString();

                        if (lng.HasValue && lat.HasValue)
                            return ApiResults<Location>.Success(null, new Location(lng, lat, address));

                        return ApiResults<Location>.Warning(LogHelper.Instance.Warning("定位成功但缺少坐标数据"));
                    }

                    // 获取错误信息 info
                    string info = root.TryGetProperty("info", out var infoProp) ? infoProp.GetString() ?? "未知错误" : "未知错误";
                    return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"高德API错误: {info}"));
                }
                else
                {
                    // 处理 status != 1 的情况 (如 Key 无效)
                    string info = root.TryGetProperty("info", out var infoProp) ? infoProp.GetString() ?? "未知错误" : "未知错误";
                    string code = root.TryGetProperty("infocode", out var codeProp) ? codeProp.GetString() ?? "" : "";
                    return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"高德API异常 [{code}]: {info}"));
                }
            }
            catch (Exception ex)
            {
                return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"定位请求异常: {ex.Message}"));
            }
            finally
            {
                httpClient.Dispose();
            }
        }
        #endregion

        #region 根据“移动基站”获取“位置”（1.0）
        /// <summary>根据“移动基站”获取“位置”（1.0）</summary>
        public static async Task<ApiResult<Location>> GetLocationByCellTowersAsync1(
            string amapKey,
            string? scell,
            List<string>? ncells,
            string? imei = null)
        {
            var httpClient = new HttpClient() { Timeout = TimeSpan.FromSeconds(30) };
            const string apiUrl = "http://apilocate.amap.com/position";

            List<Cell> cells = new List<Cell>();

            void AddBaseStation(string cellStr)
            {
                var cell = Cell.Get(cellStr);
                if (cell == null) return;
                cells.Add(cell);
            }

            if (!string.IsNullOrEmpty(scell)) AddBaseStation(scell);
            if (ncells != null)
            {
                foreach (var ncell in ncells) AddBaseStation(ncell);
            }

            var sortedCells = cells.OrderByDescending(i => i.Signal).ToList();

            if (cells.Count < 1)
            {
                return ApiResults<Location>.Warning(LogHelper.Instance.Warning("无有效基站数据"));
            }

            /** bts参数 */
            string btsParam = sortedCells.First().CellString;
            /** nearbts参数 */
            string nearbtsParam = string.Join("|", sortedCells.Skip(1).Take(3).Select(x => x.CellString));

            var urlBuilder = new StringBuilder($"{apiUrl}?accesstype=0&key={Uri.EscapeDataString(amapKey)}&cdma=0&network=GPRS&output=json");
            if (!string.IsNullOrEmpty(imei))
            {
                urlBuilder.Append($"&imei={Uri.EscapeDataString(imei)}");
            }

            urlBuilder.Append($"&bts={Uri.EscapeDataString(btsParam)}");

            if (!string.IsNullOrEmpty(nearbtsParam))
            {
                urlBuilder.Append($"&nearbts={Uri.EscapeDataString(nearbtsParam)}");
            }

            /** 请求URL */
            string requestUrl = urlBuilder.ToString();

            /** 响应 */
            var response = await httpClient.GetAsync(requestUrl);
            var responseStr = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(responseStr);
            var root = doc.RootElement;

            if (root.TryGetProperty("status", out var status) && status.GetString() == "1")
            {
                if (root.TryGetProperty("result", out var result))
                {
                    double? lng = null, lat = null;
                    string? address = null;

                    if (result.TryGetProperty("location", out var locProp))
                    {
                        var locStr = locProp.GetString()?.Split(',');
                        if (locStr?.Length == 2)
                        {
                            double.TryParse(locStr[0], out var parsedLng);
                            double.TryParse(locStr[1], out var parsedLat);
                            lng = parsedLng;
                            lat = parsedLat;
                        }
                    }
                    else if (root.TryGetProperty("location", out var locProp2))
                    {
                        var locStr = locProp2.GetString()?.Split(',');
                        if (locStr?.Length == 2)
                        {
                            double.TryParse(locStr[0], out var parsedLng);
                            double.TryParse(locStr[1], out var parsedLat);
                            lng = parsedLng;
                            lat = parsedLat;
                        }
                    }

                    if (result.TryGetProperty("desc", out var descProp))
                        address = descProp.GetString();
                    else if (root.TryGetProperty("desc", out var descProp2)) address = descProp2.GetString();

                    if (lng.HasValue && lat.HasValue)
                    {
                        return ApiResults<Location>.Success(null, new Location(lng, lat, address));
                    }
                    else
                    {
                        return ApiResults<Location>.Warning(LogHelper.Instance.Warning("高德定位失败: 响应中缺少 location 字段"));
                    }
                }
                else
                {
                    return ApiResults<Location>.Warning(LogHelper.Instance.Warning("高德定位失败: 响应缺少 result 字段"));
                }
            }

            var info = root.TryGetProperty("info", out var infoProp) ? infoProp.GetString() : "未知错误";
            return ApiResults<Location>.Warning(LogHelper.Instance.Warning($"高德定位失败: {info}"));
        }
        #endregion

        #region 根据“位置”获取“地址”
        /// <summary>根据“位置”获取“地址”</summary>
        public static async Task<ApiResult<string>> GetAddressByLocation(
            double lng,
            double lat,
            string amapKey)
        {
            string location = $"{lng},{lat}";
            string url = $"https://restapi.amap.com/v3/geocode/regeo?key={amapKey}&location={location}&extensions=base";

            var response = await new HttpClient() { Timeout = TimeSpan.FromSeconds(30) }.GetAsync(url);
            var json = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (root.GetProperty("status").GetString() != "1")
            {
                return ApiResults<string>.Warning(LogHelper.Instance.Warning($"查询失败：{root.GetProperty("info").GetString()}"));
            }

            var regeocode = root.GetProperty("regeocode");
            var formattedAddress = regeocode.GetProperty("formatted_address").GetString();

            return ApiResults<string>.Success(null, formattedAddress);
        }
        #endregion

        #region 坐标转换（单个）
        public static async Task<ApiResult<LngLat>> ConvertCoordinatesAsync(
            string amapKey,
            double? longitude,
            double? latitude,
            CoordSysType coordSys = CoordSysType.gps)
        {
            if (longitude == null || latitude == null) return ApiResults<LngLat>.Warning(LogHelper.Instance.Warning("经纬度参数不能为空"));

            var res = await ConvertCoordinatesAsync(amapKey, new[] { new LngLat(longitude.Value, latitude.Value) }, coordSys);
            if (res.Data == null || res.Data.Count < 1) return ApiResults<LngLat>.Warning(res.Message);

            return ApiResults<LngLat>.Success(null, res.Data[0]);
        }
        #endregion

        #region 坐标转换（多个）
        public static async Task<ApiResult<List<LngLat>>> ConvertCoordinatesAsync(
            string amapKey,
            IList<LngLat> lngLats,
            CoordSysType coordSys = CoordSysType.gps)
        {
            #region 前置参数合法性校验
            if (string.IsNullOrWhiteSpace(amapKey))
                return ApiResults<List<LngLat>>.Warning(LogHelper.Instance.Warning("高德Web服务API密钥不能为空"));

            // 校验经纬度数值范围合规
            if (lngLats.Count < 1 || lngLats.Count > 40)
                return ApiResults<List<LngLat>>.Warning(LogHelper.Instance.Warning("经纬度数量超出限制，合法范围为1到40"));
            var inputLocations = new List<string>();
            foreach (var lngLat in lngLats)
            {
                if (lngLat.Longitude is < -180 or > 180)
                    return ApiResults<List<LngLat>>.Warning(LogHelper.Instance.Warning("经度参数非法，合法范围为-180到180"));
                if (lngLat.Latitude is < -90 or > 90)
                    return ApiResults<List<LngLat>>.Warning(LogHelper.Instance.Warning("纬度参数非法，合法范围为-90到90"));
                // 按照高德接口要求，经纬度小数点后最多保留6位，避免接口校验不通过
                var formatLng = Math.Round(lngLat.Longitude, 6);
                var formatLat = Math.Round(lngLat.Latitude, 6);
                inputLocations.Add($"{formatLng},{formatLat}");
            }

            var locationParam = string.Join('|', inputLocations);
            #endregion

            var httpClient = new HttpClient() { Timeout = TimeSpan.FromSeconds(10) };
            const string apiUrl = "https://restapi.amap.com/v3/assistant/coordinate/convert?";

            try
            {
                #region 拼接符合高德接口规则的请求URL
                var queryParams = new Dictionary<string, string>
                {
                    ["key"] = amapKey,
                    ["locations"] = locationParam,
                    ["coordsys"] = coordSys.ToString(),
                    ["output"] = "JSON"
                };
                var queryContent = new FormUrlEncodedContent(queryParams);
                var fullRequestUrl = $"{apiUrl}{await queryContent.ReadAsStringAsync()}";
                #endregion

                // 发送请求调用高德坐标转换接口
                var response = await httpClient.GetAsync(fullRequestUrl);
                if (!response.IsSuccessStatusCode)
                    return ApiResults<List<LngLat>>.Warning(LogHelper.Instance.Warning($"HTTP请求失败: {response.StatusCode}"));

                // 解析接口返回的JSON结果
                var responseContent = await response.Content.ReadAsStringAsync();
                var amapResponse = JsonSerializer.Deserialize<AmapConvertApiResponse>(responseContent);

                // 兼容当前附件中返回的10001无效密钥等错误场景
                if (amapResponse == null)
                    return ApiResults<List<LngLat>>.Warning(LogHelper.Instance.Warning("高德接口返回结果解析失败"));
                if (amapResponse.status != "1")
                {
                    return ApiResults<List<LngLat>>.Warning(LogHelper.Instance.Warning($"坐标转换失败，错误信息：{amapResponse.info}，错误码：{amapResponse.infocode}"));
                }

                var outputLocations = amapResponse.locations.Split(';');
                var locations = new List<LngLat>();
                foreach (var location in outputLocations)
                {
                    // 解析转换后的高德坐标
                    var locStr = location.Split(',');
                    if (locStr.Length != 2) return ApiResults<List<LngLat>>.Warning(LogHelper.Instance.Warning("高德返回坐标格式非法"));
                    double.TryParse(locStr[0], out var parsedLng);
                    double.TryParse(locStr[1], out var parsedLat);
                    locations.Add(new LngLat(parsedLng, parsedLat));
                }

                return ApiResults<List<LngLat>>.Success(null, locations);
            }
            catch (Exception ex)
            {
                return ApiResults<List<LngLat>>.Warning(LogHelper.Instance.Warning($"坐标转换请求异常: {ex.Message}"));
            }
            finally
            {
                httpClient.Dispose();
            }
        }
        #endregion

        #region 是否“在围栏内”
        /// <summary>是否“在围栏内”</summary>
        public static bool IsInFence(LngLat point, List<LngLat> fence)
        {
            if (!point.IsValidLngLat || fence == null || fence.Count < 3)
                return false;

            // 将围栏顶点标准化为闭合多边形（自动补全首尾）
            var closedFence = new List<LngLat>(fence);
            if (closedFence[0].Longitude != closedFence[^1].Longitude || closedFence[0].Latitude != closedFence[^1].Latitude)
                closedFence.Add(new LngLat(closedFence[0].Longitude, closedFence[0].Latitude));

            int windingNumber = 0;

            for (int i = 0; i < closedFence.Count - 1; i++)
            {
                var p1 = closedFence[i];
                var p2 = closedFence[i + 1];

                // 跳过无效点
                if (!p1.IsValidLngLat || !p2.IsValidLngLat)
                    continue;

                // 计算从点到边的球面方位角变化
                double lat1 = p1.Latitude * Math.PI / 180.0;
                double lon1 = p1.Longitude * Math.PI / 180.0;
                double lat2 = p2.Latitude * Math.PI / 180.0;
                double lon2 = p2.Longitude * Math.PI / 180.0;
                double latP = point.Latitude * Math.PI / 180.0;
                double lonP = point.Longitude * Math.PI / 180.0;

                // 计算边的经度差（处理跨180度）
                double dLon = lon2 - lon1;
                if (dLon > Math.PI) dLon -= 2 * Math.PI;
                if (dLon < -Math.PI) dLon += 2 * Math.PI;

                // 判断边是否跨越点的经线（向右射线）
                if ((lon1 <= lonP && lon2 > lonP) || (lon2 <= lonP && lon1 > lonP))
                {
                    // 计算边与点所在经线的交点纬度
                    double latIntersect = lat1 + (lat2 - lat1) * (lonP - lon1) / dLon;

                    // 如果交点在点的北方，则绕数+1
                    if (latIntersect > latP)
                        windingNumber += (dLon > 0) ? 1 : -1;
                }
            }

            return windingNumber != 0;
        }
        #endregion
    }

    #region 坐标转换
    public class CoordTransform
    {
        // GCJ02地球椭球参数
        private const double a = 6378245.0;           // 长半轴
        private const double ee = 0.00669342162296594323; // 第一偏心率平方

        // 角度转弧度
        private static double Rad(double d) => d * Math.PI / 180.0;

        // 判断是否在中国境外（直接返回原坐标）
        private static bool OutOfChina(double lng, double lat)
        {
            // 中国大陆大致范围（含南海）
            if (lng < 72.004 || lng > 137.8347) return true;
            if (lat < 0.8293 || lat > 55.8271) return true;
            return false;
        }

        // 纬度偏移计算
        private static double TransformLat(double lng, double lat)
        {
            double ret = -100.0 + 2.0 * lng + 3.0 * lat
                       + 0.2 * lat * lat + 0.1 * lng * lat
                       + 0.2 * Math.Sqrt(Math.Abs(lng));

            ret += (20.0 * Math.Sin(6.0 * lng * Math.PI) + 20.0 * Math.Sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.Sin(lat * Math.PI) + 40.0 * Math.Sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.Sin(lat / 12.0 * Math.PI) + 320 * Math.Sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;

            return ret;
        }

        // 经度偏移计算
        private static double TransformLng(double lng, double lat)
        {
            double ret = 300.0 + lng + 2.0 * lat
                       + 0.1 * lng * lng + 0.1 * lng * lat
                       + 0.1 * Math.Sqrt(Math.Abs(lng));

            ret += (20.0 * Math.Sin(6.0 * lng * Math.PI) + 20.0 * Math.Sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.Sin(lng * Math.PI) + 40.0 * Math.Sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.Sin(lng / 12.0 * Math.PI) + 300.0 * Math.Sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;

            return ret;
        }

        /// <summary>
        /// WGS84转GCJ02（火星坐标）
        /// </summary>
        /// <param name="wgsLng">WGS84经度</param>
        /// <param name="wgsLat">WGS84纬度</param>
        /// <returns>GCJ02坐标 (经度, 纬度)</returns>
        public static (double GcjLng, double GcjLat) WGS84ToGCJ02(double wgsLng, double wgsLat)
        {
            if (OutOfChina(wgsLng, wgsLat))
                return (wgsLng, wgsLat); // 境外直接返回

            double dlat = TransformLat(wgsLng - 105.0, wgsLat - 35.0);
            double dlng = TransformLng(wgsLng - 105.0, wgsLat - 35.0);

            double radLat = Rad(wgsLat);
            double magic = Math.Sin(radLat);
            magic = 1 - ee * magic * magic;
            double sqrtMagic = Math.Sqrt(magic);

            // 纬度偏移
            dlat = (dlat * 180.0) / (a / (sqrtMagic * sqrtMagic) * Math.PI);
            // 经度偏移
            dlng = (dlng * 180.0) / (a / sqrtMagic * Math.Cos(radLat) * Math.PI);

            return (wgsLng + dlng, wgsLat + dlat);
        }
    }
    #endregion
}
