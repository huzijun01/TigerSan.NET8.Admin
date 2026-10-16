using System;
using System.Text;

namespace TigerSan.WebApi.Base
{
    public class MqttConnection
    {
        public string ServerUrl { get; set; } = string.Empty;
        public string ClientId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ConnectInfo
    {
        /// <summary>服务器基础地址（如：localhost:5012）/// </summary>
        public string ServerUrl { get; set; }
        /// <summary>客户端唯一标识（用于服务端区分不同客户端）</summary>
        public string ClientId { get; set; }
        /// <summary>用户名</summary>
        public string Username { get; set; }
        /// <summary>密码</summary>
        public string Password { get; set; }
        /// <summary>SSE连接地址</summary>
        public string SseUrl { get => $"http://{ServerUrl}/api/communication/sse?clientId={ClientId}"; }
        /// <summary>Base64编码的Basic Auth认证头</summary>
        public string Authorization { get => "Basic " + Convert.ToBase64String(Encoding.ASCII.GetBytes($"{Username}:{Password}")); }
        /// <summary>重连间隔（ms）</summary>
        public int RetryIntervalMs { get; set; } = 5000;

        #region 【Ctor】
        public ConnectInfo(MqttConnection connection)
        {
            ServerUrl = connection.ServerUrl;
            ClientId = connection.ClientId;
            Username = connection.Username;
            Password = connection.Password;
        }
        public ConnectInfo(string serverUrl, string clientId, string username, string password)
        {
            ServerUrl = serverUrl;
            ClientId = clientId;
            Username = username;
            Password = password;
        }
        #endregion 【Ctor】
    }
}
