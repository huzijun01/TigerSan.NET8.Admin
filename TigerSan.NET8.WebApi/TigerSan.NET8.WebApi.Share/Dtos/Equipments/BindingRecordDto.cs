using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class BindingRecordDto : BindingRecordEntity
    {
        public string TagId { get; set; } = string.Empty;
        public string AssetId { get; set; } = string.Empty;
    }
}
