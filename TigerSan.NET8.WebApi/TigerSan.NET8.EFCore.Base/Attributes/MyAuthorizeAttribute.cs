using System;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TigerSan.NET8.EFCore.Base
{
    /// <summary>不是ID控制器</summary>
    public class NotIdControllerAttribute : Attribute, IFilterMetadata
    {
    }

    /// <summary>需要授权</summary>
    public class NeedAuthorizeAttribute : Attribute, IFilterMetadata
    {
    }

    /// <summary>无需授权</summary>
    public class NoNeedAuthorizeAttribute : Attribute, IFilterMetadata
    {
    }

    /// <summary>按公司过滤</summary>
    public class FilterByCompanyAttribute : Attribute, IFilterMetadata
    {
    }
}
