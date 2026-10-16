using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;

namespace TigerSan.NET8.WebApi.Share.Entities
{
    [Table("binding_record")]
    public class BindingRecordEntity : IdEntityBase
    {
        [SnakeColumn]
        public bool IsBinding { get; set; }
        [SnakeColumn]
        public long Asset { get; set; }
        [SnakeColumn]
        public long Tag { get; set; }
        [SnakeColumn]
        public DateTime Time { get; set; } = DateTimeHelper.GetBeijingNow();

        #region 【Ctor】
        public BindingRecordEntity() { }

        public BindingRecordEntity(
            bool isBinding,
            long asset,
            long tag,
            DateTime? time = null)
        {
            IsBinding = isBinding;
            Asset = asset;
            Tag = tag;
            if (time != null) Time = time.Value;
        }
        #endregion 【Ctor】

        #region 【Functions】
        public bool Equals(BindingRecordEntity entity)
        {
            return IsBinding == entity.IsBinding
                && Asset == entity.Asset
                && Tag == entity.Tag;
        }
        #endregion 【Functions】
    }
}
