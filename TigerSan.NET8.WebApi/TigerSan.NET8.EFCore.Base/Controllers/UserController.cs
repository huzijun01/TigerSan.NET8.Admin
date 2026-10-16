using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    [ApiController]
    [NotIdController]
    [Route("[controller]")]
    public class UserController
    {
        #region 【Fields】
        private readonly IUserService _service;
        #endregion 【Fields】

        #region 【Ctor】
        public UserController(IUserService service)
        {
            _service = service;
        }
        #endregion 【Ctor】

        #region 【Functions】
        [HttpPut]
        [Route("Password")]
        /// <summary>修改“密码”</summary>
        public async Task<ApiResult<object>> EditPassword([FromBody] PasswordEdit edit)
        {
            return await _service.EditPassword(edit);
        }

        [HttpGet]
        [Route("Login")]
        [NoNeedAuthorize]
        /// <summary>登录</summary>
        public async Task<ApiResult<UserInfo>> Login(string id, string captcha, string search, string password)
        {
            return await _service.Login(id, captcha, search, password);
        }

        [HttpGet]
        [Route("LoginByToken")]
        [NoNeedAuthorize]
        /// <summary>Token登录</summary>
        public async Task<ApiResult<UserInfo>> LoginByToken(string token)
        {
            return await _service.LoginByToken(token);
        }

        [HttpGet]
        [Route("Logout")]
        /// <summary>登出</summary>
        public async Task<ApiResult<object>> Logout(string username)
        {
            return await _service.Logout(username);
        }

        [HttpPost]
        [Route("Captcha")]
        [NoNeedAuthorize]
        public async Task<ApiResult<CaptchaData>> GetCaptcha()
        {
            return _service.GetCaptcha();
        }
        #endregion 【Functions】
    }
}
