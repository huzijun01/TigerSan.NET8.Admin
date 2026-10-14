using System;
using System.Threading;
using System.Threading.Tasks;
using TigerSan.CsvLog;

namespace TigerSan.WebApi.Base
{
    public delegate Task AsyncAction();

    public class DailyTask : IDisposable
    {
        #region 【Fields】
        private Timer? _timer;
        private bool _isDisposed = false;
        private volatile bool _isRunning = false;
        private readonly object _lockObj = new object();

        public readonly Action? _action;
        public readonly AsyncAction? _actionAsync;
        #endregion 【Fields】

        #region 【Properties】
        public bool IsStarted => _timer != null && !_isDisposed;
        #endregion 【Properties】

        #region 【Ctor】
        public DailyTask(Action? action, AsyncAction? actionAsync)
        {
            _action = action;
            _actionAsync = actionAsync;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [private]
        /// <summary>
        /// 获取下一个凌晨0点时间
        /// </summary>
        private static DateTime GetNextMidnight()
        {
            var now = DateTime.Now;
            var todayStart = now.Date; // 当天 00:00:00
            var nextMidnight = todayStart.AddDays(1); // 明天 00:00:00

            return nextMidnight;
        }

        /// <summary>
        /// 定时器回调
        /// </summary>
        private void OnTimerCallback(object? state)
        {
            // 快速检查，如果已经在运行或已释放，则跳过
            if (_isRunning || _isDisposed)
            {
                RescheduleNextRun();
                return;
            }

            lock (_lockObj)
            {
                if (_isDisposed || _isRunning) return;
                _isRunning = true;
            }

            try
            {
                _action?.Invoke();
                _actionAsync?.Invoke();
            }
            catch (Exception ex)
            {
                LogHelper.Instance.Error(ex.GetMessage());
            }
            finally
            {
                lock (_lockObj)
                {
                    _isRunning = false;
                }

                // 无论成功与否，都重新调度下一次执行
                RescheduleNextRun();
            }
        }

        /// <summary>
        /// 设置下一次执行时间
        /// </summary>
        private void RescheduleNextRun()
        {
            if (_isDisposed) return;

            lock (_lockObj)
            {
                if (_timer == null || _isDisposed) return;

                try
                {
                    var nextRun = GetNextMidnight();
                    var delay = nextRun - DateTime.Now;

                    // 如果计算出的时间已过，则推迟到再下一天
                    if (delay.TotalMilliseconds < 0)
                    {
                        nextRun = nextRun.AddDays(1);
                        delay = nextRun - DateTime.Now;
                    }

                    _timer.Change(delay, Timeout.InfiniteTimeSpan);
                }
                catch (ObjectDisposedException)
                {
                    // 忽略在重调度过程中定时器被外部 Dispose 的情况
                }
                catch (Exception ex)
                {
                    LogHelper.Instance.Error(ex.GetMessage());
                }
            }
        }
        #endregion [private]

        #region 启动
        public void Start()
        {
            if (_isDisposed) throw new ObjectDisposedException(nameof(DailyTask));

            lock (_lockObj)
            {
                if (_isDisposed) throw new ObjectDisposedException(nameof(DailyTask));

                var nextRun = GetNextMidnight();
                var delay = nextRun - DateTime.Now;

                // 防止因系统时间调整导致负数延迟
                if (delay.TotalMilliseconds < 0)
                {
                    delay = TimeSpan.Zero;
                }

                if (_timer == null)
                {
                    // 创建定时器：delay 后首次执行，之后不自动重复（由回调手动重调度）
                    _timer = new Timer(OnTimerCallback, null, delay, Timeout.InfiniteTimeSpan);
                }
                else
                {
                    // 如果已存在，更新下一次触发时间
                    _timer.Change(delay, Timeout.InfiniteTimeSpan);
                }
            }
        }
        #endregion

        #region 停止
        public void Stop()
        {
            Dispose();
        }
        #endregion

        #region 销毁
        public void Dispose()
        {
            if (!_isDisposed)
            {
                lock (_lockObj)
                {
                    if (!_isDisposed)
                    {
                        _isDisposed = true;

                        if (_timer != null)
                        {
                            try
                            {
                                _timer.Dispose();
                            }
                            catch { }
                            _timer = null;
                        }
                    }
                }
            }
        }
        #endregion
        #endregion 【Functions】
    }
}
