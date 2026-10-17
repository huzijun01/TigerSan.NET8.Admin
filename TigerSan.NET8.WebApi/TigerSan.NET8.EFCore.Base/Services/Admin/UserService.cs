using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;
using TigerSan.CaptchaGenerator;

namespace TigerSan.NET8.EFCore.Base
{
    public class UserService<TDbContext> : IUserService where TDbContext : DbContextBase<TDbContext>
    {
        #region 【Fields】
        public TDbContext _db;
        private readonly IPersonService _personService;
        private readonly IAdminService _adminService;
        #endregion 【Fields】

        #region 【Ctor】
        public UserService(TDbContext db, IAdminService adminService, IPersonService personService)
        {
            _db = db;
            _adminService = adminService;
            _personService = personService;
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [private]
        #region 获取“用户信息”（普通人员）
        /// <summary>获取“用户信息”（普通人员）</summary>
        private async Task<UserInfo> GetUserInfoAsync(PersonFullEntity person)
        {
            var userInfo = new UserInfo();
            userInfo.ShallowCopy(person);

            try
            {
                var company = await _db.Companies.FirstOrDefaultAsync(c => c.Id == person.Company);
                if (company == null)
                {
                    LogHelper.Instance.Error($"The company with id {person.Company} is not found");
                }
                else
                {
                    userInfo.CompanyIdName = new IdName { Id = company.Id, Name = company.Name };
                }

                var department = await _db.Departments.FirstOrDefaultAsync(d => d.Id == person.Department);
                if (department == null)
                {
                    LogHelper.Instance.Error($"The department with id {person.Department} is not found");
                }
                else
                {
                    userInfo.DepartmentIdName = new IdName { Id = department.Id, Name = department.Name };
                }

                var role = await _db.Roles.FirstOrDefaultAsync(r => r.Id == person.Role);
                if (role == null)
                {
                    LogHelper.Instance.Error($"The role with id {person.Role} is not found");
                }
                else
                {
                    userInfo.RoleIdName = new IdName { Id = role.Id, Name = role.Name };
                    userInfo.Authorities = await _db.Authorities.Where(a => a.Role == role.Id).ToListAsync();
                }
            }
            catch (Exception e)
            {
                LogHelper.Instance.Error(e.GetMessage());
            }

            return userInfo;
        }
        #endregion

        #region 获取“用户信息”（管理员）
        /// <summary>获取“用户信息”（管理员）</summary>
        private async Task<UserInfo> GetUserInfoAsync(AdminEntity admin)
        {
            var userInfo = new UserInfo
            {
                Id = admin.Id,
                Username = admin.Name,
                Nickname = "Admin",
                IsAdmin = true,
                IsRoot = true,
            };
            userInfo.RoleIdName.Name = "Admin";

            return userInfo;
        }
        #endregion
        #endregion [private]

        #region [查]
        #region 获取“用户信息”
        public async Task<ApiResult<UserInfo>> GetUserInfo(string search)
        {
            var res = ApiResults<UserInfo>.OperationSuccess;

            try
            {
                var resPerson = await _personService.GetLoginFull(search, false);
                if (resPerson.IsSuccess)
                {
                    var person = resPerson.Data;
                    if (person == null)
                    {
                        return ApiResults<UserInfo>.Error("The person is null");
                    }

                    res.Data = await GetUserInfoAsync(person);
                    return res;
                }

                var resAdmin = await _adminService.GetByName(search, false);
                if (!resAdmin.IsSuccess)
                {
                    return ApiResults<UserInfo>.UserNotExist;
                }
                else
                {
                    var admin = resAdmin.Data;
                    if (admin == null)
                    {
                        return ApiResults<UserInfo>.Error("The admin is null");
                    }

                    res.Data = await GetUserInfoAsync(admin);
                    return res;
                }
            }
            catch (Exception e)
            {
                return ApiResults<UserInfo>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [查]

        #region [改]
        #region 修改“密码”
        public async Task<ApiResult<object>> EditPassword(PasswordEdit edit)
        {
            try
            {
                var admin = await _db.Admins.FirstOrDefaultAsync(i => i.Id == edit.Id);
                var person = admin == null ? await _db.Persons.FirstOrDefaultAsync(i => i.Id == edit.Id) : null;

                if (admin != null)
                {
                    var hasher = new PasswordHasher<AdminEntity>();
                    if (hasher.VerifyHashedPassword(admin, admin.PasswordHash, edit.OldPassword)
                        == PasswordVerificationResult.Failed)
                    {
                        return ApiResults<object>.PasswordIncorrect;
                    }

                    admin.PasswordHash = hasher.HashPassword(admin, edit.Password);
                }
                else if (person != null)
                {
                    var hasher = new PasswordHasher<PersonEntity>();
                    if (hasher.VerifyHashedPassword(person, person.PasswordHash, edit.OldPassword)
                        == PasswordVerificationResult.Failed)
                    {
                        return ApiResults<object>.PasswordIncorrect;
                    }

                    person.PasswordHash = hasher.HashPassword(person, edit.Password);
                }
                else
                {
                    return ApiResults<object>.UserNotExist;
                }

                await _db.SaveChangesAsync();
            }
            catch (Exception e)
            {
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return ApiResults<object>.OperationSuccess;
        }
        #endregion
        #endregion [改]

        #region [登录]
        #region 登录
        public async Task<ApiResult<UserInfo>> Login(
            string id,
            string captcha,
            string search,
            string password)
        {
            var res = ApiResults<UserInfo>.OperationSuccess;

            try
            {
                var resVerifyCaptcha = VerifyCaptcha(id, captcha);
                if (!resVerifyCaptcha.IsSuccess) return resVerifyCaptcha.Convert<UserInfo>();

                var resPerson = await _personService.GetLoginFull(search, false);
                if (resPerson.IsSuccess)
                {
                    var person = resPerson.Data;
                    if (person == null)
                    {
                        return ApiResults<UserInfo>.Error("The person is null");
                    }
                    else if (new PasswordHasher<PersonEntity>().VerifyHashedPassword(person, person.PasswordHash, password)
                        == PasswordVerificationResult.Failed)
                    {
                        return ApiResults<UserInfo>.PasswordIncorrect;
                    }

                    res.Data = await GetUserInfoAsync(person);
                    TokenHelper.InitToken(res.Data);
                    return res;
                }

                var resAdmin = await _adminService.GetByName(search, false);
                if (!resAdmin.IsSuccess)
                {
                    return ApiResults<UserInfo>.UserNotExist;
                }
                else
                {
                    var admin = resAdmin.Data;
                    if (admin == null)
                    {
                        return ApiResults<UserInfo>.Error("The admin is null");
                    }
                    else if (new PasswordHasher<AdminEntity>().VerifyHashedPassword(admin, admin.PasswordHash, password)
                        == PasswordVerificationResult.Failed)
                    {
                        return ApiResults<UserInfo>.PasswordIncorrect;
                    }

                    res.Data = await GetUserInfoAsync(admin);
                    TokenHelper.InitToken(res.Data);
                    return res;
                }
            }
            catch (Exception e)
            {
                return ApiResults<UserInfo>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
            finally
            {
                MemoryCacheHelper.Remove(id);
            }
        }
        #endregion

        #region Token登录
        public async Task<ApiResult<UserInfo>> LoginByToken(string token)
        {
            try
            {
                var res = TokenHelper.GetTokenInfo(token);
                var tokenInfo = res.Data;
                if (tokenInfo == null)
                    return ApiResults<UserInfo>.InvalidToken(res.Message);

                var resGetUserInfo = await GetUserInfo(tokenInfo.Username);
                var userInfo = resGetUserInfo.Data;
                if (userInfo == null)
                    return ApiResults<UserInfo>.UserNotExist;
                userInfo.Token = token;

                return ApiResults<UserInfo>.Success(null, userInfo);
            }
            catch (Exception e)
            {
                return ApiResults<UserInfo>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 登出
        public async Task<ApiResult<object>> Logout(string username)
        {
            try
            {
                MemoryCacheHelper.Remove(username);
                return ApiResults<object>.OperationSuccess;
            }
            catch (Exception e)
            {
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [登录]

        #region [验证码]
        #region 获取“验证码”
        public ApiResult<CaptchaData> GetCaptcha()
        {
            try
            {
                var captcha = new CaptchaData();
                var code = CaptchaHelper.GenerateCode();
                captcha.Captcha = CaptchaHelper.GenerateImageBytes(code);
                if (captcha.Captcha == null) return ApiResults<CaptchaData>.CaptchaGenerationFailed;
                CaptchaCache.InitCaptcha(captcha.Id, code);
                return ApiResults<CaptchaData>.Success(null, captcha);
            }
            catch (Exception e)
            {
                return ApiResults<CaptchaData>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 验证“验证码”
        public ApiResult<object> VerifyCaptcha(string id, string code)
        {
            try
            {
                return CaptchaCache.Verify(id, code);
            }
            catch (Exception e)
            {
                return ApiResults<object>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion
        #endregion [验证码]
        #endregion 【Functions】
    }
}
