using System;

namespace TigerSan.WebApi.Base
{
    #region 验证码数据
    /// <summary>验证码数据</summary>
    public class CaptchaData
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public byte[]? Captcha { get; set; }
    }
    #endregion

    public class CaptchaCache
    {
        #region 初始化“验证码”
        /// <summary>初始化“验证码”</summary>
        public static void InitCaptcha(string id, string code)
        {
            MemoryCacheHelper.SetRelative(id, code, GlobalBaseSettings.CaptchaValidityPeriod);
        }
        #endregion

        #region 验证
        /// <summary>验证</summary>
        public static ApiResult<object> Verify(string? id, string code)
        {
            if (string.IsNullOrEmpty(id)) return ApiResults<object>.IdIsNullOrEmpty;

            // 获取“验证码记录”:
            var find = MemoryCacheHelper.Get<string>(id);

            // “验证码”是否可用:
            if (string.IsNullOrEmpty(find))
                return ApiResults<object>.NoCaptchaRecord(id);
            else if (!string.Equals(code, find, StringComparison.OrdinalIgnoreCase))
                return ApiResults<object>.CaptchaVerificationFailed;

            return ApiResults<object>.Success();
        }
        #endregion
    }
}
