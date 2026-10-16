using Microsoft.AspNetCore.Mvc;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Helpers;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Share.Packages;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Controllers
{
    [FilterByCompany]
    public class AssetRecordController : IdControllerBase<AssetRecordEntity, IAssetRecordService>
    {
        #region 【Fields】
        private readonly ITagService _tagService;
        private readonly IAssetService _assetService;
        private readonly IBaseStationService _baseStationService;
        #endregion 【Fields】

        #region 【Ctor】
        public AssetRecordController(
            IAssetRecordService service,
            ITagService tagService,
            IAssetService assetService,
            IBaseStationService baseStationService) : base(service)
        {
            _tagService = tagService;
            _assetService = assetService;
            _baseStationService = baseStationService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpGet]
        [Route("Last")]
        /// <summary>获取“最新数据”</summary>
        public async Task<ApiResult<AssetRecordEntity>> GetLast(long asset)
        {
            return await _service.GetLast(asset);
        }

        [HttpGet]
        [Route("FullLast")]
        /// <summary>获取“最新完整数据”</summary>
        public async Task<ApiResult<AssetRecordDto>> GetFullLast(long asset)
        {
            return await _service.GetFullLast(asset);
        }

        [HttpPost]
        [Route("FullList")]
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<AssetRecordDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetFullList(pageSize, pageNumber, sort, ascending, filter);
        }


        [HttpPost]
        [Route("CoordCount")]
        /// <summary>获取“坐标”总数</summary>
        public async Task<ApiResult<int>> GetCoordCount(
            long asset,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetCoordCount(asset, start, end, locationMode, filter);
        }

        [HttpPost]
        [Route("Path")]
        /// <summary>获取“路径”</summary>
        public async Task<ApiResult<List<LocationRecord>>> GetPath(
            long asset,
            int? pageSize = GlobalSettings.MaxCoordCount,
            int? pageNumber = 1,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetPath(asset, pageSize, pageNumber, start, end, locationMode, filter);
        }
        #endregion [查]

        #region [增]
        [HttpPost("ByPackage")]
        /// <summary>添加“单条数据”</summary>
        public async Task<ApiResult<object>> AddByPackage([FromBody] AssetRecordEntity entity)
        {
            var asset = (await _assetService.Get(entity.Asset)).Data;
            if (asset == null)
            {
                LogHelper.Instance.IsNull(nameof(asset.Tag));
                return MyResults<object>.AssetNotBoundTag;
            }

            var tag = (await _tagService.Get(asset.Tag ?? 0)).Data;
            if (tag == null)
            {
                LogHelper.Instance.IsNull(nameof(tag));
                return MyResults<object>.TagNotFound(asset.TagId ?? "");
            }

            var station = (await _baseStationService.Get(entity.Station ?? 0)).Data;
            if (station == null)
            {
                LogHelper.Instance.IsNull(nameof(station));
                return MyResults<object>.StationNotFound(asset.Station.ToString() ?? "");
            }

            BaseStationPackage package = new BaseStationPackage();
            package.ReportTime = DateTimeHelper.GetBeijingNow().ToString();
            package.Data.Topic = station.MacAddr;
            package.Data.Longitude = entity.Longitude ?? 0;
            package.Data.Latitude = entity.Latitude ?? 0;
            package.Data.TagDatas0.Add(new BluetoothTagData
            {
                TagId = tag.TagId,
                Battery = entity.Battery ?? 0,
                Temperature = entity.Temperature ?? 0,
                SignalRaw = entity.Signal ?? 0,
            });

            return await SseInstance.EditBaseStationAndTagAsync(package);
        }
        #endregion [增]
        #endregion 【Functions】
    }
}
