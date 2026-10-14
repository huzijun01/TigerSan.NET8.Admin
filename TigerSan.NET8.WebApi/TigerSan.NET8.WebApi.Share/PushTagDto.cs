using System.Text.Json.Serialization;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;
using TigerSan.NET8.WebApi.Share.Dtos;

namespace TigerSan.NET8.WebApi.Share
{
    #region “公贝”数据
    public class GongBeiData
    {
        public string Type { get; set; } = "device.info.report";
        public TagDto Data { get; set; }
        public GongBeiData(TagDto tag)
        {
            Data = tag;
        }
    }
    #endregion

    #region “公贝”响应
    public class GongBeiResult
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;
        [JsonPropertyName("msg")]
        public string Msg { get; set; } = string.Empty;
        [JsonPropertyName("requestId")]
        public string RequestId { get; set; } = string.Empty;
        [JsonPropertyName("success")]
        public bool Success { get; set; }
    }
    #endregion

    public static class PushTagDto
    {
        #region 【Fields】
        static readonly string _subUrlGongBei = "/system/iot/unauth/daye/report";
        static readonly string _urlGongBei = "https://asset.gongbeiyun.com" + _subUrlGongBei;
        static readonly string _testUrlGongBei = "https://test-asset.gongbeiyun.com" + _subUrlGongBei;
        #endregion 【Fields】

        #region 【Functions】
        #region 推送“标签数据”
        public static async Task<ApiResult<object>> PushTagDtoAsync(TagDto tag)
        {
            try
            {
                if (tag.Company == 117075679404752940)
                {
                    var gongBeiData = new GongBeiData(tag);
                    for (int i = 0; i < 3; i++)
                    {
                        var res = await HttpHelper.PostAsync<GongBeiData, GongBeiResult>(_testUrlGongBei, gongBeiData);
                        if (res.Data != null)
                        {
                            if (res.Data.Success) break;
                            LogHelper.Instance.Warning(res.Data.Msg);
                        }
                    }
                }

                return MyResults<object>.OperationSuccess;
            }
            catch (Exception ex)
            {
                return MyResults<object>.Error(LogHelper.Instance.Error(ex.GetMessage()));
            }
        }
        #endregion
        #endregion 【Functions】
    }
}
