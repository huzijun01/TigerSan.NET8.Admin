using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class AssetStateRecordDto : AssetStateRecordEntity
    {
        public string CompanyName { get; set; } = string.Empty;
        public double NoRecordPerc { get => GetPerc(NoRecord); }
        public double InboundPerc { get => GetPerc(Inbound); }
        public double InStorePerc { get => GetPerc(InStore); }
        public double StolidPerc { get => GetPerc(Stolid); }
        public double OutboundPerc { get => GetPerc(Outbound); }
        public double InTransitPerc { get => GetPerc(InTransit); }
        public double TimeoutPerc { get => GetPerc(Timeout); }

        #region 【Functions】
        /// <summary>获取“百分比”</summary>
        private double GetPerc(int count)
        {
            if (Count < 1) return 0;
            return Math.Round((double)count / Count * 100, 2);
        }
        #endregion 【Functions】
    }
}
