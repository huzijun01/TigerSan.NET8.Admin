using TigerSan.WebApi.Base;

namespace TigerSan.NET8.WebApi.Share.Dtos
{
    public class MyResults<TData> : ApiResults<TData>
    {
        // A:
        public static ApiResult<TData> AssetNotExist { get => Error("The asset do not exist!"); }
        public static ApiResult<TData> AssetIdRepeated { get => Error("The AssetId cannot be repeated!"); }
        public static ApiResult<TData> AssetNotBoundTag { get => Error("The asset is not bound to a tag!"); }
        // I:
        public static ApiResult<TData> IncorrectTagType { get => Error("Incorrect tag type!"); }
        public static ApiResult<TData> InvalidMacAddr { get => Error("The MacAddr is invalid!"); }
        public static ApiResult<TData> InvalidLocation { get => Error("The location is invalid!"); }
        // M:
        public static ApiResult<TData> MacAddrRepeated { get => Error("The MacAddr cannot be repeated!"); }
        // R:
        public static ApiResult<TData> RfidRepeated { get => Error("The RFID cannot be repeated!"); }
        // S:
        public static ApiResult<TData> SiteNotExist { get => Error("The site do not exist!"); }
        // T:
        public static ApiResult<TData> TagNotExist { get => Error("The tag do not exist!"); }
        public static ApiResult<TData> TagRepeated { get => Error("The Tag cannot be repeated!"); }
        public static ApiResult<TData> TagIdRepeated { get => Error("The TagId cannot be repeated!"); }
        public static ApiResult<TData> TagNotBoundAsset { get => Error("The tag is not bound to a asset!"); }

        #region 【Functions】
        // A:
        public static Func<string, ApiResult<TData>> AssetNotFound = assetId => Error($"The asset not found! ({assetId})");
        public static Func<string, ApiResult<TData>> AssetNoSite = assetId => Error($"The asset have no site! ({assetId})");
        public static Func<string, ApiResult<TData>> AssetsHaveBeenAllocated = assetId => Error($"The assets have been allocated! ({assetId})");
        // C:
        public static Func<string, ApiResult<TData>> CodeCannotBeEmpty = assetId => Error($"The code cannot be empty! ({assetId})");
        // E:
        public static Func<string, ApiResult<TData>> EqpTypeNotMatch = tagId => Error($"EqpType does not match! ({tagId})");
        // I:
        public static Func<string, ApiResult<TData>> IsNotTag = tagId => Error($"Is not tag! ({tagId})");
        // N:
        public static Func<string, ApiResult<TData>> NoAssetRecord = assetId => Error($"No asset record! ({assetId})");
        public static Func<string, ApiResult<TData>> NotInbound = assetId => Error($"The asset is not in the Inbound state! ({assetId})");
        public static Func<string, ApiResult<TData>> NotInStoreOrStolid = assetId => Error($"The asset is not in the InStore or Stolid state! ({assetId})");
        // S:
        public static Func<string, ApiResult<TData>> StationNotFound = stationId => Error($"The station not found! ({stationId})");
        public static Func<string, ApiResult<TData>> StationNotMobile = stationId => Error($"The station is not mobile! ({stationId})");
        // T:
        public static Func<string, ApiResult<TData>> TagNotFound = tagId => Error($"The tag not found! ({tagId})");
        public static Func<string, ApiResult<TData>> TargetSameToSite = assetId => Error($"The target cannot be the same as the site! ({assetId})");
        public static Func<string, ApiResult<TData>> TargetSiteSameAsCurrent = assetId => Error($"The target site cannot be the same as the current site! ({assetId})");
        #endregion 【Functions】
    }
}
