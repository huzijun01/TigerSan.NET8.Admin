namespace TigerSan.NET8.EFCore.Base
{
    public class MyFileInfo
    {
        public bool IsDir { get; set; } = false;
        public string Name { get; set; } = string.Empty;
        public DateTime CreateTime { get; set; }
        public DateTime? EditTime { get; set; }
        public long? Bytes { get; set; }
        public string? Size { get => GetFileSize(Bytes); }

        #region 获取“文件大小”
        private static string? GetFileSize(long? bytes)
        {
            if (bytes == null) return null;
            if (bytes <= 0) return "0 B";

            string[] units = { "B", "KB", "MB", "GB", "TB", "PB", "EB" };

            int unitIndex = (int)Math.Floor(Math.Log(bytes.Value, 1024));
            if (unitIndex >= units.Length)
            {
                unitIndex = units.Length - 1;
            }

            double size = bytes.Value / Math.Pow(1024, unitIndex);

            return unitIndex == 0 ? $"{bytes.Value} B" : $"{size:F2} {units[unitIndex]}";
        }
        #endregion
    }
}
