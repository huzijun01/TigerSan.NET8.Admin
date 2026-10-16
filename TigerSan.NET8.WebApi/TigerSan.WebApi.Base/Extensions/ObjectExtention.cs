using System.Linq;
using System.Reflection;

namespace TigerSan.WebApi.Base
{
    public static class ObjectExtention
    {
        #region 浅复制
        public static TTarget ShallowCopy<TTarget, TSource>(this TTarget target, TSource source, string[]? excludeProps = null)
            where TTarget : class
            where TSource : class
        {
            // 获取源类型和目标类型的公共实例属性
            var sourceProps = typeof(TSource).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var targetProps = typeof(TTarget).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var targetProp in targetProps)
            {
                // 检查是否在排除列表中
                if (excludeProps != null && excludeProps.Contains(targetProp.Name)) continue;

                // 仅处理可写属性
                if (!targetProp.CanWrite) continue;

                // 查找同名同类型的源属性
                var sourceProp = sourceProps.FirstOrDefault(p =>
                    p.Name == targetProp.Name &&
                    p.PropertyType == targetProp.PropertyType &&
                    p.CanRead);

                // 存在有效源属性时复制值
                if (sourceProp != null)
                {
                    var value = sourceProp.GetValue(source);
                    targetProp.SetValue(target, value);
                }
            }

            return target;
        }
        #endregion
    }
}
