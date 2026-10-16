namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class AssetCountDto
    {
        /// <summary>T ≤ 12h</summary>
        public int CountLessThan12h { get; set; }
        /// <summary>12h ＜ T ≤ 24h</summary>
        public int Count12hTo24h { get; set; }
        /// <summary>24h ＜ T ≤ 36h</summary>
        public int Count24hTo36h { get; set; }
        /// <summary>36h ＜ T ≤ 48h</summary>
        public int Count36hTo48h { get; set; }
        /// <summary>T ＞ 48h</summary>
        public int CountGreaterThan48h { get; set; }
    }
}
