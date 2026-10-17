namespace TigerSan.NET8.EFCore.Base
{
    public class IdValue<TField>
    {
        public long Id { get; set; }
        public TField Value { get; set; }

        public IdValue(TField value, long? id = null)
        {
            Value = value;
            if (id != null) Id = id.Value;
        }
    }
}
