using Microsoft.AspNetCore.Mvc;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Helpers;
using TigerSan.NET8.WebApi.Share.Dtos;

namespace TigerSan.NET8.WebApi.Controllers
{
    [ApiController]
    [NotIdController]
    [Route("[controller]")]
    public class MqttController
    {
        #region 【Ctor】
        public MqttController()
        {
        }
        #endregion 【Ctor】

        #region 【Functions】
        [HttpGet]
        [Route("Start")]
        [NoNeedAuthorize]
        /// <summary>开始监听</summary>
        public async Task<ApiResult<object>> Start()
        {
            if (SseInstance._instance == null)
                return MyResults<object>.Warning(LogHelper.Instance.IsNull(nameof(SseInstance._instance)));
            SseInstance._instance.Start();
            return MyResults<object>.Success();
        }

        [HttpGet]
        [Route("Stop")]
        [NoNeedAuthorize]
        /// <summary>停止监听</summary>
        public async Task<ApiResult<object>> Stop()
        {
            if (SseInstance._instance == null)
                return MyResults<object>.Warning(LogHelper.Instance.IsNull(nameof(SseInstance._instance)));
            await SseInstance._instance.Stop();
            return MyResults<object>.Success();
        }

        [HttpGet]
        [Route("IsListening")]
        [NoNeedAuthorize]
        /// <summary>是否“正在监听”</summary>
        public async Task<ApiResult<bool>> IsListening()
        {
            if (SseInstance._instance == null)
                return MyResults<bool>.Warning(LogHelper.Instance.IsNull(nameof(SseInstance._instance)));

            return MyResults<bool>.Success(null, SseInstance._instance.IsListening());
        }

        [HttpGet]
        [Route("LastReportTime")]
        [NoNeedAuthorize]
        /// <summary>获取“最后上报时间”</summary>
        public async Task<ApiResult<DateTime>> LastReportTime()
        {
            if (SseInstance._instance == null)
                return MyResults<DateTime>.Warning(LogHelper.Instance.IsNull(nameof(SseInstance._instance)));

            return MyResults<DateTime>.Success(null, SseInstance._instance.LastReportTime ?? default);
        }
        #endregion 【Functions】
    }
}
