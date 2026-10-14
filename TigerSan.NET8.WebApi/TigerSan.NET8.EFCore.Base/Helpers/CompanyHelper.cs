using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public static class CompanyHelper
    {
        #region 获取“后代公司”集合
        /// <summary>获取“后代公司”集合</summary>
        public static List<CompanyEntity> GetSubCompanies(List<CompanyEntity> companies, CompanyEntity rootCompany)
        {
            var nodes = Companies2TreeNodes(companies);
            if (nodes == null)
            {
                LogHelper.Instance.IsNull(nameof(nodes));
                return new List<CompanyEntity>();
            }

            var subs = TreeHelper.GetSubs(nodes, rootCompany.Id);
            if (subs == null) return new List<CompanyEntity>();

            return subs.Select(n => n.Data).ToList();
        }
        #endregion

        #region “公司集合”转“树节点集合”
        /// <summary>“公司集合”转“树节点集合”</summary>
        public static List<TreeNode<CompanyEntity>>? Companies2TreeNodes(List<CompanyEntity> companies)
        {
            return TreeHelper.List2TreeNodes(
                companies,
                item => item.Id,
                item => item.Parent);
        }
        #endregion
    }
}
