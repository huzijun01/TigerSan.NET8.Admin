
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    public class FileService : IFileService
    {
        #region 【Ctor】
        public FileService()
        {
            try
            {
                if (!Directory.Exists(GlobalBaseSettings.DirFiles))
                {
                    Directory.CreateDirectory(GlobalBaseSettings.DirFiles);
                }

                if (!Directory.Exists(GlobalBaseSettings.DirImages))
                {
                    Directory.CreateDirectory(GlobalBaseSettings.DirImages);
                }
            }
            catch (Exception ex)
            {
                LogHelper.Instance.Error(ex.GetMessage());
            }
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [private]
        #region 校验路径是否合法
        /// <summary>校验路径是否合法</summary>
        private bool IsValidPath(string? subPath)
        {
            return string.IsNullOrEmpty(subPath) || !subPath.Contains("..");
        }
        #endregion

        #region 获取“文件类型”
        public static string GetFileType(string fileName)
        {
            var provider = new FileExtensionContentTypeProvider();

            if (!provider.TryGetContentType(fileName, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            return contentType;
        }
        #endregion
        #endregion [private]

        #region [查]
        #region 获取“文件信息”集合
        public async Task<ApiResult<MyFileInfo[]>> GetFileList(
            string? subPath = null,
            string searchPattern = "*",
            bool isTopOnly = true)
        {
            try
            {
                if (!IsValidPath(subPath)) return ApiResults<MyFileInfo[]>.InvalidPath(subPath);

                var path = string.IsNullOrEmpty(subPath) ? GlobalBaseSettings.DirFiles : Path.Combine(GlobalBaseSettings.DirFiles, subPath);
                if (!Directory.Exists(path)) return ApiResults<MyFileInfo[]>.PathDoesNotExist(path);

                var absoluteFiles = Directory.GetFiles(path, searchPattern, isTopOnly ? SearchOption.TopDirectoryOnly : SearchOption.AllDirectories);

                var fileInfos = absoluteFiles.Select(filePath =>
                {
                    var fileInfo = new FileInfo(filePath);
                    return new MyFileInfo
                    {
                        IsDir = false,
                        Name = Path.GetRelativePath(path, fileInfo.FullName),
                        CreateTime = fileInfo.CreationTime,
                        EditTime = fileInfo.LastWriteTime,
                        Bytes = fileInfo.Length
                    };
                }).ToArray();

                return ApiResults<MyFileInfo[]>.Success(null, fileInfos);
            }
            catch (Exception e)
            {
                return ApiResults<MyFileInfo[]>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“文件夹信息”集合
        public async Task<ApiResult<MyFileInfo[]>> GetDirList(
            string? subPath = null,
            string searchPattern = "*",
            bool isTopOnly = true)
        {
            try
            {
                if (!IsValidPath(subPath)) return ApiResults<MyFileInfo[]>.InvalidPath(subPath);

                var path = string.IsNullOrEmpty(subPath) ? GlobalBaseSettings.DirFiles : Path.Combine(GlobalBaseSettings.DirFiles, subPath);
                if (!Directory.Exists(path)) return ApiResults<MyFileInfo[]>.PathDoesNotExist(path);

                var absoluteDirs = Directory.GetDirectories(path, searchPattern, isTopOnly ? SearchOption.TopDirectoryOnly : SearchOption.AllDirectories);

                var dirInfos = absoluteDirs.Select(dirPath =>
                {
                    var dirInfo = new DirectoryInfo(dirPath);
                    return new MyFileInfo
                    {
                        IsDir = true,
                        Name = Path.GetRelativePath(path, dirInfo.FullName),
                        CreateTime = dirInfo.CreationTime
                    };
                }).ToArray();

                return ApiResults<MyFileInfo[]>.Success(null, dirInfos);
            }
            catch (Exception e)
            {
                return ApiResults<MyFileInfo[]>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“路径信息”集合
        public async Task<ApiResult<MyFileInfo[]>> GetPathList(
            string? subPath = null,
            string searchPattern = "*",
            bool isTopOnly = true)
        {
            try
            {
                if (!IsValidPath(subPath)) return ApiResults<MyFileInfo[]>.InvalidPath(subPath);

                var path = string.IsNullOrEmpty(subPath) ? GlobalBaseSettings.DirFiles : Path.Combine(GlobalBaseSettings.DirFiles, subPath);
                if (!Directory.Exists(path)) return ApiResults<MyFileInfo[]>.PathDoesNotExist(path);

                var absoluteDirs = Directory.GetDirectories(path, searchPattern, isTopOnly ? SearchOption.TopDirectoryOnly : SearchOption.AllDirectories);

                var dirInfos = absoluteDirs.Select(dirPath =>
                {
                    var dirInfo = new DirectoryInfo(dirPath);
                    return new MyFileInfo
                    {
                        IsDir = true,
                        Name = Path.GetRelativePath(path, dirInfo.FullName),
                        CreateTime = dirInfo.CreationTime
                    };
                }).ToArray();

                var absoluteFiles = Directory.GetFiles(path, searchPattern, isTopOnly ? SearchOption.TopDirectoryOnly : SearchOption.AllDirectories);

                var fileInfos = absoluteFiles.Select(filePath =>
                {
                    var fileInfo = new FileInfo(filePath);
                    return new MyFileInfo
                    {
                        IsDir = false,
                        Name = Path.GetRelativePath(path, fileInfo.FullName),
                        CreateTime = fileInfo.CreationTime,
                        EditTime = fileInfo.LastWriteTime,
                        Bytes = fileInfo.Length
                    };
                }).ToArray();

                return ApiResults<MyFileInfo[]>.Success(null, dirInfos.Concat(fileInfos).ToArray());
            }
            catch (Exception e)
            {
                return ApiResults<MyFileInfo[]>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“文件”
        public async Task<ApiResult<FileStreamResult>> GetFile(string name, string? subPath = null)
        {
            try
            {
                if (!IsValidPath(subPath)) return ApiResults<FileStreamResult>.InvalidPath(subPath);
                if (string.IsNullOrWhiteSpace(name)) return ApiResults<FileStreamResult>.NameCannotBeEmpty;

                var targetDir = string.IsNullOrEmpty(subPath) ? GlobalBaseSettings.DirFiles : Path.Combine(GlobalBaseSettings.DirFiles, subPath);
                var filePath = Path.Combine(targetDir, name);

                if (!File.Exists(filePath)) return ApiResults<FileStreamResult>.PathDoesNotExist(filePath);

                var contentType = GetFileType(name);

                var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 4096, useAsync: true);

                return ApiResults<FileStreamResult>.Success(null, new FileStreamResult(stream, contentType)
                {
                    FileDownloadName = name
                });
            }
            catch (FileNotFoundException fe)
            {
                return ApiResults<FileStreamResult>.Error(LogHelper.Instance.Error(fe.GetMessage()));
            }
            catch (ArgumentException ae)
            {
                return ApiResults<FileStreamResult>.Error(LogHelper.Instance.Error(ae.GetMessage()));
            }
            catch (Exception e)
            {
                return ApiResults<FileStreamResult>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [增]
        #region 创建“文件夹”
        public async Task<ApiResult<object>> CreatDir(string name, string? subPath = null)
        {
            try
            {
                if (!IsValidPath(subPath)) return ApiResults<object>.InvalidPath(subPath);

                var targetDir = string.IsNullOrEmpty(subPath) ? GlobalBaseSettings.DirFiles : Path.Combine(GlobalBaseSettings.DirFiles, subPath);
                if (!Directory.Exists(targetDir)) return ApiResults<object>.PathDoesNotExist(subPath);
                var dirPath = Path.Combine(targetDir, name);
                if (Directory.Exists(dirPath)) return ApiResults<object>.DirAlreadyExists;

                Directory.CreateDirectory(dirPath);

                return ApiResults<object>.Success();
            }
            catch (Exception e)
            {
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 上传“文件”
        public async Task<ApiResult<string>> UploadFile(
            IFormFile file,
            CancellationToken cancellationToken = default,
            string? name = null,
            string? subPath = null,
            bool isOverwrite = false,
            long? maxSize = null)
        {
            var filePath = string.Empty;
            var fileName = string.IsNullOrEmpty(name) ? file.FileName : name;
            try
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (!IsValidPath(subPath)) return ApiResults<string>.InvalidPath(subPath);
                if (file == null || file.Length == 0) return ApiResults<string>.FileIsNullOrEmpty;

                if (maxSize == null) maxSize = GlobalBaseSettings.MaxFileSize;
                // 1. 验证文件大小
                if (file.Length > maxSize * 1024 * 1024) return ApiResults<string>.FileSizeExceedsLimit(maxSize.Value);

                // 2. 验证文件扩展名
                var ext = Path.GetExtension(fileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(ext)) return ApiResults<string>.UnsupportedFileType;

                // 3. 目标路径
                var targetDir = string.IsNullOrEmpty(subPath) ? GlobalBaseSettings.DirFiles : Path.Combine(GlobalBaseSettings.DirFiles, subPath);
                if (!Directory.Exists(targetDir)) return ApiResults<string>.PathDoesNotExist(subPath);

                // 5. 保存文件
                filePath = Path.Combine(targetDir, fileName);
                if (File.Exists(filePath))
                {
                    if (isOverwrite)
                    {
                        File.Delete(filePath);
                    }
                    else
                    {
                        return ApiResults<string>.FileAlreadyExists;
                    }
                }

                using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 81920, true))
                {
                    await file.CopyToAsync(stream, cancellationToken);
                    await stream.FlushAsync(cancellationToken);
                }

                var param = $"?name={fileName}";
                if (!string.IsNullOrEmpty(subPath)) param += $"&{nameof(subPath)}={subPath}";

                return ApiResults<string>.Success(null, param);
            }
            catch (OperationCanceledException)
            {
                if (!string.IsNullOrEmpty(filePath) && File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                return ApiResults<string>.Warning("Upload cancelled by user.");
            }
            catch (Exception e)
            {
                return ApiResults<string>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [增]

        #region [改]
        #region 重命名
        public async Task<ApiResult<object>> Rename(string oldName, string newName, string? subPath = null)
        {
            try
            {
                if (!IsValidPath(subPath)) return ApiResults<object>.InvalidPath(subPath);
                if (string.IsNullOrWhiteSpace(oldName)) return ApiResults<object>.NameCannotBeEmpty;
                if (string.IsNullOrWhiteSpace(newName)) return ApiResults<object>.NameCannotBeEmpty;

                var targetDir = string.IsNullOrEmpty(subPath) ? GlobalBaseSettings.DirFiles : Path.Combine(GlobalBaseSettings.DirFiles, subPath);
                var oldPath = Path.Combine(targetDir, oldName);
                var newPath = Path.Combine(targetDir, newName);

                if (File.Exists(oldPath))
                {
                    if (File.Exists(newPath)) return ApiResults<object>.NameRepeated;
                    File.Move(oldPath, newPath);
                }
                else if (Directory.Exists(oldPath))
                {
                    if (Directory.Exists(newPath)) return ApiResults<object>.NameRepeated;
                    Directory.Move(oldPath, newPath);
                }
                else
                {
                    return ApiResults<object>.PathDoesNotExist(oldPath);
                }

                return ApiResults<object>.Success(null, true);
            }
            catch (Exception e)
            {
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [改]

        #region [删]
        public async Task<ApiResult<object>> Delete(List<string> names, string? subPath = null, bool recursive = false)
        {
            try
            {
                foreach (var name in names)
                {
                    if (!IsValidPath(subPath)) return ApiResults<object>.InvalidPath(subPath);
                    if (string.IsNullOrWhiteSpace(name)) return ApiResults<object>.NameCannotBeEmpty;

                    var targetDir = string.IsNullOrEmpty(subPath) ? GlobalBaseSettings.DirFiles : Path.Combine(GlobalBaseSettings.DirFiles, subPath);
                    var path = Path.Combine(targetDir, name);

                    if (File.Exists(path))
                    {
                        File.Delete(path);
                    }
                    else if (Directory.Exists(path))
                    {
                        if (!recursive && Directory.GetFiles(path).Length > 0) return ApiResults<object>.DirIsNotEmpty(name);
                        Directory.Delete(path, recursive);
                    }
                    else
                    {
                        return ApiResults<object>.PathDoesNotExist(path);
                    }
                }
                return ApiResults<object>.Success(null, true);
            }
            catch (Exception e)
            {
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion [删]
        #endregion 【Functions】
    }
}
