using TigerSan.WebApi.Base;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class AppSettings
    {
        public string ListenUrl { get; set; } = string.Empty;
        public string ConnectionString { get; set; } = string.Empty;
        public MqttConnection MqttConnection { get; set; } = new MqttConnection();
    }
}
