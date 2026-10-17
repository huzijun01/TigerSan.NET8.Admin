using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class CompanyFilter : Attribute, IAsyncActionFilter
    {
        #region 【Fields】
        private readonly string Filter = "filter";
        private readonly IUserService _userService;
        private readonly ICompanyService _companyService;
        #endregion 【Fields】

        #region 【Ctor】
        public CompanyFilter(IUserService userService, ICompanyService companyService)
        {
            _userService = userService;
            _companyService = companyService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region 执行时
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // 是否“无需添加公司过滤器”:
            if (context.HasAttribute<NotIdControllerAttribute>()
                || context.HasAttribute<NoNeedAuthorizeAttribute>())
            {
                await next();
                return;
            }

            // 获取“Token信息”:
            context.HttpContext.Items.TryGetValue(ApiAuthorizeFilter.Token_Info, out var value);
            var tokenInfo = value as TokenInfo;
            if (tokenInfo == null)
            {
                context.Result = new JsonResult(ApiResults<object>.IsNull(nameof(tokenInfo)));
                return;
            }

            // 获取“用户信息”：
            var resGetUserInfo = await _userService.GetUserInfo(tokenInfo.Username);
            var userInfo = resGetUserInfo.Data;
            if (userInfo == null)
            {
                context.Result = new JsonResult(ApiResults<object>.UserNotExist);
                return;
            }

            // 设置“用户信息”：
            ObjectHelper.SetProperty(
                context.Controller,
                nameof(IIdControllerBase.UserInfo),
                userInfo);

            // 按公司过滤:
            if (!context.HasAttribute<FilterByCompanyAttribute>())
            {
                await next();
                return;
            }

            /** “可访问公司”集合 */
            List<CompanyEntity>? accessibleCompanies;

            // 是否为“根管理员”:
            if (userInfo.IsRoot)
            {
                var resGetList = await _companyService.GetList();
                accessibleCompanies = resGetList.Data;
                if (accessibleCompanies == null)
                {
                    context.Result = new JsonResult(resGetList);
                    return;
                }
            }
            else
            {
                // 获取“可访问公司”集合:
                var resGetAccessibleCompanies = await _companyService.GetAccessibleCompanies(userInfo.CompanyIdName.Id);
                accessibleCompanies = resGetAccessibleCompanies.Data;
                if (accessibleCompanies == null)
                {
                    context.Result = new JsonResult(resGetAccessibleCompanies);
                    return;
                }
            }

            // 设置“可访问公司”集合:
            ObjectHelper.SetProperty(
                context.Controller,
                nameof(IIdControllerBase.AccessibleCompanies),
                accessibleCompanies);

            // 是否不为“根管理员”，且包含“filter参数”:
            if (!userInfo.IsRoot && context.ActionArguments.TryGetValue(Filter, out var filterArgument))
            {
                var filter = filterArgument as FilterDto ?? new FilterDto();

                // 是否为“公司”控制器:
                if (context.IsController<CompanyController>())
                {
                    // 是否为“GetList”行为:
                    if (context.IsAction(nameof(ICompanyService.GetList)))
                    {
                        // 直接返回“可访问公司”集合:
                        context.Result = new JsonResult(ApiResults<List<CompanyEntity>>.Success(null, accessibleCompanies));
                        return;
                    }

                    // 修改“filter参数”:
                    filter.Filters = [new PropFilter(){
                                PropName = nameof(CompanyEntity.Id),
                                Values = accessibleCompanies.Select(c => c.Id as object).ToList()
                            }];
                }
                else
                {
                    // 获取“控制器”中的“服务”：
                    var service = ObjectHelper.GetField(context.Controller, nameof(IIdControllerBase._service)) as IDbSetConfig;
                    if (service == null)
                    {
                        context.Result = new JsonResult(ApiResults<object>.IsNull(nameof(service)));
                        return;
                    }

                    // 修改“filter参数”:
                    FilterHelper.SetCompanyParentFilter(service.DbSetConfig, ref filter, accessibleCompanies);
                }

                context.ActionArguments.Remove(Filter);
                context.ActionArguments.Add(Filter, filter);
            }

            await next();
        }
        #endregion
        #endregion 【Functions】
    }
}
