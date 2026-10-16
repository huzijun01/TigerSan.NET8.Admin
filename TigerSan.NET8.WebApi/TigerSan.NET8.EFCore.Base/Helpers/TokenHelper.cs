using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public static class TokenHelper
    {
        #region 初始化“Token”
        /// <summary>初始化“Token”</summary>
        public static bool InitToken(UserInfo userInfo)
        {
            userInfo.Token = TokenGenerator.GetToken(userInfo.Username, GlobalBaseSettings.TokenValidityPeriod);
            if (userInfo.Token == null)
            {
                LogHelper.Instance.Error($"Failed to generate token for user {userInfo.Username}");
                return false;
            }

            MemoryCacheHelper.SetRelative(userInfo.Username, userInfo.Token, GlobalBaseSettings.TokenValidityPeriod);

            return true;
        }
        #endregion

        #region 获取“Token信息”
        /// <summary>获取“Token信息”</summary>
        public static ApiResult<TokenInfo> GetTokenInfo(string token)
        {
            // 获取“Token信息”:
            var tokenInfo = TokenGenerator.GetTokenInfo(token);
            if (tokenInfo == null)
                return ApiResults<TokenInfo>.InvalidOrExpiredToken;

            // 获取“Token记录”:
            var tokenRecord = MemoryCacheHelper.Get<string>(tokenInfo.Username);

            // “Token”是否可用:
            if (string.IsNullOrEmpty(tokenRecord) || !string.Equals(tokenRecord, token))
                return ApiResults<TokenInfo>.LoggedInByAnotherUser;

            return ApiResults<TokenInfo>.Success(null, tokenInfo);
        }
        #endregion
    }
}
