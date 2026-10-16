using TigerSan.WebApi.Base;
using TigerSan.NET8.WebApi.Helpers;
using TigerSan.NET8.WebApi.Extensions;
using TigerSan.NET8.WebApi.Interfaces.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container:
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add custom services:
builder.AddFilters();
builder.Services.AddDbContext();
builder.Services.RegisterServices();
builder.Services.AddAllowAllCors();

// Create app:
var app = builder.Build();
SettingHelper.Init(app.Configuration);

// Configure the HTTP request pipeline:
app.UseAllowAllCors();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// SSE监听：
SseInstance.InitInstance(app.Services).Start();

// 每日任务：
new DailyTask(null, async () =>
{
    // 盘点：
    await app.Services.CreateScope().ServiceProvider.GetRequiredService<IInventoryRecordService>().InventoryAll();
    // 资产状态：
    await app.Services.CreateScope().ServiceProvider.GetRequiredService<IAssetStateRecordService>().InventoryAll();
    // 清理“过期数据”：
    await app.Services.CreateScope().ServiceProvider.GetRequiredService<IAssetRecordService>().ClearExpiredRecord();
    await app.Services.CreateScope().ServiceProvider.GetRequiredService<IStationRecordService>().ClearExpiredRecord();
}).Start();

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run(SettingHelper.AppSettings.ListenUrl);