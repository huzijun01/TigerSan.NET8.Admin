using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class StationBindingDto : StationBindingEntity
    {
        public string TagId { get; set; } = string.Empty;
        public string StationId { get; set; } = string.Empty;
    }
}
