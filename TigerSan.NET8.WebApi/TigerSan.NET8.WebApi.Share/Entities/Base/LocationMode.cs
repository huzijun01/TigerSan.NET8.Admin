namespace TigerSan.NET8.WebApi.Share.Entities
{
    /// <summary>定位方式</summary>
    public enum LocationModes
    {
        /// <summary>基站</summary>
        BaseStation = 0,
        /// <summary>4G</summary>
        _4G = 1,
        /// <summary>GPS</summary>
        GPS = 2,
        /// <summary>WiFi</summary>
        WiFi = 3,
        /// <summary>4G+蓝牙</summary>
        _4G_Bluetooth = 4,
        /// <summary>GPS+蓝牙</summary>
        GPS_Bluetooth = 5,
        /// <summary>WiFi+蓝牙</summary>
        WiFi_Bluetooth = 6,
        /// <summary>4G校准</summary>
        _4G_Calibrate = 7,
        /// <summary>WiFi校准</summary>
        WiFi_Calibrate = 8,
        /// <summary>4G+蓝牙校准</summary>
        _4G_Bluetooth_Calibrate = 9,
        /// <summary>WiFi+蓝牙校准</summary>
        WiFi_Bluetooth_Calibrate = 10,
        /// <summary>信标辅助定位</summary>
        Beacon_Assistance = 11,
    }
}
