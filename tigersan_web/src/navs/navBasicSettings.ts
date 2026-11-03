import { Icons, NavFolderConfig, TextModel, Texts } from '@/0_tigersan_ui/tigerui'
// BasicSettings:
import CompanyMgtPage from '@/pages/BasicSettings/BasicSettings/CompanyMgtPage/CompanyMgtPage.vue'
import DepartmentMgtPage from '@/pages/BasicSettings/BasicSettings/DepartmentMgtPage/DepartmentMgtPage.vue'
import PersonMgtPage from '@/pages/BasicSettings/BasicSettings/PersonMgtPage/PersonMgtPage.vue'
import RoleMgtPage from '@/pages/BasicSettings/BasicSettings/RoleMgtPage/RoleMgtPage.vue'
import SiteMgtPage from '@/pages/BasicSettings/BasicSettings/SiteMgtPage/SiteMgtPage.vue'
import BatchMgtPage from '@/pages/BasicSettings/BasicSettings/BatchMgtPage/BatchMgtPage.vue'
// BaseStationMgt:
import BaseStationMgtPage from '@/pages/BasicSettings/Equipments/BaseStationMgtPage/BaseStationMgtPage.vue'
// TagMgt:
import PersonMgtTagPage from '@/pages/BasicSettings/Equipments/TagMgt/PersonMgtTagPage/PersonMgtTagPage.vue'
import AssetMgtTagPage from '@/pages/BasicSettings/Equipments/TagMgt/AssetMgtTagPage/AssetMgtTagPage.vue'
import EnvSensorPage from '@/pages/BasicSettings/Equipments/TagMgt/EnvSensorPage/EnvSensorPage.vue'
import TagMgtPage from '@/pages/BasicSettings/Equipments/TagMgt/TagMgtPage/TagMgtPage.vue'
// EqpMgt:
import Locator4gPage from '@/pages/BasicSettings/EqpMgt/Locator4gPage/Locator4gPage.vue'
// Dictionaries:
import AssetTypeMgtPage from '@/pages/BasicSettings/Dictionaries/AssetTypeMgtPage.vue'
import ScenarioMgtPage from '@/pages/BasicSettings/Dictionaries/ScenarioMgtPage.vue'
import SiteTypeMgtPage from '@/pages/BasicSettings/Dictionaries/SiteTypeMgtPage.vue'
import StationTypeMgtPage from '@/pages/BasicSettings/Dictionaries/StationTypeMgtPage.vue'
import TagTypeMgtPage from '@/pages/BasicSettings/Dictionaries/TagTypeMgtPage.vue'
// OperationMgt:
import OperationRecordPage from '@/pages/BasicSettings/OperationMgt/OperationRecordPage/OperationRecordPage.vue'
import OperationRetryPage from '@/pages/BasicSettings/OperationMgt/OperationRetryPage/OperationRetryPage.vue'
// SystemSettings:
import SystemSettingsPage from '@/pages/BasicSettings/SystemSettings/SystemSettingsPage/SystemSettingsPage.vue'
import FileMgtPage from '@/pages/BasicSettings/SystemSettings/FileMgtPage/FileMgtPage.vue'
import { Authorities } from './Authorities'

export const navBasicSettings: NavFolderConfig = {
    Folders: [
        {
            Key: "基础设置",
            Title: Texts.BasicSettings,
            Icon: Icons.Setting_Linear,
            IsOpen: true,
            _authority: Authorities.BasicSettingsFolder,
            Buttons: [
                {
                    Key: "组织机构",
                    Title: TextModel.Computed('Company Mgt', "组织机构"),
                    Icon: Icons.Monitor,
                    IsSelected: true,
                    IsShowCloseButton: false,
                    _component: CompanyMgtPage,
                    _authority: Authorities.CompanyMgtPage,
                },
                {
                    Key: "部门管理",
                    Title: TextModel.Computed('Department Mgt', "部门管理"),
                    Icon: Icons.Group,
                    IsSelected: false,
                    _component: DepartmentMgtPage,
                    _authority: Authorities.DepartmentMgtPage,
                },
                {
                    Key: "角色管理",
                    Title: TextModel.Computed('Role Mgt', "角色管理"),
                    Icon: Icons.Necktie,
                    IsSelected: false,
                    _component: RoleMgtPage,
                    _authority: Authorities.RoleMgtPage,
                },
                {
                    Key: "人员管理",
                    Title: TextModel.Computed('Person Mgt', "人员管理"),
                    Icon: Icons.Person,
                    IsSelected: false,
                    _component: PersonMgtPage,
                    _authority: Authorities.PersonMgtPage,
                },
                {
                    Key: "场地管理",
                    Title: TextModel.Computed('Site Mgt', "场地管理"),
                    Icon: Icons.Building_1,
                    IsSelected: false,
                    _component: SiteMgtPage,
                    _authority: Authorities.SiteMgt,
                },
                {
                    Key: "批次管理",
                    Title: TextModel.Computed('Batch Mgt', "批次管理"),
                    Icon: Icons.Layer,
                    IsSelected: false,
                    _component: BatchMgtPage,
                    _authority: Authorities.BatchMgtPage,
                },
            ]
        },
        {
            Key: "基站管理",
            Title: TextModel.Computed('Station Mgt', "基站管理"),
            Icon: Icons.Router_Linear,
            IsOpen: false,
            _authority: Authorities.BaseStationMgtFolder,
            Buttons: [
                {
                    Key: "基站管理",
                    Title: TextModel.Computed('Station Mgt', "基站管理"),
                    Icon: Icons.Router_Linear,
                    IsSelected: false,
                    _component: BaseStationMgtPage,
                    _authority: Authorities.BaseStationMgtPage,
                },
            ]
        },
        {
            Key: "标签管理",
            Title: TextModel.Computed('Tag Mgt', "标签管理"),
            Icon: Icons.Tag_Linear_2,
            IsOpen: false,
            _authority: Authorities.TagMgtFolder,
            Buttons: [
                {
                    Key: "标签管理",
                    Title: TextModel.Computed('Tag Mgt', "标签管理"),
                    Icon: Icons.Tag_Linear_2,
                    _component: TagMgtPage,
                    _authority: Authorities.TagMgtPage,
                },
                {
                    Key: "人员管理标签",
                    Title: TextModel.Computed('PersonMgtTag', "人员管理标签"),
                    Icon: Icons.Person,
                    _component: PersonMgtTagPage,
                    _authority: Authorities.PersonMgtTagPage,
                },
                {
                    Key: "资产管理标签",
                    Title: TextModel.Computed('AssetMgtTag', "资产管理标签"),
                    Icon: Icons.Asset,
                    _component: AssetMgtTagPage,
                    _authority: Authorities.AssetMgtTagPage,
                },
                {
                    Key: "传感器标签",
                    Title: TextModel.Computed('Env Sensor', "传感器标签"),
                    Icon: Icons.Environment,
                    _component: EnvSensorPage,
                    _authority: Authorities.EnvSensorPage,
                },
            ]
        },
        {
            Key: "设备管理",
            Title: TextModel.Computed('Eqp Mgt', "设备管理"),
            Icon: Icons.Server,
            IsOpen: false,
            _authority: Authorities.EqpMgtFolder,
            Buttons: [
                {
                    Key: "4G定位器",
                    Title: TextModel.Computed('4G Locator', "4G定位器"),
                    Icon: Icons.EQP,
                    _component: Locator4gPage,
                    _authority: Authorities.Locator4gPage,
                },
            ]
        },
        {
            IsOpen: false,
            Key: "操作管理",
            Title: TextModel.Computed('Operation Mgt', "操作管理"),
            Icon: Icons.ViewProcess,
            _authority: Authorities.OperationMgtFolder,
            Buttons: [
                {
                    Key: "操作记录",
                    Title: TextModel.Computed('Operation Record', "操作记录"),
                    Icon: Icons.Time,
                    _component: OperationRecordPage,
                    _authority: Authorities.OperationRecordPage,
                },
                {
                    Key: "操作重试",
                    Title: TextModel.Computed('Operation Retry', "操作重试"),
                    Icon: Icons.Refresh,
                    _component: OperationRetryPage,
                    _authority: Authorities.OperationRetryPage,
                },
            ]
        },
        {
            IsOpen: false,
            Key: "字典管理",
            Title: TextModel.Computed('Dictionary Mgt', "字典管理"),
            Icon: Icons.Dictionary,
            _authority: Authorities.DictionaryMgtFolder,
            Buttons: [
                {
                    Key: "资产类型",
                    Title: Texts.AssetType,
                    Icon: Icons.Asset,
                    IsSelected: false,
                    _component: AssetTypeMgtPage,
                    _authority: Authorities.SiteType,
                },
                {
                    Key: "场地类型",
                    Title: Texts.SiteType,
                    Icon: Icons.Building_1,
                    IsSelected: false,
                    _component: SiteTypeMgtPage,
                    _authority: Authorities.SiteType,
                },
                {
                    Key: "基站类型",
                    Title: Texts.StationType,
                    Icon: Icons.Router_Linear,
                    IsSelected: false,
                    _component: StationTypeMgtPage,
                    _authority: Authorities.StationType,
                },
                {
                    Key: "场景",
                    Title: Texts.Scenario,
                    Icon: Icons.Product,
                    IsSelected: false,
                    _component: ScenarioMgtPage,
                    _authority: Authorities.SiteType,
                },
                {
                    Key: "标签类型",
                    Title: Texts.TagType,
                    Icon: Icons.Tag_Linear_2,
                    IsSelected: false,
                    _component: TagTypeMgtPage,
                    _authority: Authorities.TagType,
                },
            ]
        },
        {
            IsOpen: false,
            Key: "系统设置",
            Title: Texts.SystemSettings,
            Icon: Icons.Setting_Linear,
            _authority: Authorities.SystemSettingsFolder,
            Buttons: [
                {
                    Icon: Icons.Server,
                    Key: "设备设置",
                    Title: TextModel.Computed('Eqp Settings', "设备设置"),
                    _component: SystemSettingsPage,
                    _authority: Authorities.EqpSettings,
                },
                {
                    Key: "报警管理",
                    Title: TextModel.Computed('Alarm Mgt', "报警管理"),
                    Icon: Icons.Bell,
                    IsSelected: false,
                    _component: undefined,
                    _authority: Authorities.AlarmMgtPage,
                },
                {
                    Key: "文件管理",
                    Title: TextModel.Computed('File Mgt', "文件管理"),
                    Icon: Icons.File_Linear,
                    IsSelected: false,
                    _component: FileMgtPage,
                    _authority: Authorities.FileMgtPage,
                },
            ]
        },
    ],
    Buttons: [
    ]
}