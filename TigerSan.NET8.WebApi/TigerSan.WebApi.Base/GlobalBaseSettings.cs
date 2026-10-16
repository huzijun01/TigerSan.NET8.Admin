using System;
using System.IO;

namespace TigerSan.WebApi.Base
{
    public static class GlobalBaseSettings
    {
        /// <summary>“Token”有效期</summary>
        public static TimeSpan TokenValidityPeriod = TimeSpan.FromDays(7);
        /// <summary>“验证码”有效期</summary>
        public static TimeSpan CaptchaValidityPeriod = TimeSpan.FromMinutes(3);
        // 文件：
        /// <summary>最大“文件”大小（MB）</summary>
        public const long MaxFileSize = 200;
        /// <summary>最大“图片”大小（MB）</summary>
        public const long MaxImageSize = 2;
        /// <summary>“文件”文件夹</summary>
        public static readonly string DirFiles = Path.Combine(AppContext.BaseDirectory, "Files");
        /// <summary>“图片”文件夹名称</summary>
        public static readonly string DirImagesName = "Images";
        /// <summary>“图片”文件夹</summary>
        public static readonly string DirImages = Path.Combine(DirFiles, DirImagesName);
    }
}
