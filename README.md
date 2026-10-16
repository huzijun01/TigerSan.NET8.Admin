# Description:

A full-stack admin system built with Vue3 and .NET 8 WebApi, featuring 4-level permission control, data isolation, and file management.

![preview1](https://github.com/huzijun01/TigerSan.NET8.Admin/blob/main/preview1.webp?raw=true)

![preview2](https://github.com/huzijun01/TigerSan.NET8.Admin/blob/main/preview2.webp?raw=true)

# About:

### Personal Homepage:

bilibili: https://space.bilibili.com/34323512

# TigerSan.NET8.EFCore.Base:

## **Attributes**:

### ApiAttributes:

#### NotIdControllerAttribute:

The marked Controller will not add the company filter.

#### NeedAuthorizeAttribute:

Unmarked Controllers and Actions will default to authorization verification.

Marked Controllers and Actions, even if they contain the NoNeedAuthorizeAttribute attribute, will still undergo authorization verification.

#### NoNeedAuthorizeAttribute:

The marked Controller and Action do not perform authorization verification and do not add company filters.

#### FilterByCompanyAttribute:

The marked Controller will add the company filter.

### SnakeColumnAttribute:

A ColumnAttribute that can convert prop name into snake-case formatted string as column name.

## **Controllers**:

### Admin:

#### AdminController:

#### AuthorityController:

#### CompanyController:

#### DepartmentController:

#### PersonController:

#### RoleController:

#### UserController:

##### **Fields**:

\_service

##### **Functions**:

EditPassword

Login

LoginByToken

Logout

GetCaptcha

### Base:

#### IdControllerBase:

##### **Fields**:

\_service

##### **Props**:

UserInfo

AccessibleCompanies

AccessibleCompanyIds

##### **Functions**:

Get

GetCount

GetList

Add

AddRange

Edit

EditRange

Remove

RemoveRange

#### IdNameControllerBase:

SelectIdName

#### IdNameRepeatableControllerBase:

SelectIdName

### File:

#### FileController:

##### **Fields**:

\_service

##### **Functions**:

GetFileList

GetDirList

GetPathList

DownloadFile

CreatDir

UploadFile

Delete

#### ImageController:

##### **Fields**:

\_fileService

##### **Functions**:

GetList

Get

Upload

Delete

## **Dtos**:

### DepartmentInfo:

### FilterDto:

### MyFileInfo:

### PasswordEdit:

### UserInfo:

## **Entities**:

### Base:

#### IdEntityBase:

#### IdName:

#### IdNameCompany:

### Others:

#### AdminEntity:

#### AuthorityEntity:

#### CompanyEntity:

#### DepartmentEntity:

#### PersonEntity:

#### PersonFullEntity:

#### RoleAuthorityEntity:

#### RoleEntity:

## **Extensions**:

### IdEntityBaseExtendion:

#### UpdateId:

### IQueryableExtendion:

#### False:

#### GetPage:

#### Sort:

#### GetFilter:

#### GetOnlyFilter:

#### GetFilters:

#### GetParentFilter:

#### GetParentIds:

## **Filters**:

### ApiAuthorizeFilter:

### CompanyFilter:

### LogFilterAttribute:

## **Filters**:

### ApiAuthorizeFilter:

### CompanyFilter:

### LogFilterAttribute:

## **Interfaces**:

### Base:

#### IIdNameCompanyServiceBase:

#### IIdNameServiceBase:

#### IIdServiceBase:

#### IDbSetConfig:

### Others:

IAdminService, IAuthorityService, ICompanyService, IDepartmentService, IFileService, IPersonService, IRoleService, IUserService

## **Interfaces**:

### Services:

#### Delegates:

DbIdDelegate, DbIdsDelegate

#### IdNameCompanyServiceBase:

#### IdNameRepeatableServiceBase:

#### IdNameServiceBase:

#### IdServiceBase:

### Others:

AdminService, AuthorityService, CompanyService, DepartmentService, FileService, PersonService, RoleService, UserService

## **Others**:

### DbContextBase:

#### Fields:

\_version:

\_connectionString:

\_dbSetProps:

#### Props:

Admins:

Authorities:

Companies:

Departments:

Persons:

Roles:

#### Functions:

GetDbSetName:

GetDbSet:

### DbResults:

# TigerSan.WebApi.Base:

## **Extensions**:

### ActionContextExtension:

### ExceptionExtension:

### ObjectExtention:

### StringExtension:

## **Helpers**:

### CaptchaCache:

### ChannelBase:

### ConnectInfo:

### DailyTask:

### DateTimeHelper:

### FileHelper:

### HttpHelper:

### MapHelper:

### MathHelper:

### MemoryCacheHelper:

### ObjectHelper:

### SseHelper:

### TreeHelper:

### Uuid7Generator:

### Verify:

### WatchDog:

## **Others**:

### ApiResult:

#### ApiResultCode:

#### ApiResult:

#### ApiResults:

### GlobalBaseSettings:

TokenValidityPeriod:

CaptchaValidityPeriod:

MaxFileSize:

DirFiles:

DirImagesName:

DirImages:

# END