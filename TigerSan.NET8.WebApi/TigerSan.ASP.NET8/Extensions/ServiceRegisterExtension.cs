using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Helpers;
using TigerSan.NET8.WebApi.Services.Models;
using TigerSan.NET8.WebApi.Interfaces.Models;
using Microsoft.EntityFrameworkCore;

namespace TigerSan.NET8.WebApi.Extensions
{
    public static class ServiceRegisterExtension
    {
        #region 添加“过滤器”
        public static void AddFilters(this WebApplicationBuilder builder)
        {
            builder.Services.AddControllersWithViews(option =>
            {
                option.Filters.Add<ApiAuthorizeFilter>();
                option.Filters.Add<CompanyFilter>();

                if (builder.Environment.IsDevelopment())
                {
                    option.Filters.Add<LogFilterAttribute>();
                }
            });
        }
        #endregion

        #region 添加“数据库上下文”
        public static void AddDbContext(this IServiceCollection services)
        {
            services.RegisterAppSettings();
            services.AddDbContext<AppDbContext>();
        }
        #endregion

        #region 添加“CORS服务”
        public static void AddAllowAllCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy
                        .AllowAnyOrigin()       // 允许任何来源
                        .AllowAnyMethod()       // 允许任何HTTP方法
                        .AllowAnyHeader();      // 允许任何头信息
                });
            });
        }
        #endregion

        #region 使用“CORS服务”
        public static void UseAllowAllCors(this WebApplication app)
        {
            app.UseCors("AllowAll");
        }
        #endregion

        #region 注册“服务”
        public static void RegisterServices(this IServiceCollection services)
        {
            // Base:
            services.AddTransient<IAdminService, AdminService<AppDbContext>>();
            services.AddTransient<IAuthorityService, AuthorityService<AppDbContext>>();
            services.AddTransient<ICompanyService, CompanyService<AppDbContext>>();
            services.AddTransient<IDepartmentService, DepartmentService<AppDbContext>>();
            services.AddTransient<IPersonService, PersonService<AppDbContext>>();
            services.AddTransient<IRoleService, RoleService<AppDbContext>>();
            services.AddTransient<IUserService, UserService<AppDbContext>>();
            services.AddTransient<IFileService, FileService>();
            CompanyService<AppDbContext>._beforeDelete = async (db, id) =>
            {
                await db.AssetStateRecords.Where(i => i.Company == id).ExecuteDeleteAsync();
                return ApiResults<object>.OperationSuccess;
            };
            CompanyService<AppDbContext>._beforeRangeDelete = async (db, ids) =>
            {
                await db.AssetStateRecords.Where(i => ids.Contains(i.Company)).ExecuteDeleteAsync();
                return ApiResults<object>.OperationSuccess;
            };

            // BaseSettings:
            services.AddTransient<ISiteService, SiteService>();
            services.AddTransient<IBatchService, BatchService>();
            // Business:
            services.AddTransient<IAssetService, AssetService>();
            services.AddTransient<IAssetRecordService, AssetRecordService>();
            services.AddTransient<IAssetStateRecordService, AssetStateRecordService>();
            services.AddTransient<IInventoryRecordService, InventoryRecordService>();
            services.AddTransient<IVehicleService, VehicleService>();
            services.AddTransient<ITransferService, TransferService>();
            // Dictionaries:
            services.AddTransient<IAssetTypeService, AssetTypeService>();
            services.AddTransient<IScenarioService, ScenarioService>();
            services.AddTransient<ISiteTypeService, SiteTypeService>();
            services.AddTransient<IStationTypeService, StationTypeService>();
            services.AddTransient<ITagTypeService, TagTypeService>();
            // Equipments:
            services.AddTransient<IBaseStationService, BaseStationService>();
            services.AddTransient<IBindingRecordService, BindingRecordService>();
            services.AddTransient<IStationBindingService, StationBindingService>();
            services.AddTransient<IStationRecordService, StationRecordService>();
            services.AddTransient<ITagService, TagService>();
        }
        #endregion
    }
}
