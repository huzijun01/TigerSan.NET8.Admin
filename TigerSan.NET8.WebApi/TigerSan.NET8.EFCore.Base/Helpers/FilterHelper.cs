using TigerSan.CsvLog;

namespace TigerSan.NET8.EFCore.Base
{
    public static class FilterHelper
    {
        #region 获取“父表”过滤器
        /// <summary>获取“父表”过滤器</summary>
        public static ParentFilter? GetParentFilter<TParentEntity>(
            DbSetConfig dbSetConfig,
            FilterDto? filter)
            where TParentEntity : IdEntityBase
        {
            if (filter == null) return null;

            var parentFilter = filter.Parent;
            var parentConfig = dbSetConfig.Parent;

            while (parentFilter != null && parentConfig != null)
            {
                if (parentConfig.EntityType == typeof(TParentEntity)) return parentFilter;
                parentFilter = parentFilter.Parent;
                parentConfig = parentConfig.Parent;
            }

            return null;
        }
        #endregion

        #region 设置“父表”过滤器
        /// <summary>设置“父表”过滤器</summary>
        public static bool SetParentFilter<TParentEntity>(
            DbSetConfig dbSetConfig,
            ref FilterDto? filter,
            ParentFilter parentFilter)
            where TParentEntity : IdEntityBase
        {
            if (filter == null) filter = new FilterDto();

            var findParentFilter = filter.Parent;
            if (findParentFilter == null) findParentFilter = filter.Parent = new ParentFilter();
            var parentConfig = dbSetConfig.Parent;

            while (parentConfig != null && findParentFilter != null)
            {
                if (parentConfig.EntityType == typeof(TParentEntity))
                {
                    findParentFilter.Id = parentFilter.Id;
                    findParentFilter.Ids = parentFilter.Ids;
                    return true;
                }

                if (parentConfig.Parent != null && findParentFilter.Parent == null)
                {
                    findParentFilter.Parent = new ParentFilter();
                }

                findParentFilter = findParentFilter.Parent;
                parentConfig = parentConfig.Parent;
            }

            return false;
        }
        #endregion

        #region 设置“ID”属性过滤器
        /// <summary>设置“ID”属性过滤器</summary>
        public static bool SetIdPropFilter<TEntity>(
            ref FilterDto filter,
            List<TEntity> accessibleCompanies) where TEntity : IdEntityBase
        {
            var accessibleCompanyIds = accessibleCompanies.Select(i => i.Id as object).ToList();
            if (accessibleCompanyIds == null)
            {
                LogHelper.Instance.IsNull(nameof(accessibleCompanyIds));
                return false;
            }

            if (filter.Filters == null) filter.Filters = new List<PropFilter>();

            var companyFilter = filter.Filters.FirstOrDefault(i => i.PropName == nameof(IdEntityBase.Id));

            if (companyFilter == null)
            {
                companyFilter = new PropFilter()
                {
                    PropName = nameof(IdEntityBase.Id),
                };
                filter.Filters.Add(companyFilter);
            }

            if (companyFilter.Value != null || companyFilter.Values != null)
            {
                if (companyFilter.Value != null && !accessibleCompanyIds.Contains(companyFilter.Value))
                    companyFilter.Value = null;
                if (companyFilter.Values != null)
                    companyFilter.Values = companyFilter.Values.Where(i => accessibleCompanyIds.Contains(i)).ToList();

                if (companyFilter.Values == null && companyFilter.Value == null)
                    companyFilter.Values = accessibleCompanyIds;
            }
            else
            {
                companyFilter.Values = accessibleCompanyIds;
            }

            return true;
        }
        #endregion

        #region 设置“公司”父表过滤器
        /// <summary>设置“公司”父表过滤器</summary>
        public static bool SetCompanyParentFilter(
            DbSetConfig dbSetConfig,
            ref FilterDto? filter,
            List<CompanyEntity> accessibleCompanies)
        {
            var accessibleCompanyIds = accessibleCompanies.Select(i => i.Id).ToList();
            if (accessibleCompanyIds == null)
            {
                LogHelper.Instance.IsNull(nameof(accessibleCompanyIds));
                return false;
            }

            var companyFilter = GetParentFilter<CompanyEntity>(dbSetConfig, filter);
            if (companyFilter == null)
            {
                companyFilter = new ParentFilter() { Ids = accessibleCompanyIds };
            }
            else if (companyFilter.Id != null || companyFilter.Ids != null)
            {
                if (companyFilter.Id != null && !accessibleCompanyIds.Contains(companyFilter.Id.Value))
                    companyFilter.Id = null;
                if (companyFilter.Ids != null)
                    companyFilter.Ids = companyFilter.Ids.Where(i => accessibleCompanyIds.Contains(i)).ToList();

                if (companyFilter.Ids == null && companyFilter.Id == null)
                    companyFilter.Ids = accessibleCompanyIds;
            }
            else
            {
                companyFilter.Ids = accessibleCompanyIds;
            }

            SetParentFilter<CompanyEntity>(dbSetConfig, ref filter, companyFilter);

            return true;
        }
        #endregion
    }
}
