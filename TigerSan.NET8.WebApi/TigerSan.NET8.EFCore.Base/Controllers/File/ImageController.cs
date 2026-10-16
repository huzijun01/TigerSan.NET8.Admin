using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    [ApiController]
    [NotIdController]
    [Route("[controller]")]
    public class ImageController : ControllerBase
    {
        #region 【Fields】
        private readonly IFileService _fileService;
        #endregion 【Fields】

        #region 【Ctor】
        public ImageController(IFileService fileService)
        {
            _fileService = fileService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [查]
        [HttpGet]
        [Route("List")]
        /// <summary>获取“图片”集合</summary>
        public async Task<ApiResult<MyFileInfo[]>> GetList([FromQuery] string searchPattern = "*")
        {
            return await _fileService.GetFileList(GlobalBaseSettings.DirImagesName, searchPattern);
        }

        /// <summary>获取“图片”</summary>
        [HttpGet("{name}")]
        public async Task<IActionResult> Get(string name)
        {
            var res = await _fileService.GetFile(name, GlobalBaseSettings.DirImagesName);
            var file = res.Data;
            if (file == null) return BadRequest(res.Message);
            return file;
        }
        #endregion [查]

        #region [增]
        /// <summary>上传</summary>
        /// <returns>文件名</returns>
        [HttpPost]
        [RequestSizeLimit(GlobalBaseSettings.MaxImageSize * 1024 * 1024)]
        public async Task<ApiResult<string>> Upload(
            IFormFile file,
            [FromForm] long? maxSize = null,
            CancellationToken cancellationToken = default)
        {
            var fileName = file.FileName;
            var index = 0;
            while (System.IO.File.Exists(Path.Combine(GlobalBaseSettings.DirImages, fileName)))
            {
                ++index;
                fileName = $"{Path.GetFileNameWithoutExtension(file.FileName)}_{index}{Path.GetExtension(file.FileName)}";
            }
            var res = await _fileService.UploadFile(file, cancellationToken, fileName, GlobalBaseSettings.DirImagesName, false, maxSize);
            if (!string.IsNullOrEmpty(res.Data)) res.Data = fileName;
            return res;
        }
        #endregion [增]

        #region [删]
        /// <summary>删除</summary>
        [HttpPost("Delete")]
        public async Task<ApiResult<object>> Delete([FromBody] List<string> names)
        {
            return await _fileService.Delete(names, GlobalBaseSettings.DirImagesName);
        }
        #endregion [删]
        #endregion 【Functions】
    }
}
