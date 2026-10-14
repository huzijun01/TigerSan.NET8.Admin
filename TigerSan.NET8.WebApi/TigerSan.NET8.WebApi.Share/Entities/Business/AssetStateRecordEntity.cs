using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("asset_state_record")]
    public class AssetStateRecordEntity : IdEntityBase
    {
        [SnakeColumn]
        public long Company { get; set; }
        [SnakeColumn]
        public int Count { get; set; }
        [SnakeColumn]
        public int NoRecord { get; set; }
        [SnakeColumn]
        public int Inbound { get; set; }
        [SnakeColumn]
        public int InStore { get; set; }
        [SnakeColumn]
        public int Stolid { get; set; }
        [SnakeColumn]
        public int Outbound { get; set; }
        [SnakeColumn]
        public int InTransit { get; set; }
        [SnakeColumn]
        public int Timeout { get; set; }
        [SnakeColumn]
        public DateTime Time { get; set; }

        #region 加
        public void Add(AssetStateRecordEntity entity)
        {
            Count += entity.Count;
            NoRecord += entity.NoRecord;
            Inbound += entity.Inbound;
            InStore += entity.InStore;
            Stolid += entity.Stolid;
            Outbound += entity.Outbound;
            InTransit += entity.InTransit;
            Timeout += entity.Timeout;
        }
        #endregion
    }
}
