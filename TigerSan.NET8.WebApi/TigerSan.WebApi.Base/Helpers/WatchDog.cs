using System;
using TigerSan.CsvLog;
using TigerSan.TimerHelper;

namespace TigerSan.WebApi.Base
{
    public class WatchDog
    {
        #region 【Fields】
        private ActionTimer _timer;
        #endregion 【Fields】

        #region 【Ctor】
        public WatchDog(double interval, Action action)
        {
            _timer = new ActionTimer(interval, true, () =>
            {
                LogHelper.Instance.Warning("Watchdog timeout!");
                action();
            });
        }
        #endregion 【Ctor】

        #region 【Functions】
        public void Start()
        {
            _timer.Stop();
            _timer.Start();
        }

        public void Stop()
        {
            _timer.Stop();
        }

        public void FeedDog()
        {
            _timer.Stop();
            _timer.Start();
        }
        #endregion 【Functions】
    }
}
