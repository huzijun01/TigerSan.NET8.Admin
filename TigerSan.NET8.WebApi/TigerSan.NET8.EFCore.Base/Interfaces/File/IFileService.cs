using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public interface IFileService
    {
        // 查:
        /// <summary>获取“文件信息”集合</summary>
        public Task<ApiResult<MyFileInfo[]>> GetFileList(
            string? dir = null,
            string searchPattern = "*",
            bool isTopOnly = true);
        /// <summary>获取“文件夹信息”集合</summary>
        public Task<ApiResult<MyFileInfo[]>> GetDirList(
            string? dir = null,
            string searchPattern = "*",
            bool isTopOnly = true);
        /// <summary>获取“路径信息”集合</summary>
        public Task<ApiResult<MyFileInfo[]>> GetPathList(
            string? subPath = null,
            string searchPattern = "*",
            bool isTopOnly = true);
        /// <summary>获取“文件”</summary>
        public Task<ApiResult<FileStreamResult>> GetFile(string name, string? subPath = null);

        // 增:
        /// <summary>创建“文件夹”</summary>
        public Task<ApiResult<object>> CreatDir(string name, string? subPath = null);
        /// <summary>上传“文件”</summary>
        /// <returns>Query参数</returns>
        public Task<ApiResult<string>> UploadFile(
            IFormFile file,
            CancellationToken cancellationToken = default,
            string? name = null,
            string? subPath = null,
            bool isOverwrite = false,
            long? maxSize = null);

        // 改:
        public Task<ApiResult<object>> Rename(string oldName, string newName, string? subPath = null);

        // 删:
        /// <summary>删除</summary>
        public Task<ApiResult<object>> Delete(
            List<string> names,
            string? subPath = null,
            bool recursive = false);
    }
}
