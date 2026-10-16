# RESTful接口规范

| Name | Action | Method | Param | Return |
| --- | --- | --- | --- | --- |
| 数量 | \[controller\]/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 单条 | \[controller\]/{id} | Get |   | MyActionResult\<TEntity> |
| 集合 | \[controller\]/List | Post | _集合查询参数_ | MyActionResult\<List\<TEntity>> |
| 增单条 | \[controller\] | Post | \[FromBody\] TEntity entity | MyActionResult\<TEntity> |
| 增多条 | \[controller\]/Range | Post | \[FromBody\] List\<TEntity> entities | MyActionResult\<object> |
| 改单条 | \[controller\] | Put | \[FromBody\] TEntity entity | MyActionResult\<object> |
| 改多条 | \[controller\]/Range | Put | \[FromBody\] List\<TEntity> entities | MyActionResult\<object> |
| 删单条 | \[controller\]/{id} | Delete |   | MyActionResult\<object> |
| 删多条 | \[controller\]/Range | Delete | \[FromBody\] List\<TEntity> entities | MyActionResult\<object> |

### 集合查询参数

```cs
[FromQuery] int? pageSize, // 页大小
[FromQuery] int? pageNumber, // 页号
[FromQuery] string? sort, // 排序属性名
[FromQuery] bool? ascending, // 是否正序
[FromBody] FilterDto? filter // 筛选器对象
```

# Model

## MyActionResult - 统一返回结果

```typescript
export enum ActionResultCode {
    Success = 0,
    Warning = 1,
    Error = 2,
    InvalidToken = 3,
    InvalidCaptcha = 4,
}

export class MyActionResult<TData> {
    code: ActionResultCode
    message = ''
    data?: TData
}
```

## FilterDto - 筛选器对象

```typescript
/** “过滤器”对象 */
export class FilterDto {
    /** 父表 */
    parent?: ParentFilter
    /** “过滤器”集合 */
    filters?: PropFilter[]
}

/** “属性”过滤器 */
export class PropFilter {
    /** 属性名 */
    propName = ''
    /** 是否“模糊查询” */
    isFuzzy?: boolean
    /** 值 */
    value?: unknown
    /** 值集合 */
    values?: unknown[] = []
}

/** “父表”过滤器 */
export class ParentFilter {
    /** ID */
    id?: bigint
    /** ID集合 */
    ids?: bigint[] = []
    /** 父表 */
    parent?: ParentFilter
}
```

## IdName - ID名称对

```typescript
/** ID名称对 */
export class IdName {
    id: bigint = 0n
    name = ''
}
```

# API

## 用户

| Name | Action | Method | Param | Return |
| --- | --- | --- | --- | --- |
| 修改密码 | User/Password | Put | PasswordEdit edit | MyActionResult |
| 登录 | User/Login | Get | string id, string captcha, string search, string password | MyActionResult\<UserInfo> |
| Token登录 | User/LoginByToken | Get | string token | MyActionResult\<UserInfo> |
| 登出 | User/Logout | Get | string username | MyActionResult |
| 获取验证码 | User/Captcha | Post |   | MyActionResult\<CaptchaData> |

除了“Login、LoginByToken、Captcha”外，访问其它接口时，均需携带Authorization头，其值为登录时得到的token。

### Model

```typescript

/** "人员"实体 */
export class PersonEntity {
    id: bigint = 0n
    company: bigint = 0n
    department: bigint = 0n
    role: bigint = 0n
    isAdmin = false
    username = ''
    nickname = ''
    password = ''
    avatar?: string
    phone?: string
    mail?: string
}

/** 用户信息 */
export class UserInfo extends PersonEntity {
    isRoot = false
    captcha = ''
    companyIdName = new IdNameModel()
    departmentIdName = new IdNameModel()
    roleIdName = new IdNameModel()
    authorities: AuthorityModel[] = []
    token?: string
}

/** 验证码数据 */
export class CaptchaData {
    id = ''
    captcha = ''
}
```

## 首页

| Name | Action | Method | Param | Return |
| --- | --- | --- | --- | --- |
| 场地数量 | Site/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 基站数量 | BaseStation/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 标签数量 | Tag/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 资产数量 | Asset/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |

## 标签

| Name | Action | Method | Param | Return |
| --- | --- | --- | --- | --- |
| 数量 | Tag/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 单条 | Tag/{id} | Get |   | MyActionResult\<TagEntity> |
| 集合 | Tag/List | Post | 集合查询参数 | MyActionResult\<List\<TagEntity>> |
| 增单条 | Tag | Post | \[FromBody\] TagEntity entity | MyActionResult\<TagEntity> |
| 增多条 | Tag/Range | Post | \[FromBody\] List\<TagEntity> entities | MyActionResult\<object> |
| 改单条 | Tag | Put | \[FromBody\] TagEntity entity | MyActionResult\<object> |
| 改多条 | Tag/Range | Put | \[FromBody\] List\<TagEntity> entities | MyActionResult\<object> |
| 删单条 | Tag/{id} | Delete |   | MyActionResult\<object> |
| 删多条 | Tag/Range | Delete | \[FromBody\] List\<TagEntity> entities | MyActionResult\<object> |
| 完整数据 | Tag/Full | Get | string? tagId, string? rfid | MyActionResult\<TagDto> |
| 完整集合 | Tag/FullList | Post | 集合查询参数 | MyActionResult\<List\<TagDto>> |

### Model

```typescript
/** 设备类型 */
export enum EqpTypes {
    /** 标签 */
    Tag = 0,
    /** 定位器 */
    Locator = 1,
}

/** “标签”实体 */
export class TagEntity {
    /** ID */
    id: bigint = 0n
    /** 批次 */
    batch: bigint = 0n
    /** 类型 */
    type: bigint = 0n
    /** 基站 */
    station?: bigint // 当前连接的基站（不作为绑定标志）
    /** 基站ID */
    stationId?: string // 基站绑定标志
    /** 是否脱落 */
    isFall?: boolean
    /** 是否启用 */
    isEnable = true
    /** 设备类型（0：标签，1：定位器） */
    eqpType = EqpTypes.Tag
    /** 是否在线（0：离线，1：在线） */
    onlineState = OnlineStates.Offline
    /** 定位方式 */
    locationMode?: LocationModes
    /** 标签ID */
    tagId = ''
    /** 资产ID */
    assetId?: string
    /** RFID */
    rfid?: string
    /** IMEI */
    imei?: string
    /** ICCID */
    iccid?: string
    /** 电量 */
    battery?: number
    /** 信号 */
    signal?: number
    /** 温度 */
    temperature?: number
    /** 经度 */
    longitude?: number
    /** 维度 */
    latitude?: number
    /** 备注 */
    comment?: string
    /** 上报时间 */
    reportTime?: Date
    /** 图片 */
    image?: string
}

/** “标签”对象 */
export class TagDto extends TagEntity {
    /** 批次ID */
    batchId = ''
    /** 类型名称 */
    typeName = ''
    /** 公司 */
    company?: bigint
    /** 公司名称 */
    companyName?: string
    /** 场地 */
    site?: bigint
    /** 场地名称 */
    siteName?: string
    /** 地址 */
    address?: string
}
```

## 标签类型

| Name | Action | Method | Param | Return |
| --- | --- | --- | --- | --- |
| 数量 | TagType/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 单条 | TagType/{id} | Get |   | MyActionResult\<IdName> |
| 集合 | TagType/List | Post | 集合查询参数 | MyActionResult\<List\<IdName>> |
| 增单条 | TagType | Post | \[FromBody\] IdName entity | MyActionResult\<IdName> |
| 增多条 | TagType/Range | Post | \[FromBody\] List\<IdName> entities | MyActionResult\<object> |
| 改单条 | TagType | Put | \[FromBody\] IdName entity | MyActionResult\<object> |
| 改多条 | TagType/Range | Put | \[FromBody\] List\<IdName> entities | MyActionResult\<object> |
| 删单条 | TagType/{id} | Delete |   | MyActionResult\<object> |
| 删多条 | TagType/Range | Delete | \[FromBody\] List\<IdName> entities | MyActionResult\<object> |

## 资产

| Name | Action | Method | Param | Return |
| --- | --- | --- | --- | --- |
| 数量 | Asset/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 单条 | Asset/{id} | Get |   | MyActionResult\<AssetEntity> |
| 集合 | Asset/List | Post | 集合查询参数 | MyActionResult\<List\<AssetEntity>> |
| 增单条 | Asset | Post | \[FromBody\] AssetEntity entity | MyActionResult\<AssetEntity> |
| 增多条 | Asset/Range | Post | \[FromBody\] List\<AssetEntity> entities | MyActionResult\<object> |
| 改单条 | Asset | Put | \[FromBody\] AssetEntity entity | MyActionResult\<object> |
| 改多条 | Asset/Range | Put | \[FromBody\] List\<AssetEntity> entities | MyActionResult\<object> |
| 删单条 | Asset/{id} | Delete |   | MyActionResult\<object> |
| 删多条 | Asset/Range | Delete | \[FromBody\] List\<AssetEntity> entities | MyActionResult\<object> |
| 完整数据 | Asset/Full | Get | long? id, string? rfid | MyActionResult\<AssetDto> |
| 完整集合 | Asset/FullList | Post | 集合查询参数 | MyActionResult\<List\<AssetDto>> |
| 位置 | Asset/Position/{asset} | Get |   | MyActionResult\<AssetPosition> |
| “位置”集合 | Asset/PositionList | Post | 集合查询参数 | MyActionResult\<List\<AssetPosition>> |
| 入库 | Asset/Inbound | Put | \[FromBody\] List\<long> ids | MyActionResult\<object> |
| 出库 | Asset/Outbound/{site} | Put | \[FromBody\] List\<long> ids | MyActionResult\<object> |

### Model

```typescript
/** 资产状态 */
export enum AssetStates {
    /** 无记录 */
    NoRecord = 0,
    /** 入库 */
    Inbound = 1,
    /** 在库 */
    InStore = 2,
    /** 滞留 */
    Stolid = 3,
    /** 出库 */
    Outbound = 4,
    /** 在途 */
    InTransit = 5,
    /** 超时 */
    Timeout = 6,
}

/** "资产"实体 */
export class AssetEntity {
    id: bigint = 0n
    assetId = ''
    department: bigint = 0n
    type: bigint = 0n
    tag?: bigint
    tagId?: string
    tagType?: bigint
    station?: bigint
    vehicle?: bigint
    transfer?: bigint
    name? = ''
    comment?: string
    // 计算:
    lastRecord?: bigint // 计算时才更新，建议使用GetLast获取最新记录
    state: AssetStates = AssetStates.NoRecord
    onlineState: OnlineStates = OnlineStates.Offline
    isAuto: boolean = true
    isFall?: boolean
    errorType?: ErrorTypes
    bindingTime?: Date
    calculationTime?: Date
    dailyMove?: number
    monthlyMove?: number
    totalMove?: number
    stayDuration?: number
    offlineDuration?: number
    travelDuration?: number
}

/** "资产"对象 */
export class AssetDto extends AssetEntity {
    company: bigint = 0n
    companyName = ''
    departmentName = ''
    typeName = ''
    stateName = ''
    stationId?: string
    rfid?: string
    plate?: string
    siteName?: string
    battery?: number
    fullAddr?: string
    transferCode?: string
}

/** 资产位置 */
export class AssetPosition {
    id: bigint = 0n
    assetId = ''
    lastRecord?: bigint
    longitude = 0
    latitude = 0
    reportTime?: Date
    locationMode?: LocationModes
}
```

## 资产记录

| Name | Action | Method | Param | Return |
| --- | --- | --- | --- | --- |
| 数量 | AssetRecord/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 单条 | AssetRecord/{id} | Get |   | MyActionResult\<AssetRecordEntity> |
| 集合 | AssetRecord/List | Post | 集合查询参数 | MyActionResult\<List\<AssetRecordEntity>> |
| 增单条 | AssetRecord | Post | \[FromBody\] AssetRecordEntity entity | MyActionResult\<AssetRecordEntity> |
| 增多条 | AssetRecord/Range | Post | \[FromBody\] List\<AssetRecordEntity> entities | MyActionResult\<object> |
| 改单条 | AssetRecord | Put | \[FromBody\] AssetRecordEntity entity | MyActionResult\<object> |
| 改多条 | AssetRecord/Range | Put | \[FromBody\] List\<AssetRecordEntity> entities | MyActionResult\<object> |
| 删单条 | AssetRecord/{id} | Delete |   | MyActionResult\<object> |
| 删多条 | AssetRecord/Range | Delete | \[FromBody\] List\<AssetRecordEntity> entities | MyActionResult\<object> |
| 完整数据 | AssetRecord/Full | Get | long? id, string? assetId, string? rfid | MyActionResult\<AssetRecordDto> |
| 最新数据 | AssetRecord/Last | Get | long asset | MyActionResult\<AssetRecordEntity> |
| 最新完整数据 | AssetRecord/FullLast | Get | long asset | MyActionResult\<AssetRecordDto> |
| 完整集合 | AssetRecord/FullList | Post | 集合查询参数 | MyActionResult\<List\<AssetRecordDto>> |
| 路径 | AssetRecord/Path | Post | 路径查询参数 | MyActionResult\<List\<AssetLngLat>> |

### 路径查询参数

```cs
[FromQuery] long asset,
[FromQuery] DateTime? start,
[FromQuery] DateTime? end,
[FromQuery] LocationModes? locationMode,
[FromBody] FilterDto? filter
```

```typescript
/** 定位方式 */
export enum LocationModes {
    /** 基站 */
    BaseStation = 0,
    /** 4G */
    _4G = 1,
    /** GPS */
    GPS = 2,
    /** WiFi */
    WiFi = 3,
    /** 4G+蓝牙 */
    _4G_Bluetooth = 4,
    /** GPS+蓝牙 */
    GPS_Bluetooth = 5,
    /** WiFi+蓝牙 */
    WiFi_Bluetooth = 6,
    /** 4G校准 */
    _4G_Calibrate = 7,
    /** WiFi校准 */
    WiFi_Calibrate = 8,
    /** 4G+蓝牙校准 */
    _4G_Bluetooth_Calibrate = 9,
    /** WiFi+蓝牙校准 */
    WiFi_Bluetooth_Calibrate = 10,
    /** 信标辅助定位 */
    Beacon_Assistance = 11,
}

/** 资产经纬度 */
export class AssetLngLat {
    longitude = 0
    latitude = 0
    site?: bigint
    address?: string
    reportTime: Date = new Date()
    locationMode?: LocationModes
}

/** "资产记录"实体 */
export class AssetRecordEntity {
    asset: bigint = 0n
    tag: bigint = 0n
    state: AssetStates = AssetStates.NoRecord
    // Tag:
    onlineState: OnlineStates = OnlineStates.Offline
    locationMode?: LocationModes
    station?: bigint
    site?: bigint
    targetSite?: bigint
    battery?: number
    signal?: number
    temperature?: number
    longitude?: number
    latitude?: number
    comment?: string
    reportTime?: Date
}

/** "资产记录"对象 */
export class AssetRecordDto extends AssetRecordEntity {
    tagId = ''
    siteName?: string
    addr?: string
    addrDetail?: string
    address?: string
    targetSiteName?: string
    targetAddr?: string
    targetAddrDetail?: string
    fullAddr = ''
    fullTarget = ''
}
```

## 绑定记录

| Name | Action | Method | Param | Return |
| --- | --- | --- | --- | --- |
| 数量 | BindingRecord/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 单条 | BindingRecord/{id} | Get |   | MyActionResult\<BindingRecordEntity> |
| 集合 | BindingRecord/List | Post | 集合查询参数 | MyActionResult\<List\<BindingRecordEntity>> |
| 增单条 | BindingRecord | Post | \[FromBody\] BindingRecordEntity entity | MyActionResult\<BindingRecordEntity> |
| 增多条 | BindingRecord/Range | Post | \[FromBody\] List\<BindingRecordEntity> entities | MyActionResult\<object> |
| 改单条 | BindingRecord | Put | \[FromBody\] BindingRecordEntity entity | MyActionResult\<object> |
| 改多条 | BindingRecord/Range | Put | \[FromBody\] List\<BindingRecordEntity> entities | MyActionResult\<object> |
| 删单条 | BindingRecord/{id} | Delete |   | MyActionResult\<object> |
| 删多条 | BindingRecord/Range | Delete | \[FromBody\] List\<BindingRecordEntity> entities | MyActionResult\<object> |
| 最新数据 | BindingRecord/Last | Get | long asset | MyActionResult\<BindingRecordEntity> |
| 完整集合 | BindingRecord/FullList | Get | long asset | MyActionResult\<List\<BindingRecordDto>> |

### Model

```typescript
/** “绑定记录”实体 */
export class BindingRecordEntity {
    id: bigint = 0n
    tag: bigint = 0n
    asset: bigint = 0n
    tagId = ''
    assetId = ''
    isBinding = true
    time: Date = new Date()
}
```

## 车辆

| Name | Action | Method | Param | Return |
| --- | --- | --- | --- | --- |
| 数量 | Vehicle/Count | Post | \[FromBody\] FilterDto? filter | MyActionResult\<int> |
| 单条 | Vehicle/{id} | Get |   | MyActionResult\<VehicleEntity> |
| 集合 | Vehicle/List | Post | 集合查询参数 | MyActionResult\<List\<VehicleEntity>> |
| 增单条 | Vehicle | Post | \[FromBody\] VehicleEntity entity | MyActionResult\<VehicleEntity> |
| 增多条 | Vehicle/Range | Post | \[FromBody\] List\<VehicleEntity> entities | MyActionResult\<object> |
| 改单条 | Vehicle | Put | \[FromBody\] VehicleEntity entity | MyActionResult\<object> |
| 改多条 | Vehicle/Range | Put | \[FromBody\] List\<VehicleEntity> entities | MyActionResult\<object> |
| 删单条 | Vehicle/{id} | Delete |   | MyActionResult\<object> |
| 删多条 | Vehicle/Range | Delete | \[FromBody\] List\<VehicleEntity> entities | MyActionResult\<object> |
| IdName集合 | Vehicle/SelectIdPlate | Post | \[FromBody\] FilterDto? filter | MyActionResult\<List\<IdName>> |

### Model

```cs
/** “车辆”实体 */
export class VehicleEntity {
    id: bigint = 0n
    company: bigint = 0n
    plate = ''
    logistics?: string
    driver?: string
    phone?: string
}
```

## END