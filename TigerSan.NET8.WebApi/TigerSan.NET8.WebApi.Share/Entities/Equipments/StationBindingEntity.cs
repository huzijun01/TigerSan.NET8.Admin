using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("station_binding")]
    public class StationBindingEntity : IdEntityBase
    {
        [SnakeColumn]
        public bool IsBinding { get; set; }
        [SnakeColumn]
        public long Station { get; set; }
        [SnakeColumn]
        public long Tag { get; set; }
        [SnakeColumn]
        public DateTime Time { get; set; } = DateTimeHelper.GetBeijingNow();

        #region 【Ctor】
        public StationBindingEntity() { }

        public StationBindingEntity(
            bool isBinding,
            long station,
            long tag,
            DateTime? time = null)
        {
            IsBinding = isBinding;
            Station = station;
            Tag = tag;
            if (time != null) Time = time.Value;
        }
        #endregion 【Ctor】

        #region 【Functions】
        public bool Equals(StationBindingEntity entity)
        {
            return IsBinding == entity.IsBinding
                && Station == entity.Station
                && Tag == entity.Tag;
        }
        #endregion 【Functions】
    }
}
