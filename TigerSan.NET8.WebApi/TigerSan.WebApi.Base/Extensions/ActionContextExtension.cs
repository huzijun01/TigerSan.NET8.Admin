using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Controllers;

namespace TigerSan.NET8.EFCore.Base
{
    public static class ActionContextExtension
    {
        #region 是否包含指定特性
        /// <summary>是否包含指定特性</summary>
        public static bool HasAttribute<TAttribute>(this ActionContext context, bool isControllerHas = true)
        where TAttribute : Attribute
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            var actionDescriptor = context.ActionDescriptor as ControllerActionDescriptor;
            return actionDescriptor?.MethodInfo != null && actionDescriptor.MethodInfo.GetCustomAttributes(typeof(TAttribute), inherit: true).Any()
                || isControllerHas && actionDescriptor != null && actionDescriptor.ControllerTypeInfo.GetCustomAttributes(typeof(TAttribute), inherit: true).Any();
        }
        #endregion

        #region 是否为指定名称行为
        /// <summary>是否为指定名称行为</summary>
        public static bool IsAction(this ActionContext context, string actionName)
        {
            context.RouteData.Values.TryGetValue("action", out var value);
            var action = value as string;
            return action != null && string.Equals(action, actionName);
        }
        #endregion

        #region 是否为指定名称控制器
        /// <summary>是否为指定名称控制器</summary>
        public static bool IsController(this ActionContext context, string controllerName)
        {
            context.RouteData.Values.TryGetValue("controller", out var value);
            var controller = value as string;
            return controller != null && string.Equals(controller, controllerName);
        }
        #endregion

        #region 是否为指定类型控制器
        /// <summary>是否为指定类型控制器</summary>
        public static bool IsController<TController>(this ActionExecutingContext context) where TController : class
        {
            return context.Controller.GetType() == typeof(TController);
        }
        #endregion

        #region 获取“Authorization头”
        /// <summary>获取“Authorization头”</summary>
        public static string? GetAuthorization(this ActionContext context)
        {
            return context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        }
        #endregion
    }
}
