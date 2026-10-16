using System.Runtime.CompilerServices;
using System.ComponentModel.DataAnnotations.Schema;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    /// <summary>
    /// 将“属性名称”转换为“蛇形命名”作为列名的列特性
    /// </summary>
    public class SnakeColumnAttribute : ColumnAttribute
    {
        public SnakeColumnAttribute([CallerMemberName] string name = "") : base(name.ToSnakeCase()) { }
    }
}
