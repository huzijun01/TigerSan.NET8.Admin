using Microsoft.AspNetCore.Mvc;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    #region 接口
    public interface IIdControllerBase
    {
        /// <summary>服务</summary>
        public static readonly string _service = "_service";
        /// <summary>用户信息</summary>
        public UserInfo? UserInfo { get; set; }
        /// <summary>“可访问公司”集合</summary>
        public List<CompanyEntity>? AccessibleCompanies { get; set; }
        /// <summary>“可访问公司ID”集合</summary>
        public List<long>? AccessibleCompanyIds { get; }
    }
    #endregion

    [ApiController]
    [Route("[controller]")]
    public abstract class IdControllerBase<TEntity, TIIdService> : ControllerBase, IIdControllerBase
        where TEntity : IdEntityBase
        where TIIdService : IIdServiceBase<TEntity>
    {
        #region 【Fields】
        public TIIdService _service;
        #endregion 【Fields】

        #region 【Props】
        public UserInfo? UserInfo { get; set; }
        public List<CompanyEntity>? AccessibleCompanies { get; set; }
        public List<long>? AccessibleCompanyIds { get => AccessibleCompanies?.Select(i => i.Id).ToList(); }
        #endregion 【Props】

        #region 【Ctor】
        public IdControllerBase(TIIdService service)
        {
            _service = service;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpGet]
        [Route("{id}")]
        /// <summary>获取“单条数据”</summary>
        public virtual async Task<ApiResult<TEntity>> Get(long id)
        {
            return await _service.Get(id);
        }

        [HttpPost]
        [Route("Count")]
        /// <summary>获取“总数”</summary>
        public virtual async Task<ApiResult<int>> GetCount([FromBody] FilterDto? filter = null)
        {
            return await _service.GetCount(filter);
        }

        [HttpPost]
        [Route("List")]
        /// <summary>获取“数据”集合</summary>
        public virtual async Task<ApiResult<List<TEntity>>> GetList(
            int? pageSize = null,
            int? pageNumber = null,
            string? sort = null,
            bool? ascending = null,
            [FromBody] FilterDto? filter = null)
        {
            return await _service.GetList(pageSize, pageNumber, sort, ascending, filter);
        }
        #endregion [查]

        #region [增]
        [HttpPost]
        /// <summary>添加“单条数据”</summary>
        public virtual async Task<ApiResult<TEntity>> Add([FromBody] TEntity entity)
        {
            return await _service.Add(entity);
        }

        [HttpPost]
        [Route("Range")]
        /// <summary>添加“多条数据”</summary>
        public virtual async Task<ApiResult<object>> AddRange([FromBody] List<TEntity> entities)
        {
            return await _service.AddRange(entities);
        }
        #endregion [增]

        #region [改]
        [HttpPut]
        /// <summary>修改“单条数据”</summary>
        public virtual async Task<ApiResult<object>> Edit([FromBody] TEntity entity)
        {
            return await _service.Edit(entity);
        }

        [HttpPut]
        [Route("Range")]
        /// <summary>修改“多条数据”</summary>
        public virtual async Task<ApiResult<object>> EditRange([FromBody] List<TEntity> entities)
        {
            return await _service.EditRange(entities);
        }
        #endregion [改]

        #region [删]
        [HttpDelete]
        [Route("{id}")]
        /// <summary>删除“单条数据”</summary>
        public virtual async Task<ApiResult<object>> Remove(long id)
        {
            return await _service.Remove(id);
        }

        [HttpDelete]
        [Route("Range")]
        /// <summary>删除“多条数据”</summary>
        public virtual async Task<ApiResult<object>> RemoveRange([FromBody] List<long> ids)
        {
            return await _service.RemoveRange(ids);
        }
        #endregion [删]
        #endregion 【Functions】
    }
}
