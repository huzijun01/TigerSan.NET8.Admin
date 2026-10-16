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
    public class TagService : IdServiceBase<TagEntity, AppDbContext>, ITagService
    {
        #region 【Fields】
        private readonly IFileService _fileService;
        private readonly IBatchService _batchService;
        private readonly IAssetRecordService _assetRecordService;
        private readonly IBaseStationService _baseStationService;
        private readonly IBindingRecordService _bindingRecordService;
        private readonly IStationBindingService _stationBindingService;
        #endregion 【Fields】

        #region 【Ctor】
        static TagService()
        {
            SetDbSetConfig(nameof(TagEntity.Batch))
                .SetParent(typeof(BatchEntity), nameof(_db.Batches), nameof(BatchEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public TagService(
            AppDbContext db,
            IFileService fileService,
            IBatchService batchService,
            IAssetRecordService assetRecordService,
            IBaseStationService baseStationService,
            IBindingRecordService bindingRecordService,
            IStationBindingService stationBindingService) : base(db, db.Tags)
        {
            _fileService = fileService;
            _batchService = batchService;
            _assetRecordService = assetRecordService;
            _baseStationService = baseStationService;
            _bindingRecordService = bindingRecordService;
            _stationBindingService = stationBindingService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [private]
        #region 获取“完整数据”集合
        /// <summary>获取“完整数据”集合</summary>
        private async Task<ApiResult<List<TagDto>>> GetFullList(List<TagEntity> entities)
        {
            var list = new List<TagDto>();

            // 获取“批次ID”列表:
            var batchIds = entities.Select(i => i.Batch).Distinct().ToList();

            // 获取“基站ID”列表:
            var stationIds = entities.Where(i => i.Station != null).Select(i => i.Station ?? 0).Distinct().ToList();

            // 获取“类型”字典:
            var typeDict = (await _db.TagTypes.ToListAsync()).ToDictionary(i => i.Id, i => i.Name);

            // 获取“批次”字典:
            var batchDict = (await _db.Batches.Where(i => batchIds.Contains(i.Id)).ToListAsync()).ToDictionary(i => i.Id, i => i.BatchId);

            // 获取“基站”字典:
            var stationDict = (await _db.BaseStations.Where(i => stationIds.Contains(i.Id)).ToListAsync()).ToDictionary(i => i.Id, i => i.Name);

            // 获取“公司”字典:
            var resGetCompanyDict = await _batchService.GetCompanyDict(batchIds);
            if (resGetCompanyDict.Data == null)
            {
                return MyResults<List<TagDto>>.Error(resGetCompanyDict.Message);
            }
            var companyDict = resGetCompanyDict.Data;

            // 获取“场地”字典:
            var resGetSiteDict = await _baseStationService.GetSiteDict(stationIds);
            if (resGetSiteDict.Data == null)
            {
                return MyResults<List<TagDto>>.Error(resGetSiteDict.Message);
            }
            var siteDict = resGetSiteDict.Data;

            // 添加“数据”:
            foreach (var entity in entities)
            {
                var dto = new TagDto();
                dto.ShallowCopy(entity);

                // 添加“类型名”：
                var typeName = typeDict.GetValueOrDefault(entity.Type);
                if (typeName == null)
                {
                    LogHelper.Instance.IsNull(nameof(typeName));
                }
                else
                {
                    dto.TypeName = typeName;
                }

                // 添加“批次ID”：
                var batchId = batchDict.GetValueOrDefault(entity.Batch);
                if (batchId == null)
                {
                    LogHelper.Instance.IsNull(nameof(batchId));
                }
                else
                {
                    dto.BatchId = batchId;
                }

                // 检查“图片”是否存在：
                if (!string.IsNullOrEmpty(entity.Image))
                {
                    var imagePath = Path.Combine(GlobalBaseSettings.DirImages, entity.Image);
                    if (!File.Exists(imagePath))
                    {
                        var find = await _dbSet.FirstOrDefaultAsync(i => i.Id == entity.Id);
                        if (find == null)
                        {
                            LogHelper.Instance.IsNull(nameof(find));
                        }
                        else
                        {
                            dto.Image = find.Image = null;
                            await _db.SaveChangesAsync();
                        }
                    }
                }

                // 添加“公司”:
                companyDict.TryGetValue(entity.Batch, out var company);
                if (company == null)
                {
                    LogHelper.Instance.IsNull(nameof(company));
                }
                else
                {
                    dto.Company = company.Id;
                    dto.CompanyName = company.Name;
                }

                // 添加“场地”:
                if (entity.Station != null)
                {
                    siteDict.TryGetValue(entity.Station.Value, out var site);
                    if (site == null)
                    {
                        LogHelper.Instance.IsNull(nameof(site));
                    }
                    else
                    {
                        dto.Site = site.Id;
                        dto.SiteName = site.Name;
                        dto.Address = site.FullAddr;
                    }
                }

                list.Add(dto);
            }

            return MyResults<List<TagDto>>.Success(null, list);
        }
        #endregion

        #region 修改“标签”
        private async Task<ApiResult<object>> Edit(TagEntity entity)
        {
            try
            {
                // 检验“资源”是否存在:
                var find = await _dbSet.FirstOrDefaultAsync(i => i.Id == entity.Id);
                if (find == null)
                {
                    return MyResults<object>.ResourceNotExist;
                }

                // 检验“资产ID”是否重复:
                if (!string.IsNullOrEmpty(entity.AssetId) && await _dbSet.AnyAsync(i => i.AssetId == entity.AssetId && i.Id != entity.Id))
                {
                    return MyResults<object>.AssetIdRepeated;
                }

                // 检验“RFID”是否重复:
                if (!string.IsNullOrEmpty(entity.Rfid) && await _dbSet.AnyAsync(i => i.Rfid == entity.Rfid && i.Id != entity.Id))
                {
                    return MyResults<object>.RfidRepeated;
                }

                // 解绑资产：
                if (!string.IsNullOrEmpty(find.AssetId) && find.AssetId != entity.AssetId)
                {
                    var asset = await _db.Assets.FirstOrDefaultAsync(i => i.AssetId == find.AssetId);
                    if (asset != null)
                    {
                        asset.Tag = null;
                        asset.TagType = null;
                        asset.BindingTime = null;

                        // 添加“解绑记录”：
                        var resAdd = await _bindingRecordService.Add(new BindingRecordEntity(false, asset.Id, entity.Id), false);
                        if (resAdd.IsError)
                        {
                            return MyResults<object>.Error(resAdd.Message);
                        }
                    }
                }

                // 绑定资产：
                if (!string.IsNullOrEmpty(entity.AssetId))
                {
                    var asset = await _db.Assets.FirstOrDefaultAsync(i => i.AssetId == entity.AssetId);
                    if (asset == null)
                    {
                        return MyResults<object>.AssetNotFound(entity.AssetId);
                    }

                    if (asset.Tag != entity.Id)
                    {
                        // 添加“绑定记录”
                        asset.BindingTime = DateTimeHelper.GetBeijingNow();
                        var resAdd = await _bindingRecordService.Add(new BindingRecordEntity(true, asset.Id, entity.Id, asset.BindingTime), false);
                        if (resAdd.IsError)
                        {
                            return MyResults<object>.Error(resAdd.Message);
                        }
                    }

                    asset.Tag = entity.Id;
                    asset.TagId = entity.TagId;
                    asset.TagType = entity.Type;
                }

                // 绑定基站：
                if (!string.Equals(find.StationId, entity.StationId))
                {
                    // 添加“解绑记录”：
                    if (!string.IsNullOrEmpty(find.StationId))
                    {
                        var station = await _db.BaseStations.AsNoTracking().FirstOrDefaultAsync(i => i.MacAddr == find.StationId);
                        if (station == null)
                        {
                            return MyResults<object>.StationNotFound(find.StationId);
                        }

                        var resAdd = await _stationBindingService.Add(new StationBindingEntity(false, station.Id, find.Id), false);
                        if (resAdd.IsError)
                        {
                            return MyResults<object>.Error(resAdd.Message);
                        }
                    }

                    // 添加“绑定记录”
                    if (!string.IsNullOrEmpty(entity.StationId))
                    {
                        var station = await _db.BaseStations.AsNoTracking().FirstOrDefaultAsync(i => i.MacAddr == entity.StationId);
                        if (station == null)
                        {
                            return MyResults<object>.StationNotFound(entity.StationId);
                        }

                        var resAdd = await _stationBindingService.Add(new StationBindingEntity(true, station.Id, entity.Id), false);
                        if (resAdd.IsError)
                        {
                            return MyResults<object>.Error(resAdd.Message);
                        }
                    }
                }

                // 修改“数据”:
                find.ShallowCopy(entity);
                return MyResults<object>.Success();
            }
            catch (Exception e)
            {
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [private]

        #region [查] 
        #region 根据“RFID”获取“单条数据”
        public async Task<ApiResult<TagEntity>> GetByRFID(string rfid)
        {
            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Rfid == rfid);
                if (entity == null)
                {
                    return MyResults<TagEntity>.ResourceNotExist;
                }
                return MyResults<TagEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                return MyResults<TagEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 根据“TagId”获取“单条数据”
        public async Task<ApiResult<TagEntity>> GetByTagId(string tagId)
        {
            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.TagId == tagId);
                if (entity == null)
                {
                    return MyResults<TagEntity>.Error("Tag not found!");
                }
                return MyResults<TagEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                return MyResults<TagEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 根据“TagId”获取“单条完整数据”
        public async Task<ApiResult<TagDto>> GetFullByTagId(string tagId)
        {
            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.TagId == tagId);
                if (entity == null)
                {
                    return MyResults<TagDto>.Error("Tag not found!");
                }

                var dto = new TagDto();
                dto.ShallowCopy(entity);

                // 添加“类型名”：
                var typeName = await _db.TagTypes.Where(i => i.Id == entity.Type).Select(i => i.Name).FirstOrDefaultAsync();
                if (typeName == null)
                {
                    LogHelper.Instance.IsNull(nameof(typeName));
                    return MyResults<TagDto>.Error("Type not found!");
                }
                else
                {
                    dto.TypeName = typeName;
                }

                // 添加“批次ID”：
                var batchId = await _db.Batches.Where(i => i.Id == entity.Batch).Select(i => i.BatchId).FirstOrDefaultAsync();
                if (batchId == null)
                {
                    LogHelper.Instance.IsNull(nameof(batchId));
                }
                else
                {
                    dto.BatchId = batchId;
                }

                // 添加“公司”：
                var resGetCompany = await _batchService.GetCompany(entity.Batch);
                var company = resGetCompany.Data;
                if (company == null)
                {
                    LogHelper.Instance.IsNull(nameof(company));
                    return MyResults<TagDto>.Error("Company not found!");
                }
                else
                {
                    dto.Company = company.Id;
                    dto.CompanyName = company.Name;
                }

                // 添加“场地”：
                if (entity.Station != null)
                {
                    var resGetSite = await _baseStationService.GetSite(entity.Station.Value);
                    var site = resGetSite.Data;
                    if (site == null)
                    {
                        LogHelper.Instance.IsNull(nameof(site));
                        return MyResults<TagDto>.Error("Site not found!");
                    }
                    else
                    {
                        dto.Site = site.Id;
                        dto.SiteName = site.Name;
                        dto.Address = site.FullAddr;
                    }
                }

                return MyResults<TagDto>.Success(null, dto);
            }
            catch (Exception e)
            {
                return MyResults<TagDto>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”
        public async Task<ApiResult<TagDto>> GetFull(
            List<long> companies,
            string? tagId = null,
            string? rfid = null)
        {
            if (tagId == null && rfid == null) return MyResults<TagDto>.Success();

            var res = await GetFullList1(companies, 1, 1, null, null, tagId, rfid);
            if (res.Data == null)
            {
                return MyResults<TagDto>.Error(res.Message);
            }
            return MyResults<TagDto>.Success(null, res.Data.FirstOrDefault());
        }
        #endregion

        #region 获取“完整数据”集合
        public async Task<ApiResult<List<TagDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            try
            {
                // 获取“数据”集合:
                var resGetList = await GetList(pageSize, pageNumber, sort, ascending, filter);
                var entities = resGetList.Data;
                if (entities == null)
                {
                    return MyResults<List<TagDto>>.Error(resGetList.Message);
                }

                return await GetFullList(entities);
            }
            catch (Exception e)
            {
                return MyResults<List<TagDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”集合（根据“ID列表”）
        public async Task<ApiResult<List<TagDto>>> GetFullList(List<long> ids)
        {
            try
            {
                var list = new List<TagDto>();

                // 获取“数据”集合:
                var resGetList = await GetList(ids);
                if (resGetList.Data == null)
                {
                    return MyResults<List<TagDto>>.Error(resGetList.Message);
                }
                var entities = resGetList.Data;

                return await GetFullList(entities);
            }
            catch (Exception e)
            {
                return MyResults<List<TagDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”集合（tagId、rfid）
        public async Task<ApiResult<List<TagDto>>> GetFullList1(
            List<long> companies,
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            string? tagId = null,
            string? rfid = null)
        {
            var filters = new List<PropFilter>();
            if (tagId != null)
            {
                filters.Add(new PropFilter(nameof(TagEntity.TagId), tagId));
            }
            else if (rfid != null)
            {
                filters.Add(new PropFilter(nameof(TagEntity.Rfid), rfid));
            }

            return await GetFullList(pageSize, pageNumber, sort, ascending, new FilterDto()
            {
                Parent = new ParentFilter()
                {
                    Parent = new ParentFilter()
                    {
                        Ids = companies,
                    }
                },
                Filters = filters,
            });
        }
        #endregion

        #region 获取“完整数据”集合（根据“基站ID”）
        public async Task<ApiResult<List<TagDto>>> GetFullListByStationId(string stationId)
        {
            try
            {
                return await GetFullList(null, null, null, null, new FilterDto()
                {
                    Filters = new List<PropFilter>()
                    {
                        new PropFilter()
                        {
                            PropName = nameof(TagEntity.StationId),
                            Value = stationId,
                        }
                    }
                });
            }
            catch (Exception e)
            {
                return MyResults<List<TagDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        public override async Task<ApiResult<TagEntity>> Add(TagEntity entity, bool isBeginTransaction = true)
        {
            // 检验“MacAddr”是否有效:
            if (!Verify.IsValidMacAddr(entity.TagId))
            {
                return MyResults<TagEntity>.InvalidMacAddr;
            }

            // 检验“标签ID”是否重复:
            if (await _dbSet.AnyAsync(i => i.TagId == entity.TagId))
            {
                return MyResults<TagEntity>.TagIdRepeated;
            }

            // 检验“RFID”是否重复:
            if (!string.IsNullOrEmpty(entity.Rfid) && await _dbSet.AnyAsync(i => i.Rfid == entity.Rfid))
            {
                return MyResults<TagEntity>.RfidRepeated;
            }

            // 清空“资产”：
            entity.Asset = null;
            entity.AssetId = null;
            entity.StationId = null;

            return await base.Add(entity, isBeginTransaction);
        }
        #endregion

        #region 添加“多条数据”
        public override async Task<ApiResult<object>> AddRange(List<TagEntity> entities, bool isBeginTransaction = true)
        {
            // 检验“MacAddr”是否有效:
            if (entities.Any(i => !Verify.IsValidMacAddr(i.TagId)))
            {
                return MyResults<object>.InvalidMacAddr;
            }

            // 检验“标签ID”是否重复:
            var tagIds = entities.Select(e => e.TagId).ToList();
            if (await _dbSet.AnyAsync(i => tagIds.Contains(i.TagId)))
            {
                return MyResults<object>.TagIdRepeated;
            }

            // 检验“RFID”是否重复:
            var rfids = entities.Where(e => !string.IsNullOrEmpty(e.Rfid)).Select(e => e.Rfid).ToList();
            if (await _dbSet.AnyAsync(i => rfids.Contains(i.Rfid)))
            {
                return MyResults<object>.RfidRepeated;
            }

            // 清空“资产”：
            foreach (var entity in entities)
            {
                entity.Asset = null;
                entity.AssetId = null;
                entity.StationId = null;
            }

            return await base.AddRange(entities, isBeginTransaction);
        }
        #endregion

        #region 批量添加
        public async Task<ApiResult<object>> AddBatch(TagEntity entity, bool isBeginTransaction = true)
        {
            var entities = new List<TagEntity>();
            var tagIds = entity.TagId.ToLines();
            foreach (string tagId in tagIds)
            {
                var newTag = new TagEntity().ShallowCopy(entity);
                newTag.TagId = tagId;
                entities.Add(newTag);
            }
            return await AddRange(entities, isBeginTransaction);
        }
        #endregion
        #endregion [增]

        #region [改]
        #region 修改“单条数据”
        /// <summary>修改“单条数据”</summary>
        public override async Task<ApiResult<object>> Edit(TagEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 检验“MacAddr”是否有效:
                if (!Verify.IsValidMacAddr(entity.TagId))
                {
                    return MyResults<object>.InvalidMacAddr;
                }

                // 检验“基站ID”是否有效:
                if (!string.IsNullOrEmpty(entity.StationId))
                {
                    if (entity.EqpType != EqpTypes.Tag)
                    {
                        return MyResults<object>.IsNotTag(entity.TagId);
                    }

                    var station = await _db.BaseStations.FirstOrDefaultAsync(i => i.MacAddr == entity.StationId);
                    if (station == null)
                    {
                        return MyResults<object>.StationNotFound(entity.StationId);
                    }
                    else if (!station.IsMobile)
                    {
                        return MyResults<object>.StationNotMobile(entity.StationId);
                    }
                }

                var res = await Edit(entity);
                if (res.IsError)
                {
                    if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                    return MyResults<object>.Error(res.Message);
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

        #region 修改“多条数据”
        /// <summary>修改“多条数据”</summary>
        public override async Task<ApiResult<object>> EditRange(List<TagEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                if (entities.Count < 1) return MyResults<object>.OperationSuccess;

                foreach (var entity in entities)
                {
                    // 检验“MacAddr”是否有效:
                    if (!Verify.IsValidMacAddr(entity.TagId))
                    {
                        return MyResults<object>.InvalidMacAddr;
                    }

                    // 检验“基站ID”是否有效:
                    if (!string.IsNullOrEmpty(entity.StationId))
                    {
                        if (entity.EqpType != EqpTypes.Tag)
                        {
                            return MyResults<object>.IsNotTag(entity.TagId);
                        }

                        var station = await _db.BaseStations.FirstOrDefaultAsync(i => i.MacAddr == entity.StationId);
                        if (station == null)
                        {
                            return MyResults<object>.StationNotFound(entity.StationId);
                        }
                        else if (!station.IsMobile)
                        {
                            return MyResults<object>.StationNotMobile(entity.StationId);
                        }
                    }
                }

                foreach (var entity in entities)
                {
                    // 检验“资产ID”是否重复:
                    if (!string.IsNullOrEmpty(entity.AssetId) && entities.Any(i => i.AssetId == entity.AssetId && i.Id != entity.Id))
                    {
                        return MyResults<object>.AssetIdRepeated;
                    }

                    var res = await Edit(entity);
                    if (res.IsError)
                    {
                        if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                        return MyResults<object>.Error(res.Message);
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

        #region [删]
        #region 删除“单条数据”
        public new async Task<ApiResult<object>> Remove(long id, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
                if (entity == null)
                {
                    return MyResults<object>.ResourceNotExist;
                }

                if (!string.IsNullOrEmpty(entity.Image))
                {
                    var imagePath = Path.Combine(GlobalBaseSettings.DirImages, entity.Image);
                    if (File.Exists(imagePath))
                    {
                        File.Delete(imagePath);
                    }
                }

                _dbSet.Remove(entity);
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

        #region 删除“多条数据”
        public new async Task<ApiResult<object>> RemoveRange(List<long> ids, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                if (ids.Count < 1) return MyResults<object>.OperationSuccess;

                var finds = _dbSet.Where(i => ids.Contains(i.Id));

                var count = await finds.CountAsync();
                if (count < 1) return MyResults<object>.ResourceNotExist;
                else if (count < ids.Count) return MyResults<object>.SomeResourceNotExist;

                var entities = await finds.ToListAsync();
                foreach (var entity in entities)
                {
                    if (!string.IsNullOrEmpty(entity.Image))
                    {
                        var imagePath = Path.Combine(GlobalBaseSettings.DirImages, entity.Image);
                        if (File.Exists(imagePath))
                        {
                            File.Delete(imagePath);
                        }
                    }
                }

                await finds.ExecuteDeleteAsync();
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
        #endregion [删]

        #region [Others]
        #region 更新“在线状态”
        public async Task<ApiResult<object>> UpdateOnlineState()
        {
            try
            {
                var now = DateTimeHelper.GetBeijingNow();

                var tagTimeOuts = await _dbSet
                    .Where(i => i.OnlineState == OnlineStates.Online && i.ReportTime != null
                    && i.EqpType == EqpTypes.Tag
                    && i.ReportTime.Value.AddSeconds(GlobalSettings.TagReportIntervalSeconds) < now)
                    .ToListAsync();

                var locatorTimeOuts = await _dbSet
                    .Where(i => i.OnlineState == OnlineStates.Online && i.ReportTime != null
                    && i.EqpType == EqpTypes.Locator
                    && i.ReportTime.Value.AddSeconds(GlobalSettings.LocatorReportIntervalSeconds) < now)
                    .ToListAsync();

                var tagDtos = (await GetFullList(tagTimeOuts)).Data;
                var locatorDtos = (await GetFullList(locatorTimeOuts)).Data;

                foreach (var timeOut in tagTimeOuts)
                {
                    timeOut.OnlineState = OnlineStates.Offline;

                    var tagDto = tagDtos?.FirstOrDefault(i => i.Id == timeOut.Id);
                    if (tagDto != null)
                    {
                        var newTagDto = new TagDto().ShallowCopy(tagDto);
                        newTagDto.OnlineState = OnlineStates.Offline;
                        await _assetRecordService.EditAssetRecordAsync(tagDto, newTagDto, false);
                    }
                }

                foreach (var locatorTimeOut in locatorTimeOuts)
                {
                    locatorTimeOut.OnlineState = OnlineStates.Offline;

                    var locatorDto = locatorDtos?.FirstOrDefault(i => i.Id == locatorTimeOut.Id);
                    if (locatorDto != null)
                    {
                        var newLocatorDto = new TagDto().ShallowCopy(locatorDto);
                        newLocatorDto.OnlineState = OnlineStates.Offline;
                        await _assetRecordService.EditAssetRecordAsync(locatorDto, newLocatorDto, false);
                    }
                }

                await _db.SaveChangesAsync();
                return MyResults<object>.Success();
            }
            catch (Exception e)
            {
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [Others]
        #endregion 【Functions】
    }
}
