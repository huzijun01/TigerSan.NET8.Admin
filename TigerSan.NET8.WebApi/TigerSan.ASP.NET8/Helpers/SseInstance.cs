using TigerSan.CsvLog;
using TigerSan.WebApi.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Packages;

namespace TigerSan.NET8.WebApi.Helpers
{
    public class SseInstance
    {
        #region 【Fields】
        // private:
        private DateTime? _lastReportTime;
        private readonly WatchDog _watchDog;
        private PackageChannel _packageChannel;
        private CancellationTokenSource? _cts;
        // public:
        public static SseInstance? _instance;
        public SseHelper _sseHelper = new SseHelper(new ConnectInfo(SettingHelper.AppSettings.MqttConnection));
        public DateTime? LastReportTime { get => _lastReportTime; }
        #endregion 【Fields】

        #region 【Functions】
        #region 初始化
        /// <summary>初始化</summary>
        private SseInstance(IServiceProvider serviceProvider)
        {
            _instance = this;
            _packageChannel = new PackageChannel(serviceProvider);
            _watchDog = new WatchDog(GlobalSettings.MqttReportIntervalSeconds * 1000, Start);
        }
        #endregion

        #region 初始化“实例”
        /// <summary>初始化“实例”</summary>
        public static SseInstance InitInstance(IServiceProvider serviceProvider)
        {
            if (_instance == null)
            {
                _instance = new SseInstance(serviceProvider);
            }
            return _instance;
        }
        #endregion

        #region 开始监听
        /// <summary>开始监听</summary>
        public void Start()
        {
            _sseHelper.StartAsync(OnReceiveAsync).ContinueWith(task =>
            {
                if (!task.IsFaulted) return;
                LogHelper.Instance.Error($"Error in SSE listener:");
                Console.WriteLine(task.Exception?.GetBaseException().Message);
            });

            _cts?.Cancel();
            _cts = new CancellationTokenSource();
            _packageChannel.StartProcessingAsync(_cts.Token).ContinueWith(async task =>
            {
                if (!task.IsFaulted) return;
                await Stop();
                var ex = task.Exception?.GetBaseException();
                LogHelper.Instance.Error(ex?.GetMessage());
            });
            _packageChannel.UpdateOnlineState();
            _packageChannel._onlineStateUpdater.Start();
            _watchDog.Start();
        }
        #endregion

        #region 停止监听
        /// <summary>停止监听</summary>
        public async Task Stop()
        {
            _watchDog.Stop();
            await _sseHelper.StopAsync();
            _cts?.Cancel();
            _cts = null;
            _packageChannel._onlineStateUpdater.Stop();
        }
        #endregion

        #region 是否“正在监听”
        /// <summary>是否“正在监听”</summary>
        public bool IsListening()
        {
            return _instance != null && _sseHelper.IsListening();
        }
        #endregion

        #region 接收到数据时
        /// <summary>接收到数据时</summary>
        private async Task OnReceiveAsync(string data)
        {
            _watchDog.FeedDog();
            _lastReportTime = DateTimeHelper.GetUtcNow();
            await _packageChannel.PublishAsync(data);
        }
        #endregion

        #region [DB]
        #region 修改“基站”和“标签”（蓝牙）
        /// <summary>修改“基站”和“标签”（蓝牙）</summary>
        public static async Task<ApiResult<object>> EditBaseStationAndTagAsync(BaseStationPackage package)
        {
            if (_instance == null)
            {
                LogHelper.Instance.IsNull(nameof(_instance));
                return MyResults<object>.ResourceNotExist;
            }
            return await _instance._packageChannel.EditBaseStationAndTagAsync(package);
        }
        #endregion
        #endregion [DB]
        #endregion 【Functions】
    }
}
