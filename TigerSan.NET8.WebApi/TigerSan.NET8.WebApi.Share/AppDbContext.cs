using Microsoft.EntityFrameworkCore;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;

namespace TigerSan.NET8.WebApi.Share
{
    public class AppDbContext : DbContextBase<AppDbContext>
    {
        #region 【Properties】
        // BaseSettings:
        public DbSet<SiteEntity> Sites { get; set; }
        public DbSet<BatchEntity> Batches { get; set; }
        // Business:
        public DbSet<AssetEntity> Assets { get; set; }
        public DbSet<AssetRecordEntity> AssetRecords { get; set; }
        public DbSet<AssetStateRecordEntity> AssetStateRecords { get; set; }
        public DbSet<InventoryRecordEntity> InventoryRecords { get; set; }
        public DbSet<VehicleEntity> Vehicles { get; set; }
        public DbSet<TransferEntity> Transfers { get; set; }
        // Dictionaries:
        public DbSet<AssetTypeEntity> AssetTypes { get; set; }
        public DbSet<ScenarioEntity> Scenarios { get; set; }
        public DbSet<SiteTypeEntity> SiteTypes { get; set; }
        public DbSet<StationTypeEntity> StationTypes { get; set; }
        public DbSet<TagTypeEntity> TagTypes { get; set; }
        // Equipments:
        public DbSet<BaseStationEntity> BaseStations { get; set; }
        public DbSet<BindingRecordEntity> BindingRecords { get; set; }
        public DbSet<StationBindingEntity> StationBindings { get; set; }
        public DbSet<StationRecordEntity> StationRecords { get; set; }
        public DbSet<TagEntity> Tags { get; set; }
        #endregion 【Properties】

        #region 【Ctor】
        public AppDbContext(AppSettings appSettings) : base(appSettings.ConnectionString)
        {
        }
        #endregion 【Ctor】
    }
}
