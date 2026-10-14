namespace TigerSan.NET8.EFCore.Base
{
    #region 过滤器
    /// <summary>过滤器</summary>
    public class FilterDto
    {
        /// <summary>父表</summary>
        public ParentFilter? Parent { get; set; }
        /// <summary>“过滤器”集合</summary>
        public List<PropFilter>? Filters { get; set; }
    }
    #endregion

    #region “属性”过滤器
    /// <summary>“属性”过滤器</summary>
    public class PropFilter
    {
        /// <summary>属性名</summary>
        public string PropName { get; set; } = string.Empty;
        /// <summary>是否“为null”</summary>
        public bool? IsNull { get; set; }
        /// <summary>是否“为null或空”</summary>
        public bool? IsNullOrEmpty { get; set; }
        /// <summary>是否“模糊查询”</summary>
        public bool? IsFuzzy { get; set; }
        /// <summary>值</summary>
        public object? Value { get; set; }
        /// <summary>值集合</summary>
        public List<object>? Values { get; set; }

        public PropFilter() { }
        public PropFilter(
            string PropName,
            object? Value,
            List<object>? Values = null)
        {
            this.PropName = PropName;
            this.Value = Value;
            this.Values = Values;
        }
    }
    #endregion

    #region “父表”过滤器
    /// <summary>“父表”过滤器</summary>
    public class ParentFilter
    {
        /// <summary>ID</summary>
        public long? Id { get; set; }
        /// <summary>ID集合</summary>
        public List<long>? Ids { get; set; }
        /// <summary>父表</summary>
        public ParentFilter? Parent { get; set; }
    }
    #endregion

    #region “表”配置
    /// <summary>“表”配置</summary>
    public class DbSetConfig
    {
        /// <summary>父表</summary>
        public DbSetConfig? Parent { get; set; }
        /// <summary>实体类型</summary>
        public Type EntityType { get; set; }
        /// <summary>DbSet名称</summary>
        public string DbSetName { get; set; }
        /// <summary>父表ID属性名称</summary>
        public string? ParentIdPropName { get; set; }

        public DbSetConfig(
            Type entityType,
            string dbSetName,
            string? parentIdPropName = null,
            DbSetConfig? parent = null)
        {
            EntityType = entityType;
            DbSetName = dbSetName;
            ParentIdPropName = parentIdPropName;
            Parent = parent;
        }

        public DbSetConfig SetParent(
            Type entityType,
            string dbSetName,
            string? parentIdPropName = null)
        {
            var parent = new DbSetConfig(entityType, dbSetName, parentIdPropName);
            Parent = parent;
            return parent;
        }
    }
    #endregion

    #region “ID-值”对
    /// <summary>“ID-值”对</summary>
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
    #endregion
}
