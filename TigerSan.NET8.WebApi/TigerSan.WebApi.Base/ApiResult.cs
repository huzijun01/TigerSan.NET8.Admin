using System;
namespace TigerSan.WebApi.Base
{
    #region 结果码
    public enum ApiResultCode
    {
        Success = 0,
        Warning = 1,
        Error = 2,
        InvalidToken = 3,
        InvalidCaptcha = 4,
    }
    #endregion

    #region 结果
    public class ApiResult<TData>
    {
        #region 【Properties】
        #region [引用]
        public bool IsSuccess { get => Code == ApiResultCode.Success; }
        public bool IsWarning { get => Code == ApiResultCode.Warning; }
        public bool IsError { get => Code == ApiResultCode.Error; }
        #endregion [引用]

        /// <summary>结果码</summary>
        public ApiResultCode Code { get; set; } = ApiResultCode.Success;
        /// <summary>信息</summary>
        public string Message { get; set; } = string.Empty;
        /// <summary>数据</summary>
        public TData? Data { get; set; } = default!;
        #endregion 【Properties】

        #region 【Ctor】
        public ApiResult()
        {
        }

        public ApiResult(string message = "", TData? data = default)
        {
            Message = message;
            Data = data;
        }

        public ApiResult(ApiResultCode code = ApiResultCode.Success, string message = "", TData? data = default)
        {
            Code = code;
            Message = message;
            Data = data;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region 转换
        public ApiResult<TData1> Convert<TData1>()
        {
            var res = new ApiResult<TData1>();
            res.ShallowCopy(this);
            return res;
        }
        #endregion
        #endregion 【Functions】
    }
    #endregion

    #region 基础结果
    public class ApiResults<TData>
    {
        // A:
        public static ApiResult<TData> ApiUnavailable { get => Error("This API is unavailable!"); }
        public static ApiResult<TData> AccessibleCompaniesCannotBeNull { get => Error("The AccessibleCompanies cannot be null!"); }
        public static ApiResult<TData> AuthorizationHeaderMissing { get => new ApiResult<TData>(ApiResultCode.InvalidToken, "Authorization header is missing!"); }
        // C:
        public static ApiResult<TData> CompanyNotExist { get => Error("The company do not exist!"); }
        public static ApiResult<TData> CaptchaGenerationFailed { get => Error("Captcha generation failed!"); }
        public static ApiResult<TData> CannotModifyOwnRole { get => Error("User cannot modify their own role!"); }
        public static ApiResult<TData> CaptchaVerificationFailed { get => new ApiResult<TData>(ApiResultCode.InvalidCaptcha, "Captcha verification failed!"); }
        // D:
        public static ApiResult<TData> DirAlreadyExists { get => Error($"The directory already exists!"); }
        public static Func<string?, ApiResult<TData>> DirIsNotEmpty = path => Error($"The directory is not empty!({path})");
        // F:
        public static ApiResult<TData> FileAlreadyExists { get => Error($"The file already exists!"); }
        public static ApiResult<TData> FileIsNullOrEmpty { get => Error($"The file is null or empty!"); }
        // I:
        public static Func<string?, ApiResult<TData>> InvalidPath = path => Error($"The path is invalid!({path})");
        public static ApiResult<TData> IdIsNullOrEmpty { get => new ApiResult<TData>(ApiResultCode.InvalidToken, "The id is null or empty!"); }
        public static ApiResult<TData> InvalidOrExpiredToken { get => new ApiResult<TData>(ApiResultCode.InvalidToken, "Invalid or expired token!"); }
        // L:
        public static ApiResult<TData> LoggedInByAnotherUser { get => new ApiResult<TData>(ApiResultCode.InvalidToken, "Account logged in by others!"); }
        // N:
        public static ApiResult<TData> NameRepeated { get => Error("The name cannot be repeated!"); }
        public static ApiResult<TData> NameCannotBeEmpty { get => Error($"The name cannot be empty!"); }
        // O:
        public static ApiResult<TData> OperationSuccess { get => Success("Operation successful!"); }
        // P:
        public static ApiResult<TData> PasswordIncorrect { get => Error("The password is incorrect!"); }
        public static Func<string?, ApiResult<TData>> PathDoesNotExist = path => Error($"The path does not exist!({path})");
        // R:
        public static ApiResult<TData> ResourceExists { get => Error("The resource already exist!"); }
        public static ApiResult<TData> ResourceNotExist { get => Error("The resource do not exist!"); }
        public static ApiResult<TData> RecordAlreadyExists { get => Warning("Record already exists!"); }
        public static ApiResult<TData> ResourceBeenOccupied { get => Error("The resource have been occupied!"); }
        // S:
        public static ApiResult<TData> SomeResourceNotExist { get => Error("Some resources do not exist!"); }
        public static ApiResult<TData> SomeAuthoritiesUnavailable { get => Warning("Some authorities are unavailable!"); }
        // U:
        public static ApiResult<TData> UserNotExist { get => Error("User does not exist!"); }
        public static ApiResult<TData> UnsupportedFileType { get => Error("Unsupported file type!"); }

        #region 【Functions】
        // Base:
        public static ApiResult<TData> Success(string? msg = null, TData? data = default) { return new ApiResult<TData>(ApiResultCode.Success, msg ?? OperationSuccess.Message, data); }
        public static ApiResult<TData> Warning(string? msg = null, TData? data = default) { return new ApiResult<TData>(ApiResultCode.Warning, msg ?? nameof(Warning), data); }
        public static ApiResult<TData> Error(string msg) { return new ApiResult<TData>(ApiResultCode.Error, msg); }
        public static ApiResult<TData> Error(Exception e) { return Error(e.Message); }
        // Func:
        public static Func<string, ApiResult<TData>> CannotModify = code => Error($"Cannot modify!({code})");
        public static Func<string, ApiResult<TData>> NoCaptchaRecord = id => new ApiResult<TData>(ApiResultCode.InvalidCaptcha, $"No Captcha record!({id})");
        // Other:
        public static ApiResult<TData> IsNull(string name) { return Error($"The {name} is null!"); }
        public static ApiResult<TData> InvalidToken(string msg) { return new ApiResult<TData>(ApiResultCode.InvalidToken, msg); }
        public static ApiResult<TData> ParentCompanyNotExist(long id, long parent) { return Error($"The parent company does not exist! ({id}, {parent})"); }
        public static Func<long, ApiResult<TData>> FileSizeExceedsLimit = size => Error($"File size exceeds the limit! ({size}MB)");
        #endregion 【Functions】
    }
    #endregion
}
