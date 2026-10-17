using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public interface IUserService
    {
        /// <summary>获取“用户信息”</summary>
        /// <param name="search">用户名/电话/邮箱</param>
        /// <returns>用户信息</returns>
        public Task<ApiResult<UserInfo>> GetUserInfo(string search);
        /// <summary>修改“密码”</summary>
        public Task<ApiResult<object>> EditPassword(PasswordEdit edit);
        /// <summary>登录</summary>
        /// <param name="search">用户名/电话/邮箱</param>
        /// <param name="password">密码</param>
        /// <returns>用户信息</returns>
        public Task<ApiResult<UserInfo>> Login(
            string id,
            string captcha,
            string search,
            string password);
        /// <returns>Token登录</returns>
        public Task<ApiResult<UserInfo>> LoginByToken(string token);
        /// <summary>登出</summary>
        public Task<ApiResult<object>> Logout(string username);
        /// <summary>获取“验证码”</summary>
        public ApiResult<CaptchaData> GetCaptcha();
        /// <summary>验证“验证码”</summary>
        public ApiResult<object> VerifyCaptcha(string id, string code);
    }
}
