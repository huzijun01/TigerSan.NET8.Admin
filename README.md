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

#### FilterDto:

ParentFilter? Parent

List\<PropFilter>? Filters

#### PropFilter:

PropName

IsNull

IsNullOrEmpty

IsFuzzy

Value

Values

#### ParentFilter:

Id

Ids

ParentFilter? Parent

#### DbSetConfig:

##### **Props**:

DbSetConfig? Parent

EntityType

DbSetName

ParentIdPropName

##### **Functions**:

SetParent

### MyFileInfo:

### PasswordEdit:

### UserInfo:

### IdValue:

## **Entities**:

### Base:

#### IdEntityBase:

##### **Functions**:

UpdateId

#### IdName:

An Entity used for the global dictionary.

#### IdNameCompany:

An Entity used for the company dictionary.

### Admin:

AdminEntity, AuthorityEntity, CompanyEntity, DepartmentEntity, PersonEntity, PersonFullEntity, RoleAuthorityEntity, RoleEntity

## **Extensions**:

### IdEntityBaseExtendion:

#### Functions:

UpdateId

### IQueryableExtendion:

#### Functions:

False

GetPage

Sort

GetFilter

GetOnlyFilter

GetFilters

GetParentFilter

GetParentIds

## **Filters**:

### ApiAuthorizeFilter:

A IAsyncActionFilter used for verifying authorization.

### CompanyFilter:

A IAsyncActionFilter used to automatically set the company filter for the Service.

### LogFilterAttribute:

A IAsyncActionFilter used for printing request logs to the console.

## **Helpers**:

### CompanyHelper:

#### Functions:

GetSubCompanies

Companies2TreeNodes

### FilterHelper:

#### Functions:

GetParentFilter

SetParentFilter

SetIdPropFilter

SetCompanyParentFilter

### TokenGenerator:

#### Fields:

\_secretKey

#### Functions:

GetToken

GetTokenInfo

GetSecretKey

### TokenHelper:

#### Functions:

InitToken

GetTokenInfo

## **Interfaces**:

### Base:

#### IIdNameCompanyServiceBase:

#### IIdNameServiceBase:

#### IIdServiceBase:

#### IDbSetConfig:

### Admin:

IAdminService, IAuthorityService, ICompanyService, IDepartmentService, IPersonService, IRoleService, IUserService

### File:

IFileService

## **Services**:

### Admin:

#### Delegates:

DbIdDelegate, DbIdsDelegate

#### IdNameCompanyServiceBase:

#### IdNameRepeatableServiceBase:

#### IdNameServiceBase:

#### IdServiceBase:

### Admin:

AdminService, AuthorityService, CompanyService, DepartmentService, PersonService, RoleService, UserService

### File:

FileService

## **Others**:

### DbContextBase:

#### Fields:

\_version

\_connectionString

\_dbSetProps

#### Props:

Admins

Authorities

Companies

Departments

Persons

Roles

#### Functions:

GetDbSetName

GetDbSet

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

TokenValidityPeriod

CaptchaValidityPeriod

MaxFileSize

DirFiles

DirImagesName

DirImages

# END