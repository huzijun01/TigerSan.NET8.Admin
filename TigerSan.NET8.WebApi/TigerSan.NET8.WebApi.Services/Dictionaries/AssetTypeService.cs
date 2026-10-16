using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Services.Models
{
    public class AssetTypeService : IdNameCompanyServiceBase<AssetTypeEntity, AppDbContext>, IAssetTypeService
    {
        #region 【Ctor】
        static AssetTypeService()
        {
            SetDbSetConfig(nameof(AssetTypeEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public AssetTypeService(AppDbContext db) : base(db, db.AssetTypes)
        {
        }
        #endregion 【Ctor】
    }
}
