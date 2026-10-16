using System;
using System.Linq;
using System.Collections.Generic;
using TigerSan.CsvLog;

namespace TigerSan.WebApi.Base
{
    #region 树节点
    /// <summary>树节点</summary>
    public class TreeNode<T> where T : class
    {
        public long Id { get; set; }
        public T Data { get; set; }
        public List<TreeNode<T>>? Childs { get; set; }

        public TreeNode(long id, T data)
        {
            Id = id;
            Data = data;
        }
    }
    #endregion

    public static class TreeHelper
    {
        #region 获取“节点”
        /// <summary>获取“节点”</summary>
        public static TreeNode<T>? Get<T>(List<TreeNode<T>> nodes, long root) where T : class
        {
            foreach (var node in nodes)
            {
                if (node.Id == root) return node;
                if (node.Childs == null) continue;
                var find = Get(node.Childs, root);
                if (find != null) return find;
            }

            return null;
        }
        #endregion

        #region 获取“节点”集合（无嵌套）
        /// <summary>获取“节点”集合（无嵌套）</summary>
        private static List<TreeNode<T>> ToList<T>(List<TreeNode<T>> nodes) where T : class
        {
            var list = new List<TreeNode<T>>();

            foreach (var node in nodes)
            {
                list.Add(node);
                if (node.Childs == null) continue;
                list.AddRange(ToList(node.Childs));
            }

            return list;
        }
        #endregion

        #region 获取“子节点”集合
        /// <summary>获取“子节点”集合</summary>
        public static List<TreeNode<T>>? GetSubs<T>(List<TreeNode<T>> nodes, long root) where T : class
        {
            var find = Get(nodes, root);
            if (find == null) return null;

            return ToList(find.Childs ?? new List<TreeNode<T>>());
        }
        #endregion

        #region “集合”转“节点集合”
        /// <summary>“集合”转“节点集合”</summary>
        public static List<TreeNode<T>>? List2TreeNodes<T>(
            List<T> items,
            Func<T, long> getIndex,
            Func<T, long?> getParent) where T : class
        {
            /** “节点”数组 */
            var nodes = new List<TreeNode<T>>();
            /** “节点”数组（无嵌套） */
            var nodeArray = new List<TreeNode<T>>();

            /** “根项目”数组 */
            var rootItems = items.Where(i => getParent(i) == null).ToList();
            /** “剩余项目”数组 */
            var remainingItems = items.Where(i => getParent(i) != null).ToList();
            /** “新根项目”数组 */
            var newRootItems = new List<T>();

            // 添加“根项目”:
            foreach (var rootItem in rootItems)
            {
                var rootNode = new TreeNode<T>(getIndex(rootItem), rootItem);
                nodes.Add(rootNode);
                nodeArray.Add(rootNode);
            }

            // 添加“后代项目”:
            while (rootItems.Count > 0)
            {
                newRootItems.Clear();

                // 添加“根项目”:
                foreach (var rootItem in rootItems)
                {
                    /** 根节点 */
                    var rootNode = nodeArray.FirstOrDefault(n => n.Id == getIndex(rootItem));
                    if (rootNode == null)
                    {
                        LogHelper.Instance.IsNull(nameof(rootNode));
                        return null;
                    }

                    /** “孙项目”数组 */
                    var subItems = remainingItems.Where(i => getParent(i) == getIndex(rootItem)).ToList();
                    newRootItems.AddRange(subItems);

                    // 添加“根节点”:
                    foreach (var subItem in subItems)
                    {
                        var subNode = new TreeNode<T>(getIndex(subItem), subItem);
                        if (rootNode.Childs == null)
                        {
                            rootNode.Childs = new List<TreeNode<T>>();
                        }
                        rootNode.Childs.Add(subNode);
                        nodeArray.Add(subNode);

                        // 删除“孙项目”:
                        remainingItems.Remove(subItem);
                    }
                }

                rootItems.Clear();
                rootItems.AddRange(newRootItems);
            }

            if (remainingItems.Count > 0)
            {
                LogHelper.Instance.Warning("There are unused items!");
            }

            return nodes;
        }
        #endregion
    }
}
