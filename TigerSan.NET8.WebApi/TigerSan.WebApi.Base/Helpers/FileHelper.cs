using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using MiniExcelLibs;
using TigerSan.CsvLog;
using TigerSan.CsvOperation;

namespace TigerSan.WebApi.Base
{
    public static class FileHelper
    {
        #region 获取“CSV”
        /// <summary>获取“CSV”</summary>
        public static async Task<ApiResult<FileStreamResult>> GetCsv<T>(IList<T> list, string? name = null) where T : class, new()
        {
            try
            {
                // 1. 序列化数据为 CSV 字符串
                var csvHelper = new CsvHelper<T>("");
                csvHelper.InitDefaultHeaders();
                csvHelper.Serialization(list);
                var str = csvHelper.GetSourceString();

                if (string.IsNullOrEmpty(str))
                    return ApiResults<FileStreamResult>.Error(LogHelper.Instance.Error("CSV serialization failed or data is empty!"));

                // 2. 确定文件名
                var outputName = string.IsNullOrEmpty(name) ? $"Export_{DateTimeHelper.GetBeijingNow():yyyyMMddHHmmss}.csv" : name;

                // 确保文件名以 .csv 结尾
                if (!outputName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase)) outputName += ".csv";

                // 3. 将字符串转换为带 BOM 的 UTF-8 字节流
                var utf8WithBom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true);
                byte[] fileBytes = utf8WithBom.GetBytes(str);

                // 创建 MemoryStream
                var stream = new MemoryStream(fileBytes);

                // 4. 返回 FileStreamResult
                var fileResult = new FileStreamResult(stream, "text/csv")
                {
                    FileDownloadName = outputName
                };

                return ApiResults<FileStreamResult>.Success(null, fileResult);
            }
            catch (Exception e)
            {
                return ApiResults<FileStreamResult>.Error(LogHelper.Instance.Error(e.Message));
            }
        }
        #endregion

        #region 获取“XLSX”
        /// <summary>获取“XLSX”</summary>
        public static async Task<ApiResult<FileStreamResult>> GetXlsx<T>(IList<T> list, string? name = null) where T : class, new()
        {
            try
            {
                // 1. 确定文件名
                var outputName = string.IsNullOrEmpty(name) ? $"Export_{DateTimeHelper.GetBeijingNow():yyyyMMddHHmmss}.xlsx" : name;

                // 确保文件名以 .xlsx 结尾
                if (!outputName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase)) outputName += ".xlsx";

                // 2. 使用 MiniExcel 将数据写入 MemoryStream
                var stream = new MemoryStream();
                await stream.SaveAsAsync(list);

                // 重置流位置到开头，否则 FileStreamResult 会从末尾读取导致文件为空
                stream.Position = 0;

                // 3. 返回 FileStreamResult
                var fileResult = new FileStreamResult(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                {
                    FileDownloadName = outputName
                };

                return ApiResults<FileStreamResult>.Success(null, fileResult);
            }
            catch (Exception e)
            {
                return ApiResults<FileStreamResult>.Error(LogHelper.Instance.Error(e.Message));
            }
        }
        #endregion
    }
}