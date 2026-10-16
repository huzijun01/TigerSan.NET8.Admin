using Microsoft.EntityFrameworkCore;
using System.Data;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;
using TigerSan.NET8.EFCore.Base;
using TigerSan.NET8.WebApi.Share;
using TigerSan.NET8.WebApi.Share.Dtos;
using TigerSan.NET8.WebApi.Share.Entities;
using TigerSan.NET8.WebApi.Interfaces.Models;

namespace TigerSan.NET8.WebApi.Services.Models
{
    public class BaseStationService : IdNameServiceBase<BaseStationEntity, AppDbContext>, IBaseStationService
    {
        #region 【Fields】
        private readonly IStationRecordService _stationRecordService;
        #endregion 【Fields】

        #region 【Ctor】
        static BaseStationService()
        {
            SetDbSetConfig(nameof(BaseStationEntity.Site))
                .SetParent(typeof(SiteEntity), nameof(_db.Sites), nameof(SiteEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public BaseStationService(
            AppDbContext db,
            IStationRecordService stationRecordService) : base(db, db.BaseStations)
        {
            _stationRecordService = stationRecordService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        #region 根据“MAC地址”获取“单条数据”
        public async Task<ApiResult<BaseStationEntity>> GetByMacAddr(string macAddr)
        {
            try
            {
                var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.MacAddr == macAddr);
                if (entity == null)
                {
                    return MyResults<BaseStationEntity>.ResourceNotExist;
                }
                return MyResults<BaseStationEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                return MyResults<BaseStationEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”
        public async Task<ApiResult<BaseStationDto>> GetFull(
            List<long> companies,
            long? id = null,
            string? macAddr = null)
        {
            if (id == null && macAddr == null) return MyResults<BaseStationDto>.Success();

            var res = await GetFullList1(companies, 1, 1, null, null, id, macAddr);
            if (res.Data == null)
            {
                return MyResults<BaseStationDto>.Error(res.Message);
            }
            return MyResults<BaseStationDto>.Success(null, res.Data.FirstOrDefault());
        }
        #endregion

        #region 获取“完整数据”集合
        public async Task<ApiResult<List<BaseStationDto>>> GetFullList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            try
            {
                var list = new List<BaseStationDto>();

                var resGetList = await GetList(pageSize, pageNumber, sort, ascending, filter);
                var entities = resGetList.Data;
                if (entities == null)
                {
                    return MyResults<List<BaseStationDto>>.Error(resGetList.Message);
                }

                // 获取“类型”字典:
                var typeDict = (await _db.StationTypes.ToListAsync()).ToDictionary(i => i.Id, i => i.Name);

                // 获取“公司”字典:
                var companyDict = (await _db.Companies.ToListAsync()).ToDictionary(i => i.Id, i => i.Name);

                foreach (var entity in entities)
                {
                    var dto = new BaseStationDto();
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

                    // 添加“地址”:
                    var siteEntity = await _db.Sites.AsNoTracking().FirstOrDefaultAsync(i => i.Id == entity.Site);
                    if (siteEntity == null)
                    {
                        LogHelper.Instance.IsNull(nameof(siteEntity));
                    }
                    else
                    {
                        dto.Company = siteEntity.Company;
                        dto.SiteName = siteEntity.Name;
                        dto.Addr = siteEntity.Addr;
                        dto.AddrDetail = siteEntity.AddrDetail;

                        // 添加“公司名”:
                        var companyName = companyDict.GetValueOrDefault(siteEntity.Company);
                        if (companyName == null)
                        {
                            LogHelper.Instance.IsNull(nameof(companyName));
                        }
                        else
                        {
                            dto.CompanyName = companyName;
                        }

                        // 补“经纬度”:
                        if (!entity.IsMobile && !entity.IsValidLngLat)
                        {
                            dto.Longitude = siteEntity.Longitude;
                            dto.Latitude = siteEntity.Latitude;
                            await Edit(dto, false);
                        }
                    }

                    list.Add(dto);
                }

                return MyResults<List<BaseStationDto>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<BaseStationDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“完整数据”集合（id、macAddr）
        public async Task<ApiResult<List<BaseStationDto>>> GetFullList1(
            List<long> companies,
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            long? id = null,
            string? macAddr = null)
        {
            var filters = new List<PropFilter>();
            if (id != null)
            {
                filters.Add(new PropFilter(nameof(BaseStationEntity.Id), id));
            }
            else if (macAddr != null)
            {
                filters.Add(new PropFilter(nameof(BaseStationEntity.MacAddr), macAddr));
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

        #region 获取“所属公司”集合
        public async Task<ApiResult<List<IdName>>> GetBelongCompanyList(List<CompanyEntity>? accessibleCompanies)
        {
            try
            {
                var sites = await _dbSet
                    .AsNoTracking()
                    .Select(i => i.Site)
                    .Distinct()
                    .ToListAsync();

                if (sites.Count < 1) return DbResults.EmptyIdNameList;

                var companys = await _db.Sites
                    .AsNoTracking()
                    .Where(d => sites.Contains(d.Id))
                    .Select(d => d.Company)
                    .Distinct()
                    .ToListAsync();

                if (companys.Count < 1) return DbResults.EmptyIdNameList;

                if (accessibleCompanies == null)
                {
                    return MyResults<List<IdName>>.IsNull(nameof(accessibleCompanies));
                }

                companys = companys.Where(i => accessibleCompanies.Any(a => a.Id == i)).ToList();

                var list = await _db.Companies
                    .AsNoTracking()
                    .Where(i => companys.Contains(i.Id))
                    .Select(i => new IdName(i.Id, i.Name))
                    .ToListAsync();

                return MyResults<List<IdName>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“所属场地”集合
        public async Task<ApiResult<List<IdName>>> GetBelongSiteList(long? company = null)
        {
            try
            {
                var sites = await _dbSet
                    .AsNoTracking()
                    .Select(i => i.Site)
                    .Distinct()
                    .ToListAsync();

                if (sites.Count < 1) return DbResults.EmptyIdNameList;

                var queryable = _db.Sites
                    .AsNoTracking()
                    .Where(i => sites.Contains(i.Id));

                if (company != null)
                {
                    queryable = queryable.Where(i => i.Company == company);
                }

                var list = await queryable
                    .Select(i => new IdName(i.Id, i.Name))
                    .ToListAsync();

                return MyResults<List<IdName>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“所属基站类型”集合
        public async Task<ApiResult<List<IdName>>> GetBelongStationTypeList(long? company = null, long? site = null)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();

                // 筛选:
                if (site != null)
                {
                    queryable = queryable.Where(i => i.Site == site);
                }
                else if (company != null)
                {
                    var sites = await _db.Sites.Where(d => d.Company == company).Select(d => d.Id).ToListAsync();
                    queryable = queryable.Where(i => sites.Contains(i.Site));
                }

                var types = await queryable
                    .Distinct()
                    .Select(i => i.Type)
                    .ToListAsync();

                if (types.Count < 1) return DbResults.EmptyIdNameList;

                var list = await _db.StationTypes
                    .Select(i => new IdName(i.Id, i.Name))
                    .ToListAsync();

                return MyResults<List<IdName>>.Success(null, list);
            }
            catch (Exception e)
            {
                return MyResults<List<IdName>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“场地”
        public async Task<ApiResult<SiteEntity>> GetSite(long id)
        {
            try
            {
                var station = await _dbSet.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
                if (station == null)
                {
                    LogHelper.Instance.IsNull(nameof(station));
                    return MyResults<SiteEntity>.Error("Station not found");
                }

                var site = await _db.Sites.AsNoTracking().FirstOrDefaultAsync(s => s.Id == station.Site);
                if (site == null)
                {
                    LogHelper.Instance.IsNull(nameof(site));
                    return MyResults<SiteEntity>.Error("Site not found");
                }

                return MyResults<SiteEntity>.Success(null, site);
            }
            catch (Exception e)
            {
                return MyResults<SiteEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“场地”字典
        public async Task<ApiResult<Dictionary<long, SiteEntity>>> GetSiteDict(List<long> ids)
        {
            var dict = new Dictionary<long, SiteEntity>();
            try
            {
                foreach (var id in ids)
                {
                    var station = await _dbSet.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
                    if (station == null)
                    {
                        LogHelper.Instance.IsNull(nameof(station));
                        continue;
                    }

                    var site = await _db.Sites.AsNoTracking().FirstOrDefaultAsync(s => s.Id == station.Site);
                    if (site == null)
                    {
                        LogHelper.Instance.IsNull(nameof(site));
                        continue;
                    }

                    dict.Add(id, site);
                }

                return MyResults<Dictionary<long, SiteEntity>>.Success(null, dict);
            }
            catch (Exception e)
            {
                return MyResults<Dictionary<long, SiteEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“位置”
        public async Task<ApiResult<PositionDto>> GetPosition(long station)
        {
            try
            {
                var find = await _dbSet.AsNoTracking().FirstOrDefaultAsync(i => i.Id == station);
                if (find == null)
                {
                    return MyResults<PositionDto>.StationNotFound(station.ToString());
                }

                if (find.IsMobile)
                {
                    var lastRecord = await _db.StationRecords.AsNoTracking()
                        .OrderByDescending(i => i.ReportTime)
                        .FirstOrDefaultAsync(i => i.Station == station && i.Longitude != null && i.Latitude != null && i.Longitude != 0 && i.Latitude != 0);
                    if (lastRecord == null) return MyResults<PositionDto>.Success();

                    return MyResults<PositionDto>.Success(null, new PositionDto()
                    {
                        Id = find.Id,
                        Info = find.MacAddr,
                        ReportTime = lastRecord.ReportTime,
                        LocationMode = lastRecord.LocationMode,
                        Longitude = lastRecord.Longitude,
                        Latitude = lastRecord.Latitude,
                    });
                }
                else
                {
                    return MyResults<PositionDto>.Success(null, new PositionDto()
                    {
                        Id = find.Id,
                        Info = find.MacAddr,
                        ReportTime = null,
                        LocationMode = LocationModes.BaseStation,
                        Longitude = find.Longitude,
                        Latitude = find.Latitude,
                    });
                }
            }
            catch (Exception e)
            {
                return MyResults<PositionDto>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“位置”集合
        public async Task<ApiResult<List<PositionDto>>> GetPositionList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            FilterDto? filter = null)
        {
            try
            {
                var queryable = _dbSet.AsNoTracking();

                var res = await GetFilter(queryable, filter);
                queryable = res.Data;
                if (queryable == null)
                {
                    return MyResults<List<PositionDto>>.Error(res.Message);
                }

                var resSort = queryable.Sort(sort, ascending);
                queryable = resSort.Data;
                if (queryable == null)
                {
                    return MyResults<List<PositionDto>>.Error(resSort.Message);
                }

                var stations = await queryable
                    .GetPage(pageSize, pageNumber)
                    .Select(i => i.Id)
                    .ToListAsync();

                var positions = new List<PositionDto>();

                foreach (var station in stations)
                {
                    var resPosition = await GetPosition(station);
                    var position = resPosition.Data;
                    if (position == null) continue;
                    positions.Add(position);
                }

                return MyResults<List<PositionDto>>.Success(null, positions);
            }
            catch (Exception e)
            {
                return MyResults<List<PositionDto>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 添加“单条数据”
        /// <summary>添加“单条数据”</summary>
        public override async Task<ApiResult<BaseStationEntity>> Add(BaseStationEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 检验“MacAddr”是否有效:
                if (!Verify.IsValidMacAddr(entity.MacAddr))
                {
                    return MyResults<BaseStationEntity>.InvalidMacAddr;
                }

                // 检验“MacAddr”是否重复:
                if (await _dbSet.AnyAsync(i => i.MacAddr == entity.MacAddr))
                {
                    return MyResults<BaseStationEntity>.MacAddrRepeated;
                }

                // 检验“经纬度”是否有效:
                if (!entity.IsMobile && !entity.IsValidLngLat)
                {
                    return MyResults<BaseStationEntity>.InvalidLocation;
                }

                entity.UpdateId();
                entity.ReportTime = null;
                entity.CreateTime = DateTimeHelper.GetBeijingNow();
                await _dbSet.AddAsync(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return MyResults<BaseStationEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<BaseStationEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 添加“多条数据”
        /// <summary>添加“多条数据”</summary>
        public override async Task<ApiResult<object>> AddRange(List<BaseStationEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // 检验“MacAddr”是否有效:
                if (entities.Any(i => !Verify.IsValidMacAddr(i.MacAddr)))
                {
                    return MyResults<object>.InvalidMacAddr;
                }

                // 检验“MacAddr”是否重复:
                var macAddrs = entities.Select(i => i.MacAddr).ToList();
                if (await _dbSet.AnyAsync(i => macAddrs.Contains(i.MacAddr)))
                {
                    return MyResults<object>.MacAddrRepeated;
                }

                // 检验“经纬度”是否有效:
                if (entities.Any(i => !i.IsMobile && !i.IsValidLngLat))
                {
                    return MyResults<object>.InvalidLocation;
                }

                entities.UpdateId(i =>
                {
                    i.ReportTime = null;
                    i.CreateTime = DateTimeHelper.GetBeijingNow();
                });
                await _dbSet.AddRangeAsync(entities);

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
        public override async Task<ApiResult<object>> Edit(BaseStationEntity entity, bool isBeginTransaction = true)
        {
            try
            {
                // 检验“MacAddr”是否有效:
                if (!Verify.IsValidMacAddr(entity.MacAddr))
                {
                    return MyResults<object>.InvalidMacAddr;
                }

                // 检验“MacAddr”是否重复:
                if (await _dbSet.AnyAsync(i => i.MacAddr == entity.MacAddr && i.Id != entity.Id))
                {
                    return MyResults<object>.MacAddrRepeated;
                }

                // 检验“经纬度”是否有效:
                if (!entity.IsMobile && !entity.IsValidLngLat)
                {
                    return MyResults<object>.InvalidLocation;
                }

                return await base.Edit(entity, isBeginTransaction);
            }
            catch (Exception e)
            {
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 修改“多条数据”
        /// <summary>修改“多条数据”</summary>
        public override async Task<ApiResult<object>> EditRange(List<BaseStationEntity> entities, bool isBeginTransaction = true)
        {
            try
            {
                // 检验“MacAddr”是否有效:
                if (entities.Any(i => !Verify.IsValidMacAddr(i.MacAddr)))
                {
                    return MyResults<object>.InvalidMacAddr;
                }

                // 检验“MacAddr”是否重复:
                var macAddrs = entities.Select(i => i.MacAddr).ToList();
                foreach (var macAddr in macAddrs)
                {
                    if (await _dbSet.AnyAsync(i => i.MacAddr == macAddr && !entities.Any(e => e.Id == i.Id)))
                    {
                        return MyResults<object>.MacAddrRepeated;
                    }
                }

                // 检验“经纬度”是否有效:
                if (entities.Any(i => !i.IsMobile && !i.IsValidLngLat))
                {
                    return MyResults<object>.InvalidLocation;
                }

                return await base.EditRange(entities, isBeginTransaction);
            }
            catch (Exception e)
            {
                return MyResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
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

                // 删除“图片”：
                if (!string.IsNullOrEmpty(entity.Image))
                {
                    var imagePath = Path.Combine(GlobalBaseSettings.DirImages, entity.Image);
                    if (File.Exists(imagePath))
                    {
                        File.Delete(imagePath);
                    }
                }

                // 删除“绑定记录”：
                await _db.StationBindings.Where(i => i.Station == id).ExecuteDeleteAsync();

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

                // 删除“图片”：
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

                // 删除“绑定记录”：
                await _db.StationBindings.Where(i => ids.Contains(i.Station)).ExecuteDeleteAsync();

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

                var timeOuts = await _dbSet
                    .Where(bs => bs.OnlineState == OnlineStates.Online && bs.ReportTime != null
                    && bs.ReportTime.Value.AddSeconds(bs.HeartbeatInterval) < now)
                    .ToListAsync();

                foreach (var timeOut in timeOuts)
                {
                    timeOut.OnlineState = OnlineStates.Offline;
                    await _stationRecordService.Add(new StationRecordEntity().Copy(timeOut, null));
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
