import { authorityHelper } from "@/0_tigersan_ui/tigerui"

export class Authorities {
    /** 基础设置 */
    static BasicSettingsFolder = authorityHelper.GetAuthority()
    static CompanyMgtPage = authorityHelper.GetAuthority()
    static DepartmentMgtPage = authorityHelper.GetAuthority()
    static RoleMgtPage = authorityHelper.GetAuthority()
    static PersonMgtPage = authorityHelper.GetAuthority()
    static SiteMgt = authorityHelper.GetAuthority()
    static BatchMgtPage = authorityHelper.GetAuthority()
    /** 基站管理 */
    static BaseStationMgtFolder = authorityHelper.GetAuthority()
    static BaseStationMgtPage = authorityHelper.GetAuthority()
    /** 标签管理 */
    static TagMgtFolder = authorityHelper.GetAuthority()
    static TagMgtPage = authorityHelper.GetAuthority()
    static IndoorPositionPage = authorityHelper.GetAuthority()
    static PersonMgtTagPage = authorityHelper.GetAuthority()
    static AssetMgtTagPage = authorityHelper.GetAuthority()
    static EnvSensorPage = authorityHelper.GetAuthority()
    /** 设备管理 */
    static EqpMgtFolder = authorityHelper.GetAuthority()
    static Locator4gPage = authorityHelper.GetAuthority()
    /** 操作管理 */
    static OperationMgtFolder = authorityHelper.GetAuthority()
    static OperationRecordPage = authorityHelper.GetAuthority()
    static OperationRetryPage = authorityHelper.GetAuthority()
    /** 字典管理 */
    static DictionaryMgtFolder = authorityHelper.GetAuthority()
    static SiteType = authorityHelper.GetAuthority()
    static StationType = authorityHelper.GetAuthority()
    static TagType = authorityHelper.GetAuthority()
    /** 系统设置 */
    static SystemSettingsFolder = authorityHelper.GetAuthority()
    static SystemSettingsPage = authorityHelper.GetAuthority()
    static EqpSettings = authorityHelper.GetAuthority()
    static AlarmMgtPage = authorityHelper.GetAuthority()
    static FileMgtPage = authorityHelper.GetAuthority()
    /** 资产管理 */
    static AssetMgtFolder = authorityHelper.GetAuthority()
    static AssetLedgerPage = authorityHelper.GetAuthority()
    static AssetMapPage = authorityHelper.GetAuthority()
    static AssetInventoryPage = authorityHelper.GetAuthority()
    static AssetTransferPage = authorityHelper.GetAuthority()
    static AssetAlarmPage = authorityHelper.GetAuthority()
    static AssetMaintainPage = authorityHelper.GetAuthority()
    static AssetReportPage = authorityHelper.GetAuthority()
    /** 其它 */
    static OtherFolder = authorityHelper.GetAuthority()
    static OwnershipTransferPage = authorityHelper.GetAuthority()
    static VehiclesListPage = authorityHelper.GetAuthority()
    static AnalysisPage = authorityHelper.GetAuthority()
    static ErrorInfoPage = authorityHelper.GetAuthority()
    static WorkFlowPage = authorityHelper.GetAuthority()
}