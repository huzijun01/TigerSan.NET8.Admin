using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    [ApiController]
    [NotIdController]
    [Route("[controller]")]
    public class FileController : ControllerBase
    {
        #region 【Fields】
        private readonly IFileService _service;
        #endregion 【Fields】

        #region 【Ctor】
        public FileController(IFileService service)
        {
            _service = service;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpGet]
        [Route("FileList")]
        /// <summary>获取“文件信息”集合</summary>
        public async Task<ApiResult<MyFileInfo[]>> GetFileList(
            [FromQuery] string? subPath = null,
            [FromQuery] string searchPattern = "*",
            [FromQuery] bool isTopOnly = true)
        {
            return await _service.GetFileList(subPath, searchPattern, isTopOnly);
        }

        [HttpGet]
        [Route("DirList")]
        /// <summary>获取“文件夹信息”集合</summary>
        public async Task<ApiResult<MyFileInfo[]>> GetDirList(
            [FromQuery] string? subPath = null,
            [FromQuery] string searchPattern = "*",
            [FromQuery] bool isTopOnly = true)
        {
            return await _service.GetDirList(subPath, searchPattern, isTopOnly);
        }

        [HttpGet]
        [Route("PathList")]
        /// <summary>获取“路径信息”集合</summary>
        public async Task<ApiResult<MyFileInfo[]>> GetPathList(
            [FromQuery] string? subPath = null,
            [FromQuery] string searchPattern = "*",
            [FromQuery] bool isTopOnly = true)
        {
            return await _service.GetPathList(subPath, searchPattern, isTopOnly);
        }

        /// <summary>下载“文件”</summary>
        [HttpGet("DownloadFile")]
        public async Task<IActionResult> DownloadFile(
            [FromQuery] string name,
            [FromQuery] string? subPath = null)
        {
            var res = await _service.GetFile(name, subPath);
            var file = res.Data;
            if (file == null) return BadRequest(res.Message);
            return file;
        }
        #endregion [查]

        #region [增]
        /// <summary>创建“文件夹”</summary>
        [HttpPost("Dir")]
        public async Task<ApiResult<object>> CreatDir(
            [FromQuery] string name,
            [FromQuery] string? subPath = null)
        {
            return await _service.CreatDir(name, subPath);
        }

        /// <summary>上传“文件”</summary>
        /// <returns>Query参数</returns>
        [HttpPost("Upload")]
        [RequestSizeLimit(GlobalBaseSettings.MaxFileSize * 1024 * 1024)]
        public async Task<ApiResult<string>> UploadFile(
            IFormFile file,
            CancellationToken cancellationToken = default,
            [FromForm] string? name = null,
            [FromForm] string? subPath = null,
            [FromForm] bool isOverwrite = false,
            [FromForm] long? maxSize = null)
        {
            return await _service.UploadFile(file, cancellationToken, name, subPath, isOverwrite, maxSize);
        }
        #endregion [增]

        #region [改]
        /// <summary>重命名</summary>
        [HttpPut("Rename")]
        public async Task<ApiResult<object>> Rename(
            [FromQuery] string oldName,
            [FromQuery] string newName,
            [FromQuery] string? subPath = null)
        {
            return await _service.Rename(oldName, newName, subPath);
        }
        #endregion [改]

        #region [删]
        /// <summary>删除</summary>
        [HttpPost("Delete")]
        public async Task<ApiResult<object>> Delete(
            [FromBody] List<string> names,
            [FromQuery] string? subPath = null,
            [FromQuery] bool recursive = false)
        {
            return await _service.Delete(names, subPath, recursive);
        }
        #endregion [删]
        #endregion 【Functions】
    }
}
