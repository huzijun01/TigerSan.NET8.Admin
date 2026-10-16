using System.Reflection;
using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;

namespace TigerSan.NET8.EFCore.Base
{
    public class DbContextBase<TDbContext> : DbContext where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Fields】
        /// <summary>版本</summary>
        public Version _version;
        /// <summary>连接字符串</summary>
        public string _connectionString;
        /// <summary>“DbSet属性”字典</summary>
        public static readonly Dictionary<string, PropertyInfo> _dbSetProps = GetDbSetProps();
        #endregion 【Fields】

        #region 【Props】
        public DbSet<AdminEntity> Admins { get; set; }
        public DbSet<AuthorityEntity> Authorities { get; set; }
        public DbSet<CompanyEntity> Companies { get; set; }
        public DbSet<DepartmentEntity> Departments { get; set; }
        public DbSet<PersonEntity> Persons { get; set; }
        public DbSet<RoleEntity> Roles { get; set; }
        #endregion 【Props】

        #region 【Ctor】
        public DbContextBase(string connectionString, Version? version = null)
        {
            _connectionString = connectionString;
            _version = version ?? new Version(8, 0, 45);
        }
        #endregion 【Ctor】

        #region 【Override】
        #region 配置时
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySql(_connectionString, new MySqlServerVersion(_version));
        }
        #endregion
        #endregion 【Override】

        #region 【Functions】
        #region [Private]
        #region 获取“DbSet属性”字典
        /// <summary>获取“DbSet属性”字典</summary>
        private static Dictionary<string, PropertyInfo> GetDbSetProps()
        {
            var dbSetProps = new Dictionary<string, PropertyInfo>();
            var properties = typeof(TDbContext).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var property in properties)
            {
                if (property.PropertyType.IsGenericType &&
                    property.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>))
                {
                    var entityType = property.PropertyType.GetGenericArguments()[0];
                    if (typeof(IdEntityBase).IsAssignableFrom(entityType))
                    {
                        dbSetProps[property.Name] = property;
                    }
                }
            }

            return dbSetProps;
        }
        #endregion
        #endregion [Private]

        #region [Static]
        #region 获取“DbSet名称”
        /// <summary>获取“DbSet名称”</summary>
        public static string GetDbSetName(Type dbSetType)
        {
            var dbSetProp = _dbSetProps.Values.FirstOrDefault(p => p.PropertyType == dbSetType);
            if (dbSetProp == null)
            {
                LogHelper.Instance.Warning($"The DbSet property for type '{dbSetType.Name}' was not found!");
                return string.Empty;
            }
            return dbSetProp.Name;
        }
        #endregion
        #endregion [Static]

        #region 获取“DbSet”
        /// <summary>获取“DbSet”</summary>
        public IQueryable? GetDbSet(string dbSetName)
        {
            if (_dbSetProps == null)
            {
                LogHelper.Instance.IsNull(nameof(_dbSetProps));
                return null;
            }

            // 查找匹配的DbSet属性:
            _dbSetProps.TryGetValue(dbSetName, out var property);

            // 验证属性存在:
            if (property == null)
            {
                LogHelper.Instance.Warning($"The attribute named '{dbSetName}' of DbSet was not found!");
                return null;
            }

            var dbSet = (IQueryable)property.GetValue(this)!;
            return dbSet.AsQueryable();
        }
        #endregion
        #endregion 【Functions】
    }
}
