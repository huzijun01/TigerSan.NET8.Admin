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
    public class TransferService : IdServiceBase<TransferEntity, AppDbContext>, ITransferService
    {
        #region 【Fields】
        private readonly IAssetRecordService _assetRecordService;
        #endregion 【Fields】

        #region 【Ctor】
        static TransferService()
        {
            SetDbSetConfig(nameof(TransferEntity.Asset))
                .SetParent(typeof(AssetEntity), nameof(_db.Assets), nameof(AssetEntity.Department))
                .SetParent(typeof(DepartmentEntity), nameof(_db.Departments), nameof(DepartmentEntity.Company))
                .SetParent(typeof(CompanyEntity), nameof(_db.Companies));
        }

        public TransferService(AppDbContext db, IAssetRecordService assetRecordService) : base(db, db.Transfers)
        {
            _assetRecordService = assetRecordService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [增]
        #region 添加“单条数据”
        public new async Task<ApiResult<TransferEntity>> Add(TransferEntity entity, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                // “编码”不能为空：
                if (string.IsNullOrEmpty(entity.Code)) return MyResults<TransferEntity>.CodeCannotBeEmpty(entity.AssetId);

                // 设置“资产ID”：
                var asset = await _db.Assets.FirstOrDefaultAsync(i => i.AssetId == entity.AssetId);
                if (asset == null) return MyResults<TransferEntity>.AssetNotFound(entity.AssetId);
                entity.Asset = asset.Id;

                // 设置“起点”：
                var resGetLast = await _assetRecordService.GetLast(asset.Id);
                var lastRecord = resGetLast.Data;
                if (lastRecord == null || lastRecord.Site == null) return MyResults<TransferEntity>.AssetNoSite(entity.AssetId);
                if (lastRecord.Site == entity.Target) return MyResults<TransferEntity>.TargetSameToSite(entity.AssetId);
                entity.Site = lastRecord.Site.Value;

                // 已调拨：
                if (asset.Transfer != null) return MyResults<TransferEntity>.AssetsHaveBeenAllocated(entity.AssetId);
                // 必须绑定标签：
                var tag = asset.Tag == null ? null : await _db.Tags.FirstOrDefaultAsync(i => i.Id == asset.Tag);
                if (tag == null) return MyResults<TransferEntity>.TagNotExist;
                // 必须为蓝牙标签：
                if (tag.EqpType != EqpTypes.Tag) return MyResults<TransferEntity>.IncorrectTagType;

                // 记录“调拨”：
                entity.UpdateId();
                entity.StartTime = DateTimeHelper.GetBeijingNow();
                asset.Transfer = entity.Id;

                // 添加：
                _dbSet.Add(entity);

                await _db.SaveChangesAsync();
                if (transaction != null) await transaction.CommitAsync(); // 显式提交事务

                return MyResults<TransferEntity>.Success(null, entity);
            }
            catch (Exception e)
            {
                if (transaction != null) await transaction.RollbackAsync(); // 回滚所有操作
                return MyResults<TransferEntity>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 添加“多条数据”
        public new async Task<ApiResult<object>> AddRange(List<TransferEntity> entities, bool isBeginTransaction = true)
        {
            using var transaction = isBeginTransaction ? _db.Database.BeginTransaction() : null; // 显式开启事务

            try
            {
                var now = DateTimeHelper.GetBeijingNow();

                foreach (var entity in entities)
                {
                    // “编码”不能为空：
                    if (string.IsNullOrEmpty(entity.Code)) return MyResults<object>.CodeCannotBeEmpty(entity.AssetId);

                    // 设置“资产ID”：
                    var asset = await _db.Assets.FirstOrDefaultAsync(i => i.AssetId == entity.AssetId);
                    if (asset == null) return MyResults<object>.AssetNotFound(entity.AssetId);
                    entity.Asset = asset.Id;

                    // 设置“起点”：
                    var resGetLast = await _assetRecordService.GetLast(asset.Id);
                    var lastRecord = resGetLast.Data;
                    if (lastRecord == null || lastRecord.Site == null) return MyResults<object>.AssetNoSite(entity.AssetId);
                    if (lastRecord.Site == entity.Target) return MyResults<object>.TargetSameToSite(entity.AssetId);
                    entity.Site = lastRecord.Site.Value;

                    // 已调拨：
                    if (asset.Transfer != null) return MyResults<object>.AssetsHaveBeenAllocated(entity.AssetId);
                    // 必须绑定标签：
                    var tag = asset.Tag == null ? null : await _db.Tags.FirstOrDefaultAsync(i => i.Id == asset.Tag);
                    if (tag == null) return MyResults<object>.TagNotExist;
                    // 必须为蓝牙标签：
                    if (tag.EqpType != EqpTypes.Tag) return MyResults<object>.IncorrectTagType;

                    entity.UpdateId();
                    entity.StartTime = now;
                    asset.Transfer = entity.Id;
                }

                // 添加：
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
        public new async Task<ApiResult<object>> Edit(TransferEntity entity, bool isBeginTransaction = true)
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

                // 设置“资产ID”：
                var asset = await _db.Assets.FirstOrDefaultAsync(i => i.AssetId == entity.AssetId);
                if (asset == null) return MyResults<object>.AssetNotFound(entity.AssetId);
                entity.Asset = asset.Id;

                // 不可修改“资产”，且不可修改“已结束的调拨”：
                if (entity.Asset != find.Asset || entity.AssetId != find.AssetId
                    || find.EndTime != null || entity.EndTime != null
                    || entity.Code != find.Code)
                    return MyResults<object>.CannotModify(entity.Code);

                if (entity.Site == entity.Target) return MyResults<object>.TargetSameToSite(entity.AssetId);

                // 修改“数据”:
                find.ShallowCopy(entity);

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
        public new async Task<ApiResult<object>> EditRange(List<TransferEntity> entities, bool isBeginTransaction = true)
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

                    // 不可修改“资产”，且不可修改“已结束的调拨”：
                    if (entity.Asset != find.Asset || entity.AssetId != find.AssetId
                        || find.EndTime != null || entity.EndTime != null
                        || entity.Code != find.Code)
                        return MyResults<object>.CannotModify(entity.Code);

                    if (entity.Site == entity.Target) return MyResults<object>.TargetSameToSite(entity.AssetId);

                    find.ShallowCopy(entity);
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

                // 取消“调拨”：
                var asset = await _db.Assets.FirstOrDefaultAsync(i => i.Transfer == entity.Id);
                if (asset != null)
                {
                    asset.Transfer = null;
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

                var entities = await _dbSet.Where(i => ids.Contains(i.Id)).ToListAsync();

                var count = entities.Count;
                if (count < 1)
                    return MyResults<object>.ResourceNotExist;
                else if (count < ids.Count)
                    return MyResults<object>.SomeResourceNotExist;

                foreach (var entity in entities)
                {
                    // 取消“调拨”：
                    var asset = await _db.Assets.FirstOrDefaultAsync(i => i.Transfer == entity.Id);
                    if (asset != null)
                    {
                        asset.Transfer = null;
                    }
                }

                await _dbSet.Where(i => ids.Contains(i.Id)).ExecuteDeleteAsync();
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
        #endregion 【Functions】
    }
}
