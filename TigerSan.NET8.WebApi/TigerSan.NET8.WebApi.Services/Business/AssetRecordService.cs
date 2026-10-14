using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Services.Models
{
    public class AssetRecordService : IdServiceBase<AssetRecordEntity, AppDbContext>, IAssetRecordService
    {
        #region 【Fields】
        private IBaseStationService _baseStationService;
        private readonly IInventoryRecordService _inventoryRecordService;

        /// <summary>正在修改的标签</summary>
        private Dictionary<long, TagDto> _editingTags = new Dictionary<long, TagDto>();
        #endregion 【Fields】

        #region 【Ctor】
        static AssetRecordService()
        {
            SetDbSetConfig(nameof(AssetRecordEntity.Asset))
                .SetParent(typeof(AssetEntity), nameof(_db.Assets), nameof(AssetEntity.Department))
                .SetParent(typeof(DepartmentEntity), nameof(_db.Departments), nameof(DepartmentEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public AssetRecordService(
            AppDbContext db,
            IBaseStationService baseStationService,
            IInventoryRecordService inventoryRecordService) : base(db, db.AssetRecords)
        {
            _baseStationService = baseStationService;
            _inventoryRecordService = inventoryRecordService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [Private]
        #region 初始化“场地”
        /// <summary>初始化“场地”</summary>
        private async Task<ApiResult<object>> InitSiteAsync(AssetRecordEntity entity)
        {
            try
            {
                if (entity.Station == null)
                {
                    entity.Site = null;
                }
                else
                {
                    var resGetSite = await _baseStationService.GetSite(entity.Station.Value);
                    var site = resGetSite.Data;
                    if (site == null)
                    {
                        return MyResults<object>.Error(resGetSite.Message);
                    }
                    else
                    {
                        entity.Site = site.Id;
                    }
                }
            }
            catch (Exception e)
            {
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return MyResults<object>.OperationSuccess;
        }
        #endregion

        #region 获取“周转次数”
        /// <summary>获取“周转次数”</summary>
        private int GetMoves(List<AssetRecordEntity> records, DateTime? start = null)
        {
            int moves = 0;

            if (start != null) records = records.Where(r => r.ReportTime > start).ToList();

            AssetRecordEntity? inbound = null;
            foreach (var record in records)
            {
                if (record.State == AssetStates.Inbound)
                {
                    if (inbound != null && inbound.Site == record.Site) continue;
                    inbound = record;
                    ++moves;
                }
                else if (record.State == AssetStates.Outbound)
                {
                    inbound = null;
                }
            }

            return moves;
        }
        #endregion

        #region 获取“完整数据”
        /// <summary>获取“完整数据”</summary>
        private async Task<ApiResult<AssetRecordDto>> GetFull(AssetRecordEntity record)
        {
            try
            {
                var dto = new AssetRecordDto();
                dto.ShallowCopy(record);

                var tag = await _db.Tags.AsNoTracking().FirstOrDefaultAsync(i => i.Id == record.Tag);
                if (tag == null)
                {
                    LogHelper.Instance.IsNull(nameof(tag));
                }
                else
                {
                    dto.TagId = tag.TagId;
                }

                if (record.Station != null)
                {
                    var station = await _db.BaseStations.AsNoTracking().FirstOrDefaultAsync(i => i.Id == record.Station);
                    if (station == null)
                    {
                        LogHelper.Instance.IsNull(nameof(station));
                    }
                    else
                    {
                        dto.StationId = station.MacAddr;
                        dto.StationName = station.Name;
                    }
                }

                if (record.Site != null)
                {
                    var site = await _db.Sites.AsNoTracking().FirstOrDefaultAsync(i => i.Id == record.Site);
                    if (site == null)
                    {
                        LogHelper.Instance.IsNull(nameof(site));
                    }
                    else
                    {
                        dto.SiteName = site.Name;
                        dto.Addr = site.Addr;
                        dto.AddrDetail = site.AddrDetail;
                    }
                }

                if (record.TargetSite != null)
                {
                    var site = await _db.Sites.AsNoTracking().FirstOrDefaultAsync(i => i.Id == record.TargetSite);
                    if (site == null)
                    {
                        LogHelper.Instance.IsNull(nameof(site));
                    }
                    else
                    {
                        dto.TargetSiteName = site.Name;
                        dto.TargetAddr = site.Addr;
                        dto.TargetAddrDetail = site.AddrDetail;
                    }
                }

                return MyResults<AssetRecordDto>.Success(null, dto);
            }
            catch (Exception e)
            {
                return MyResults<AssetRecordDto>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“查询条件”
        /// <summary>获取“查询条件”</summary>
        private async Task<ApiResult<IQueryable<AssetRecordEntity>>> GetIQueryable(
            long asset,
            int? pageSize = null,
            int? pageNumber = null,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            FilterDto? filter = null)
        {
            try
            {
                var queryable = start != null && end != null
                    ? _dbSet.AsNoTracking().Where(i => i.Asset == asset
                    && i.Longitude != null && i.Longitude.Value > 0
                    && i.Latitude != null && i.Latitude.Value > 0
                    && i.ReportTime >= start && i.ReportTime <= end)
                    : _dbSet.AsNoTracking().Where(i => i.Asset == asset
                    && i.Longitude != null && i.Longitude.Value > 0
                    && i.Latitude != null && i.Latitude.Value > 0);

                if (locationMode != null)
                {
                    queryable = queryable.Where(i => i.LocationMode == locationMode);
                }

                var res = await GetFilter(queryable, filter);
                queryable = res.Data;
                if (queryable == null)
                {
                    return MyResults<IQueryable<AssetRecordEntity>>.Error(res.Message);
                }

                queryable = queryable.OrderByDescending(i => i.ReportTime);

                return MyResults<IQueryable<AssetRecordEntity>>.Success(null, queryable.GetPage(pageSize, pageNumber));
            }
            catch (Exception e)
            {
                return MyResults<IQueryable<AssetRecordEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [Private]

        #region [查]
        #region 获取“最新数据”
        /// <summary>获取“最新数据”</summary>
        public async Task<ApiResult<AssetRecordEntity>> GetLast(long asset)
        {
            try
            {
                var entity = await _dbSet
                    .AsNoTracking()
                    .Where(ar => ar.Asset == asset)
                    .OrderByDescending(ar => ar.ReportTime)
                    .FirstOrDefaultAsync();

                return MyResults<AssetRecordEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                return MyResults<AssetRecordEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“最新完整数据”
        /// <summary>获取“最新完整数据”</summary>
        public async Task<ApiResult<AssetRecordDto>> GetFullLast(long asset)
        {
            try
            {
                var record = await _dbSet
                    .AsNoTracking()
                    .Where(i => i.Asset == asset)
                    .OrderByDescending(ar => ar.ReportTime)
                    .FirstOrDefaultAsync();
                if (record == null) return MyResults<AssetRecordDto>.Success();

                return await GetFull(record);
            }
            catch (Exception e)
            {
                return MyResults<AssetRecordDto>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”集合
        /// <summary>获取“完整数据”集合</summary>
        public async Task<ApiResult<List<AssetRecordDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            try
            {
                var list = new List<AssetRecordDto>();

                var res = await GetList(pageSize, pageNumber, sort, ascending, filter);
                if (res.Data == null)
                {
                    return MyResults<List<AssetRecordDto>>.Error(res.Message);
                }
                var records = res.Data;

                // 添加“数据”:
                foreach (var record in records)
                {
                    var resFull = await GetFull(record);
                    if (resFull.Data != null)
                    {
                        list.Add(resFull.Data);
                    }
                    else
                    {
                        var dto = new AssetRecordDto();
                        dto.ShallowCopy(record);
                        list.Add(dto);
                    }
                }

                return MyResults<List<AssetRecordDto>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<AssetRecordDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“最新入库数据”
        /// <summary>获取“最新入库数据”</summary>
        public async Task<ApiResult<AssetRecordEntity>> GetLastInbound(long asset)
        {
            try
            {
                var entity = await _dbSet
                    .AsNoTracking()
                    .Where(i => i.Asset == asset && i.State == AssetStates.Inbound)
                    .OrderByDescending(ar => ar.ReportTime)
                    .FirstOrDefaultAsync();

                if (entity == null)
                {
                    return MyResults<AssetRecordEntity>.Error(LogHelper.Instance.IsNull(nameof(entity)));
                }

                return MyResults<AssetRecordEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                return MyResults<AssetRecordEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“坐标”总数
        public async Task<ApiResult<int>> GetC‌oordCount(
            long asset,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            FilterDto? filter = null)
        {
            try
            {
                var res = await GetIQueryable(asset, null, null, start, end, locationMode, filter);
                var queryable = res.Data;
                if (queryable == null)
                {
                    return MyResults<int>.Error(res.Message);
                }

                return MyResults<int>.Success(null, await queryable.CountAsync());
            }
            catch (Exception e)
            {
                return MyResults<int>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“路径”
        /// <summary>获取“路径”</summary>
        public async Task<ApiResult<List<LocationRecord>>> GetPath(
            long asset,
            int? pageSize = GlobalSettings.MaxCoordCount,
            int? pageNumber = 1,
            DateTime? start = null,
            DateTime? end = null,
            LocationModes? locationMode = null,
            FilterDto? filter = null)
        {
            try
            {
                var res = await GetIQueryable(asset, pageSize, pageNumber, start, end, locationMode, filter);
                var queryable = res.Data;
                if (queryable == null)
                {
                    return MyResults<List<LocationRecord>>.Error(res.Message);
                }

                var positions = await queryable
                    .Select(i => new LocationRecord()
                    {
                        Site = i.Site,
                        Station = i.Station,
                        Longitude = i.Longitude,
                        Latitude = i.Latitude,
                        Address = i.Address,
                        ReportTime = i.ReportTime,
                        LocationMode = i.LocationMode,
                    })
                    .ToListAsync();

                // 补充“位置信息”:
                foreach (var position in positions)
                {
                    if (position.Site != null)
                    {
                        var site = await _db.Sites.AsNoTracking().FirstOrDefaultAsync(s => s.Id == position.Site.Value);
                        if (site == null)
                        {
                            LogHelper.Instance.IsNull(nameof(site));
                        }
                        else
                        {
                            if (string.IsNullOrEmpty(position.Address))
                            {
                                position.Address = site.FullAddr;
                            }

                            if ((position.Longitude == null || position.Latitude == null))
                            {
                                position.Longitude = site.Longitude;
                                position.Latitude = site.Latitude;
                            }
                        }
                    }

                    if (position.Station != null)
                    {
                        var station = await _db.BaseStations.AsNoTracking().FirstOrDefaultAsync(s => s.Id == position.Station.Value);
                        if (station == null)
                        {
                            LogHelper.Instance.IsNull(nameof(station));
                        }
                        else
                        {
                            position.StationName = station.Name;
                        }
                    }
                }

                return MyResults<List<LocationRecord>>.Success(null, positions);
            }
            catch (Exception e)
            {
                return MyResults<List<LocationRecord>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        /// <summary>添加“单条数据”</summary>
        public override async Task<ApiResult<AssetRecordEntity>> Add(AssetRecordEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 初始化“场地”:
                var resInit = await InitSiteAsync(entity);
                if (resInit.IsError)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    return resInit.Convert<AssetRecordEntity>();
                }

                // 更新“ID”:
                entity.UpdateId();
                // 添加数据:
                _dbSet.Add(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return MyResults<AssetRecordEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<AssetRecordEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 添加“多条数据”
        /// <summary>添加“多条数据”</summary>
        public override async Task<ApiResult<object>> AddRange(List<AssetRecordEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                var changes = new List<AssetRecordEntity>();
                foreach (var entity in entities)
                {
                    // 初始化“场地”:
                    var resInit = await InitSiteAsync(entity);
                    if (resInit.IsError)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        return resInit;
                    }

                    entity.UpdateId();
                    changes.Add(entity);
                }

                await _dbSet.AddRangeAsync(changes);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return MyResults<object>.OperationSuccess;
        }
        #endregion
        #endregion [增]

        #region [改]
        #region 修改“单条数据”
        /// <summary>修改“单条数据”</summary>
        public override async Task<ApiResult<object>> Edit(AssetRecordEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 检验“资源”是否存在:
                var find = await _dbSet.FirstOrDefaultAsync(i => i.Id == entity.Id);
                if (find == null)
                {
                    return MyResults<object>.ResourceNotExist;
                }

                // 修改“数据”:
                find.ShallowCopy(entity);

                // 初始化“场地”:
                var resInit = await InitSiteAsync(entity);
                if (resInit.IsError)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    return resInit;
                }

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return MyResults<object>.OperationSuccess;
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 修改“多条数据”
        /// <summary>修改“多条数据”</summary>
        public override async Task<ApiResult<object>> EditRange(List<AssetRecordEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                if (entities.Count < 1) return MyResults<object>.OperationSuccess;

                var ids = entities.Select(i => i.Id).ToList();

                // 检验“资源”是否存在:
                var finds = await _dbSet.Where(i => ids.Contains(i.Id)).ToListAsync();
                if (finds.Count < 1)
                {
                    return MyResults<object>.ResourceNotExist;
                }
                else if (finds.Count < ids.Count)
                {
                    return MyResults<object>.SomeResourceNotExist;
                }

                // 修改“数据”:
                foreach (var find in finds)
                {
                    var entity = entities.FirstOrDefault(i => i.Id == find.Id);
                    if (entity == null)
                    {
                        return MyResults<object>.SomeResourceNotExist;
                    }
                    find.ShallowCopy(entity);

                    // 初始化“场地”:
                    var resInit = await InitSiteAsync(entity);
                    if (resInit.IsError)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        return resInit;
                    }
                }

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return MyResults<object>.OperationSuccess;
        }
        #endregion
        #endregion [改]

        #region [Other]
        #region 修改“资产记录”
        /// <summary>修改“资产记录”</summary>
        public async Task<ApiResult<object>> EditAssetRecordAsync(TagDto oldTag, TagDto newTag, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                _editingTags.TryGetValue(newTag.Id, out var editingTag);
                if (editingTag != null || oldTag.Asset == null || newTag.Asset == null) return MyResults<object>.OperationSuccess;
                _editingTags.Add(newTag.Id, newTag); // 开始修改

                await PushTagDto.PushTagDtoAsync(newTag);

                #region 获取“资产”
                var asset = await _db.Assets.FirstOrDefaultAsync(i => i.Id == newTag.Asset);
                if (asset == null)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    return MyResults<object>.Error(LogHelper.Instance.IsNull(nameof(asset)));
                }
                #endregion

                #region 获取“最新记录”
                var resLast = await GetLast(newTag.Asset.Value);
                if (resLast.IsError)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    LogHelper.Instance.Error(resLast.Message);
                    return MyResults<object>.Error(resLast.Message);
                }
                var lastRecord = resLast.Data;
                #endregion

                #region 获取“基站”
                BaseStationEntity? oldStation = null;
                if (lastRecord?.Station != null)
                {
                    oldStation = await _db.BaseStations.AsNoTracking().FirstOrDefaultAsync(b => b.Id == lastRecord.Station);
                    if (oldStation == null)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        LogHelper.Instance.IsNull(nameof(transaction));
                        return MyResults<object>.ResourceNotExist;
                    }
                }

                BaseStationEntity? newStation = null;
                if (newTag.Station != null)
                {
                    newStation = await _db.BaseStations.AsNoTracking().FirstOrDefaultAsync(b => b.Id == newTag.Station);
                    if (newStation == null)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        LogHelper.Instance.IsNull(nameof(transaction));
                        return MyResults<object>.ResourceNotExist;
                    }
                }
                #endregion

                bool isChangeStation;
                AssetRecordEntity newRecord;

                if (lastRecord == null) // 若“无记录”，新增“入库记录”
                {
                    isChangeStation = true;

                    newRecord = new AssetRecordEntity()
                    {
                        Asset = newTag.Asset.Value,
                        Tag = newTag.Id,
                        State = AssetStates.Inbound,
                    };
                    newRecord.ShallowCopy(newTag);
                    newRecord.ReportTime = newTag.ReportTime ?? DateTimeHelper.GetUtcNow();

                    var res = await Add(newRecord, false);
                    if (res.IsError)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        LogHelper.Instance.Error(res.Message);
                        return res.Convert<object>();
                    }

                    if (asset.IsAuto)
                    {
                        // 新增“在库记录”：
                        newRecord.State = AssetStates.InStore;
                        newRecord.ReportTime = newRecord.ReportTime.AddSeconds(1);
                        var resInStore = await Add(newRecord, false);
                        if (resInStore.IsError)
                        {
                            if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                            LogHelper.Instance.Error(resInStore.Message);
                            return resInStore.Convert<object>();
                        }
                    }
                }
                else
                {
                    newRecord = new AssetRecordEntity();
                    newRecord.ShallowCopy(lastRecord);
                    newRecord.ShallowCopy(newTag, [nameof(AssetRecordEntity.Id)]);

                    if (newStation?.Site != null && oldStation?.Site != newStation.Site) // 若“场地”改变，新增“入库记录”
                    {
                        isChangeStation = true;

                        // 添加“场地”:
                        newRecord.Site = newStation.Site;

                        #region 修改“盘点记录”
                        if (oldStation != null)
                        {
                            await _inventoryRecordService.ReduceAsset(oldStation.Site);
                        }

                        if (newStation != null)
                        {
                            await _inventoryRecordService.AddAsset(newStation.Site);
                        }
                        #endregion

                        #region 补“出库记录”
                        if (lastRecord.State != AssetStates.Outbound
                            && lastRecord.State != AssetStates.InTransit) // 无“出库记录”
                        {
                            ApiResult<object> resOutbound;
                            lastRecord.State = AssetStates.Outbound;
                            lastRecord.TargetSite = newRecord.Site;

                            if ((lastRecord.State == AssetStates.InStore || lastRecord.State == AssetStates.Stolid)
                                && lastRecord.OnlineState == OnlineStates.Offline) // 若“在库”且“离线”
                            {
                                // 将“最新记录”改为“出库记录”：
                                resOutbound = await Edit(lastRecord, false);
                            }
                            else
                            {
                                // 新增“出库记录”：
                                lastRecord.ReportTime = lastRecord.ReportTime.AddSeconds(1);
                                resOutbound = (await Add(lastRecord, false)).Convert<object>();
                            }

                            if (resOutbound.IsError)
                            {
                                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                                LogHelper.Instance.Error(resOutbound.Message);
                                return resOutbound;
                            }
                        }
                        #endregion

                        #region 新增“在途记录”或“入库记录”
                        newRecord.TargetSite = null;
                        newRecord.ReportTime = newTag.ReportTime ?? DateTimeHelper.GetUtcNow();
                        newRecord.State = newTag.Station == null ? AssetStates.InTransit : AssetStates.Inbound;
                        var res = await Add(newRecord, false);
                        if (res.IsError)
                        {
                            if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                            LogHelper.Instance.Error(res.Message);
                            return res.Convert<object>();
                        }
                        #endregion

                        #region 自动新增“在库记录”，并完成“调拨”
                        if (asset.IsAuto && newRecord.State == AssetStates.Inbound)
                        {
                            // 新增“在库记录”：
                            newRecord.State = AssetStates.InStore;
                            newRecord.ReportTime = newRecord.ReportTime.AddSeconds(1);
                            var resInStore = await Add(newRecord, false);
                            if (resInStore.IsError)
                            {
                                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                                LogHelper.Instance.Error(resInStore.Message);
                                return resInStore.Convert<object>();
                            }

                            // 完成“调拨”：
                            if (asset.Transfer != null)
                            {
                                var transfer = await _db.Transfers.FirstOrDefaultAsync(i => i.Id == asset.Transfer);
                                if (transfer == null)
                                {
                                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                                    return MyResults<object>.Error(LogHelper.Instance.IsNull(nameof(transfer)));
                                }

                                if (transfer.Target == newRecord.Site)
                                {
                                    asset.Transfer = null;
                                    transfer.EndTime = DateTimeHelper.GetUtcNow();
                                }
                            }
                        }
                        #endregion
                    }
                    else // 同一场地
                    {
                        #region 若“在库”，判断是否“滞留”
                        if (asset.Transfer != null && lastRecord.State == AssetStates.InStore)
                        {
                            var resLastInbound = await GetLastInbound(newTag.Asset.Value);
                            var lastInboundRecord = resLastInbound.Data;
                            if (lastInboundRecord == null)
                            {
                                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                                LogHelper.Instance.Error(resLastInbound.Message);
                                return resLastInbound.Convert<object>();
                            }

                            newRecord.State = (DateTimeHelper.GetUtcNow() - lastInboundRecord.ReportTime).TotalHours
                                > GlobalSettings.StolidThresholdHours
                                ? AssetStates.Stolid : AssetStates.InStore;
                        }
                        #endregion

                        newRecord.ReportTime = newTag.ReportTime ?? DateTimeHelper.GetUtcNow();

                        if (oldTag.OnlineState != newTag.OnlineState) // “在线状态”改变
                        {
                            isChangeStation = false;

                            #region 若“出库”且“离线”，改为“在途记录”
                            if (lastRecord.State == AssetStates.Outbound
                                && newTag.OnlineState == OnlineStates.Offline)
                            {
                                newRecord.State = AssetStates.InTransit;
                            }
                            #endregion

                            // 新增记录:
                            var res = await Add(newRecord, false);
                            if (res.IsError)
                            {
                                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                                LogHelper.Instance.Error(res.Message);
                                return res.Convert<object>();
                            }
                        }
                        else if (oldStation == newStation) // 同一基站
                        {
                            isChangeStation = false;

                            // 更新“信号”：
                            asset.Signal = newTag.Signal;
                            asset.ReportTime = newTag.ReportTime;

                            if (newStation != null && newStation.IsMobile && TagEntity.IsMoved(lastRecord, newTag)) // 若为“移动基站”且“移动”
                            {
                                // 新增记录:
                                var res = await Add(newRecord, false);
                                if (res.IsError)
                                {
                                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                                    LogHelper.Instance.Error(res.Message);
                                    return res.Convert<object>();
                                }
                            }
                        }
                        else // 不同基站
                        {
                            if (TagEntity.IsExpired(asset, oldStation) && TagEntity.IsStrongerDifferent(asset, newTag)) // 是否“过期”且为“信号更强”的“不同基站”
                            {
                                isChangeStation = true;

                                // 新增记录:
                                var res = await Add(newRecord, false);
                                if (res.IsError)
                                {
                                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                                    LogHelper.Instance.Error(res.Message);
                                    return res.Convert<object>();
                                }
                            }
                            else
                            {
                                isChangeStation = false;
                            }
                        }
                    }
                }

                #region 是否在围栏内
                var thresholdTime = DateTimeHelper.GetUtcNow().AddSeconds(-GlobalSettings.TagReportIntervalSeconds);

                // 若未绑定“基站”，且存在“基站定位”，则认为“在围栏内”
                if (string.IsNullOrEmpty(newTag.StationId)
                    && (newTag.LocationMode == LocationModes.BaseStation || await _db.AssetRecords.AsNoTracking()
                    .AnyAsync(i => i.Asset == asset.Id && i.LocationMode == LocationModes.BaseStation && i.ReportTime >= thresholdTime)))
                {
                    asset.IsInFence = true;
                }
                else if (newTag.Longitude != null && newTag.Latitude != null)
                {
                    var fences = await _db.Sites.AsNoTracking()
                        .Where(i => i.Company == newTag.Company && i.FencePath != null)
                        .Select(i => i.FencePoints).ToListAsync();
                    bool isInFence = false;
                    foreach (var fence in fences)
                    {
                        if (fence == null) continue;
                        isInFence = MathHelper.IsInFence(new Point2(newTag.Longitude.Value, newTag.Latitude.Value), fence);
                        if (isInFence) break;
                    }
                    asset.IsInFence = isInFence;
                }
                #endregion

                #region 更新“资产状态”
                asset.OnlineState = newTag.OnlineState;
                asset.IsFall = newTag.IsFall;
                asset.TagType = newTag.Type;
                asset.LastRecord = newRecord.Id;
                asset.State = newRecord.State;
                if (isChangeStation)
                {
                    // 更新“基站”：
                    asset.Station = newTag.Station;
                    asset.StationId = newStation?.MacAddr;
                    // 更新“信号”：
                    asset.Signal = newTag.Signal;
                    asset.ReportTime = newTag.ReportTime;
                }
                #endregion

                await Calculate(newTag.Id, false);
                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
                return MyResults<object>.OperationSuccess;
            }
            catch (Exception ex)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<object>.Error(LogHelper.Instance.Error(ex.GetMessage()));
            }
            finally
            {
                _editingTags.Remove(newTag.Id); // 结束修改
            }
        }
        #endregion

        #region 计算
        /// <summary>计算</summary>
        public async Task<ApiResult<object>> Calculate(long id, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 检验“资源”是否存在:
                var asset = await _db.Assets.FirstOrDefaultAsync(i => i.Id == id);
                if (asset == null)
                {
                    return MyResults<object>.ResourceNotExist;
                }

                var lastRecord = await _db.AssetRecords.Where(r => r.Asset == id).OrderByDescending(r => r.ReportTime).FirstOrDefaultAsync();
                asset.LastRecord = lastRecord?.Id;

                // 计算“周转”:
                var now = DateTimeHelper.GetUtcNow();
                var monthlyStartDate = new DateTime(now.Year, now.Month, 1);
                asset.DailyMove = await _db.AssetRecords.Where(r => r.Asset == id && r.ReportTime >= now.Date && (r.State == AssetStates.Inbound || r.State == AssetStates.Outbound)).CountAsync(); // 当日0点
                asset.MonthlyMove = await _db.AssetRecords.Where(r => r.Asset == id && r.ReportTime >= monthlyStartDate && (r.State == AssetStates.Inbound || r.State == AssetStates.Outbound)).CountAsync(); // 当月1日0点
                asset.TotalMove = await _db.AssetRecords.Where(r => r.Asset == id && (r.State == AssetStates.Inbound || r.State == AssetStates.Outbound)).CountAsync();

                if (lastRecord == null)
                {
                    // 计算“时长”:
                    asset.StayDuration = 0;
                    asset.TravelDuration = 0;
                    asset.OfflineDuration = 0;
                }
                else
                {
                    // 是否滞留:
                    if (asset.Transfer != null && lastRecord.State == AssetStates.InStore)
                    {
                        var lastInbound = await _db.AssetRecords.Where(r => r.Asset == id && r.State == AssetStates.Inbound).OrderByDescending(r => r.ReportTime).FirstOrDefaultAsync();
                        if (lastInbound == null)
                        {
                            LogHelper.Instance.Warning("Inbound record not found for asset in store!");
                        }
                        else if ((now - lastInbound.ReportTime).TotalHours > GlobalSettings.StolidThresholdHours)
                        {
                            var stolid = new AssetRecordEntity();
                            stolid.ShallowCopy(lastRecord);
                            stolid.UpdateId();
                            stolid.ReportTime = now;
                            asset.State = stolid.State = AssetStates.Stolid;
                            await _db.AssetRecords.AddAsync(stolid);
                        }
                    }

                    // 是否超时:
                    if (asset.Transfer != null && lastRecord.State == AssetStates.InTransit)
                    {
                        var lastOutbound = await _db.AssetRecords.Where(r => r.Asset == id && r.State == AssetStates.Outbound).OrderByDescending(r => r.ReportTime).FirstOrDefaultAsync();
                        if (lastOutbound == null)
                        {
                            LogHelper.Instance.Warning("Outbound record not found for asset in transit!");
                        }
                        else if ((now - lastOutbound.ReportTime).TotalHours > GlobalSettings.TimeoutThresholdHours)
                        {
                            var timeout = new AssetRecordEntity();
                            timeout.ShallowCopy(lastRecord);
                            timeout.UpdateId();
                            timeout.ReportTime = now;
                            asset.State = timeout.State = AssetStates.Timeout;
                            await _db.AssetRecords.AddAsync(timeout);
                        }
                    }

                    // “停留”时长:
                    if (lastRecord.State != AssetStates.InStore && lastRecord.State != AssetStates.Stolid)
                    {
                        asset.StayDuration = 0;
                    }
                    else
                    {
                        var lastInbound = await _db.AssetRecords.Where(r => r.Asset == id && r.State == AssetStates.Inbound).OrderByDescending(r => r.ReportTime).FirstOrDefaultAsync();
                        if (lastInbound == null)
                        {
                            asset.StayDuration = 0;
                            LogHelper.Instance.Warning("Inbound record not found for asset in store!");
                        }
                        else
                        {
                            asset.StayDuration = (now - lastInbound.ReportTime).TotalHours;
                        }
                    }

                    // “在途”时长:
                    if (lastRecord.State != AssetStates.InTransit)
                    {
                        asset.TravelDuration = 0;
                    }
                    else
                    {
                        var lastOutbound = await _db.AssetRecords.Where(r => r.Asset == id && r.State == AssetStates.Outbound).OrderByDescending(r => r.ReportTime).FirstOrDefaultAsync();
                        if (lastOutbound == null)
                        {
                            asset.TravelDuration = 0;
                            LogHelper.Instance.Warning("Outbound record not found for asset in transit!");
                        }
                        else
                        {
                            asset.TravelDuration = (now - lastOutbound.ReportTime).TotalHours;
                        }
                    }

                    // “离线”时长:
                    if (lastRecord.OnlineState != OnlineStates.Offline)
                    {
                        asset.OfflineDuration = 0;
                    }
                    else
                    {
                        var lastOnline = await _db.AssetRecords.Where(r => r.Asset == id && r.OnlineState == OnlineStates.Online).OrderByDescending(r => r.ReportTime).FirstOrDefaultAsync();
                        if (lastOnline != null)
                        {
                            asset.OfflineDuration = (now - lastOnline.ReportTime).TotalHours;
                        }
                        else
                        {
                            var firstOffline = await _db.AssetRecords.Where(r => r.Asset == id && r.OnlineState == OnlineStates.Offline).OrderBy(r => r.ReportTime).FirstOrDefaultAsync();
                            if (firstOffline == null)
                            {
                                asset.OfflineDuration = 0;
                                LogHelper.Instance.Warning("Offline record not found for asset!");
                            }
                            else
                            {
                                asset.OfflineDuration = (now - firstOffline.ReportTime).TotalHours;
                            }
                        }
                    }
                }

                // 计算时间:
                asset.CalculationTime = now;

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return MyResults<object>.OperationSuccess;
        }
        #endregion

        #region 清理“过期记录”
        public async Task<ApiResult<int>> ClearExpiredRecord()
        {
            try
            {
                var expirationThreshold = DateTimeHelper.GetUtcNow().AddDays(-GlobalSettings.AssetRecordKeepDays);

                var deletedCount = await _dbSet
                    .Where(r => r.ReportTime < expirationThreshold)
                    .ExecuteDeleteAsync();

                return MyResults<int>.Success(null, deletedCount);
            }
            catch (Exception e)
            {
                return MyResults<int>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [Other]
        #endregion 【Functions】
    }
}
