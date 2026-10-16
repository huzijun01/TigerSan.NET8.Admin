using System.Globalization;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;
using TigerSan.TimerHelper;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Packages;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Helpers
{
    public class PackageChannel : ChannelBase<string>
    {
        #region 【Fields】
        /// <summary>服务提供者</summary>
        private IServiceProvider _serviceProvider;
        /// <summary>“在线状态”更新定时器</summary>
        public ActionTimer _onlineStateUpdater = new ActionTimer(GlobalSettings.OnlineStateUpdater_IntervalSeconds * 1000, true);
        #endregion 【Fields】

        #region 【Properties】
        /// <summary>“标签”服务</summary>
        private ITagService TagService { get => _serviceProvider.CreateScope().ServiceProvider.GetRequiredService<ITagService>(); }
        /// <summary>“场地”服务</summary>
        private ISiteService SiteService { get => _serviceProvider.CreateScope().ServiceProvider.GetRequiredService<ISiteService>(); }
        /// <summary>“基站”服务</summary>
        private IBaseStationService BaseStationService { get => _serviceProvider.CreateScope().ServiceProvider.GetRequiredService<IBaseStationService>(); }
        /// <summary>“资产记录”服务</summary>
        private IAssetRecordService AssetRecordService { get => _serviceProvider.CreateScope().ServiceProvider.GetRequiredService<IAssetRecordService>(); }
        /// <summary>“基站记录”服务</summary>
        private IStationRecordService StationRecordService { get => _serviceProvider.CreateScope().ServiceProvider.GetRequiredService<IStationRecordService>(); }
        #endregion 【Properties】

        #region 【Ctor】
        public PackageChannel(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
            _onlineStateUpdater._action = UpdateOnlineState;
            _processAsync = buffer => SaveToDbAsync(buffer);
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [Private]
        #region 获取“基站位置”
        private async Task<LocationRecord?> GetStationLocation(BaseStationData data, BaseStationEntity baseStation)
        {
            try
            {
                var position = new LocationRecord();

                if (baseStation.IsMobile)
                {
                    position = new LocationRecord();

                    switch (data.LocationMode)
                    {
                        case StationLocationModes.WifiScan:
                            position.LocationMode = LocationModes.WiFi_Bluetooth;
                            break;
                        case StationLocationModes.AGPS:
                            position.LocationMode = LocationModes._4G_Bluetooth;
                            break;
                        default:
                            position.LocationMode = LocationModes.GPS_Bluetooth;
                            break;
                    }

                    if (data.IsValidLngLat)
                    {
                        position.Longitude = data.Longitude;
                        position.Latitude = data.Latitude;

                        if (position.LocationMode == LocationModes.GPS_Bluetooth)
                        {
                            var resConvert = await MapHelper.ConvertCoordinatesAsync(GlobalSettings.AMapKey, position.Longitude, position.Latitude);
                            if (resConvert.Data == null)
                            {
                                position.Longitude = null;
                                position.Latitude = null;
                            }
                            else
                            {
                                position.Longitude = resConvert.Data.Longitude;
                                position.Latitude = resConvert.Data.Latitude;
                            }
                        }

                        #region 获取“地址”
                        if (position.Longitude != null && position.Latitude != null)
                        {
                            var resGetAddress = await MapHelper.GetAddressByLocation(position.Longitude.Value, position.Latitude.Value, GlobalSettings.AMapKey);
                            position.Address = resGetAddress.Data;
                        }
                        #endregion 获取“地址”
                    }
                    else
                    {
                        position.Longitude = null;
                        position.Latitude = null;
                    }
                }
                else
                {
                    position.Longitude = baseStation.Longitude;
                    position.Latitude = baseStation.Latitude;
                    position.LocationMode = LocationModes.BaseStation;
                }

                return position;
            }
            catch (Exception ex)
            {
                LogHelper.Instance.Error(ex.GetMessage());
                return null;
            }
        }
        #endregion
        #endregion [Private]

        #region [DB]
        #region 保存到DB
        /// <summary>保存到DB</summary>
        private async Task SaveToDbAsync(List<string> datas)
        {
            Console.WriteLine($"Received SSE data:");
            foreach (var data in datas)
            {
                var pkgBase = PackageBase.Deserialize(data);
                if (pkgBase == null)
                {
                    LogHelper.Instance.IsNull(nameof(pkgBase));
                    return;
                }

                if (Equals(pkgBase.Type, PackageType.BaseStation))
                {
                    var package = BaseStationPackage.Deserialize(data);
                    if (package == null)
                    {
                        LogHelper.Instance.IsNull(nameof(package));
                        return;
                    }

                    await EditBaseStationAndTagAsync(package);
                    //Console.WriteLine(package.Serialize());
                }
                else if (Equals(pkgBase.Type, PackageType.Locator4g))
                {
                    var package = Locator4gPackage.Deserialize(data);
                    if (package == null)
                    {
                        LogHelper.Instance.IsNull(nameof(package));
                        return;
                    }

                    await EditLocator4gAsync(package);
                    //Console.WriteLine(package.Serialize());
                }
                else
                {
                    LogHelper.Instance.Warning($"Unknown package type: {pkgBase.Type}");
                }
            }
        }
        #endregion

        #region 修改“基站”和“蓝牙标签”
        /// <summary>修改“基站”和“蓝牙标签”</summary>
        public async Task<ApiResult<object>> EditBaseStationAndTagAsync(BaseStationPackage package)
        {
            var tagService = TagService;
            var baseStationService = BaseStationService;

            #region 获取“基站”
            var res = await baseStationService.GetByMacAddr(package.Data.CollectorId);
            var baseStation = res.Data;
            if (baseStation == null)
            {
                return MyResults<object>.Warning($"BaseStation not found! ({package.Data.CollectorId})");
            }
            #endregion

            #region 获取“基站位置”
            var location = await GetStationLocation(package.Data, baseStation);
            if (location == null)
            {
                return MyResults<object>.Warning($"The position is null! ({package.Data.CollectorId})");
            }
            #endregion

            #region 更新“基站”状态
            baseStation.OnlineState = OnlineStates.Online;
            baseStation.ReportTime = DateTimeHelper.GetBeijingNow(package.ReportTime, true);
            baseStation.LocationMode = location.LocationMode;
            baseStation.Longitude = location.Longitude;
            baseStation.Latitude = location.Latitude;
            await baseStationService.Edit(baseStation);

            // 添加“基站记录”
            if (baseStation.IsMobile && baseStation.IsValidLngLat)
            {
                await StationRecordService.Add(new StationRecordEntity().Copy(baseStation, location.Address));
            }
            #endregion

            package.Data.TagDatas0.AddRange(package.Data.TagDatas1);

            #region 修改“未上报”的“绑定标签”的“资产记录”
            var bindingTags = (await tagService.GetFullListByStationId(baseStation.MacAddr)).Data;
            if (bindingTags != null)
            {
                var tagIds = package.Data.TagDatas0.Select(i => i.TagId);
                bindingTags = bindingTags.Where(i => !tagIds.Contains(i.StationId)).ToList();
                foreach (var bindingTag in bindingTags)
                {
                    var oldTag = new TagDto();
                    oldTag.ShallowCopy(bindingTag);
                    // 基站：
                    bindingTag.ReportTime = baseStation.ReportTime;
                    // 位置：
                    bindingTag.LocationMode = location.LocationMode;
                    bindingTag.Longitude = location.Longitude;
                    bindingTag.Latitude = location.Latitude;
                    bindingTag.Address = location.Address;

                    await AssetRecordService.EditAssetRecordAsync(oldTag, bindingTag);
                }
            }
            #endregion

            foreach (var tagData in package.Data.TagDatas0)
            {
                var resGetFullByTagId = await tagService.GetFullByTagId(tagData.TagId);
                var oldTag = resGetFullByTagId.Data;
                if (oldTag == null) continue;
                if (oldTag.EqpType != EqpTypes.Tag)
                {
                    LogHelper.Instance.Warning(MyResults<object>.EqpTypeNotMatch(tagData.TagId).Message);
                    continue;
                }

                // 绑定基站的标签，只能由其绑定的基站更新状态：
                if (!string.IsNullOrEmpty(oldTag.StationId) && !string.Equals(oldTag.StationId, baseStation.MacAddr)) continue;

                var newTag = new TagDto();
                newTag.ShallowCopy(oldTag);
                // 基站：
                newTag.ReportTime = baseStation.ReportTime;
                newTag.OnlineState = OnlineStates.Online;
                // 位置：
                newTag.LocationMode = location.LocationMode;
                newTag.Longitude = location.Longitude;
                newTag.Latitude = location.Latitude;
                newTag.Address = location.Address;
                // 数据包：
                newTag.IsFall = tagData.IsFall;
                newTag.Station = baseStation.Id;
                newTag.Battery = tagData.Battery;
                newTag.Temperature = tagData.Temperature;
                newTag.Signal = tagData.Signal;

                await tagService.Edit(newTag);
                await AssetRecordService.EditAssetRecordAsync(oldTag, newTag);
            }

            return MyResults<object>.Success();
        }
        #endregion

        #region 修改“4G定位器”
        /// <summary>修改“4G定位器”</summary>
        public async Task<ApiResult<object>> EditLocator4gAsync(Locator4gPackage package)
        {
            var tagService = TagService;

            var resGetFullByTagId = await tagService.GetFullByTagId(package.Data.CollectorId);
            var oldTag = resGetFullByTagId.Data;
            if (oldTag == null) return MyResults<object>.IsNull(nameof(oldTag));
            if (oldTag.EqpType != EqpTypes.Locator)
            {
                var error = MyResults<object>.EqpTypeNotMatch(package.Data.CollectorId);
                LogHelper.Instance.Warning(error.Message);
                return error;
            }

            var newTag = new TagDto();
            newTag.ShallowCopy(oldTag, [nameof(TagDto.LocationMode)]);
            newTag.Imei = package.Data.IMEI;
            newTag.Iccid = package.Data.ICCID;
            newTag.ReportTime = DateTimeHelper.GetBeijingNow(package.ReportTime, true);
            newTag.OnlineState = OnlineStates.Online;
            newTag.IsFall = package.Data.IsFall;
            newTag.Station = null;
            newTag.Battery = package.Data.Battery;
            newTag.Signal = package.Data.WifiScan.FirstOrDefault()?.Signal;

            #region 计算“经纬度”
            Location? location = null;
            var wifiList = package.Data.WifiScan.Select(i => new WifiInfo(i.MacAddr, i.SignalRaw)).ToList();
            if (wifiList.Count > 2)
            {
                var resGetLocationByWiFi = await MapHelper.GetLocationByWifiAsync2(GlobalSettings.AMapKey, wifiList);
                location = resGetLocationByWiFi.Data;
                if (location == null)
                {
                    LogHelper.Instance.Warning(resGetLocationByWiFi.Message);
                }
                else
                {
                    newTag.LocationMode = LocationModes.WiFi;
                }
            }

            if (location == null)
            {
                package.Data.NormalizeBts();
                var resGetLocationByCell = await MapHelper.GetLocationByCellTowersAsync2(GlobalSettings.AMapKey, package.Data.SCell, package.Data.NCell);
                location = resGetLocationByCell.Data;
                if (location == null)
                {
                    LogHelper.Instance.Warning(resGetLocationByCell.Message);
                }
                else
                {
                    newTag.LocationMode = LocationModes._4G;
                }
            }

            if (location != null && location.IsValidLngLat)
            {
                newTag.Longitude = location?.Longitude;
                newTag.Latitude = location?.Latitude;
            }
            else
            {
                newTag.Longitude = null;
                newTag.Latitude = null;
            }
            #endregion 计算“经纬度”

            #region 获取“地址”
            if (newTag.Longitude != null && newTag.Latitude != null)
            {
                var resGetAddress = await MapHelper.GetAddressByLocation(newTag.Longitude.Value, newTag.Latitude.Value, GlobalSettings.AMapKey);
                var address = resGetAddress.Data;
                if (address == null)
                {
                    return resGetAddress.Convert<object>();
                }
                newTag.Address = address;
            }
            #endregion 获取“地址”

            var resEdit = await tagService.Edit(newTag);
            if (!resEdit.IsSuccess)
            {
                return resEdit.Convert<object>();
            }

            var resRecord = await AssetRecordService.EditAssetRecordAsync(oldTag, newTag);
            if (!resRecord.IsSuccess)
            {
                return resRecord.Convert<object>();
            }
            return MyResults<object>.Success();
        }
        #endregion

        #region 更新“在线状态”
        /// <summary>更新“在线状态”</summary>
        public void UpdateOnlineState()
        {
            BaseStationService.UpdateOnlineState();
            TagService.UpdateOnlineState();
        }
        #endregion
        #endregion [DB]
        #endregion 【Functions】
    }
}
