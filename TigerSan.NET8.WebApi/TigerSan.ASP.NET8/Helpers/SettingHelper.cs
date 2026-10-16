using TigerSan.CsvLog;
using TigerSan.NET8.WebApi.Share.Dtos;

namespace TigerSan.NET8.WebApi.Helpers
{
    public static class SettingHelper
    {
        #region 【Fields】
        private static IConfiguration? _configuration;
        private static AppSettings _appSettings = new AppSettings();
        #endregion 【Fields】

        #region 【Properties】
        public static AppSettings AppSettings { get => Get(); }
        #endregion 【Properties】

        #region 【Functions】
        #region [private]
        #region 获取
        private static AppSettings Get()
        {
            if (_configuration == null)
            {
                LogHelper.Instance.IsNull(nameof(_configuration));
            }
            else
            {
                _configuration.Bind(nameof(AppSettings), _appSettings);
            }

            return _appSettings;
        }
        #endregion
        #endregion [private]

        #region 初始化
        public static void Init(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        #endregion

        #region 注册“设置”
        public static void RegisterAppSettings(this IServiceCollection services)
        {
            services.AddTransient(provider => AppSettings);
        }
        #endregion
        #endregion 【Functions】
    }
}
