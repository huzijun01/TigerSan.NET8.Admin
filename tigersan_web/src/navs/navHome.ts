import { Icons, NavFolderConfig, TextModel, Texts } from '@/0_tigersan_ui/tigerui'
import { Authorities } from './Authorities'
import AssetLedgerPage from '@/pages/Home/AssetLedgerPage/AssetLedgerPage.vue'
import AssetMapPage from '@/pages/Home/AssetMapPage/AssetMapPage.vue'
import AssetReportPage from '@/pages/Home/AssetReportPage/AssetReportPage.vue'
import TransferPage from '@/pages/Home/TransferPage/TransferPage.vue'
import VehiclePage from '@/pages/Home/VehiclePage/VehiclePage.vue'
import InventoryRecordPage from '@/pages/Home/InventoryRecordPage/InventoryRecordPage.vue'

export const navHome: NavFolderConfig = {
    Folders: [
        {
            Key: "资产管理",
            Title: TextModel.Computed('Asset Mgt', "资产管理"),
            Icon: Icons.Asset,
            IsOpen: true,
            _authority: Authorities.AssetMgtFolder,
            Buttons: [
                {
                    Key: "资产报表",
                    Title: TextModel.Computed('Asset Report', "资产看板"),
                    Icon: Icons.Chart_Pie,
                    IsSelected: true,
                    IsShowCloseButton: false,
                    _component: AssetReportPage,
                    _authority: Authorities.AssetReportPage,
                },
                {
                    Key: "资产台账",
                    Title: TextModel.Computed('Asset Ledger', "资产台账"),
                    Icon: Icons.Asset,
                    IsSelected: false,
                    _component: AssetLedgerPage,
                    _authority: Authorities.AssetLedgerPage,
                },
                {
                    Key: "资产地图",
                    Title: TextModel.Computed('Asset Map', "资产地图"),
                    Icon: Icons.Global_Linear,
                    IsSelected: false,
                    _component: AssetMapPage,
                    _authority: Authorities.AssetMapPage,
                },
                {
                    Key: "资产盘点",
                    Title: TextModel.Computed('Asset Inventory', "资产盘点"),
                    Icon: Icons.Log,
                    IsSelected: false,
                    _component: InventoryRecordPage,
                    _authority: Authorities.AssetInventoryPage,
                },
                {
                    Key: "资产调拨",
                    Title: TextModel.Computed('Asset Transfer', "资产调拨"),
                    Icon: Icons.Outbound,
                    IsSelected: false,
                    _component: TransferPage,
                    _authority: Authorities.AssetTransferPage,
                },
                {
                    Key: "资产预警",
                    Title: TextModel.Computed('Asset Alarm', "资产预警"),
                    Icon: Icons.Bell,
                    IsSelected: false,
                    _component: undefined,
                    _authority: Authorities.AssetAlarmPage,
                },
                {
                    Key: "资产维护",
                    Title: TextModel.Computed('Asset Maintain', "资产维护"),
                    Icon: Icons.Tools,
                    IsSelected: false,
                    _component: undefined,
                    _authority: Authorities.AssetMaintainPage,
                },
            ]
        },
        {
            Key: "其它",
            Title: Texts.Other,
            Icon: Icons.Folder_Linear,
            IsOpen: true,
            _authority: Authorities.OtherFolder,
            Buttons: [
                {
                    Key: "过户管理",
                    Title: TextModel.Computed('Ownership Mgt', "过户管理"),
                    Icon: Icons.Transfer,
                    IsSelected: false,
                    _component: undefined,
                    _authority: Authorities.OwnershipTransferPage,
                },
                {
                    Key: "车辆列表",
                    Title: TextModel.Computed('Vehicles List', "车辆列表"),
                    Icon: Icons.Transport,
                    IsSelected: false,
                    _component: VehiclePage,
                    _authority: Authorities.VehiclesListPage,
                },
                {
                    Key: "统计分析",
                    Title: TextModel.Computed('Analysis', "统计分析"),
                    Icon: Icons.Chart_Line,
                    IsSelected: false,
                    _component: undefined,
                    _authority: Authorities.AnalysisPage,
                },
                {
                    Key: "异常信息",
                    Title: TextModel.Computed('Error Info', "异常信息"),
                    Icon: Icons.Error,
                    IsSelected: false,
                    _component: undefined,
                    _authority: Authorities.ErrorInfoPage,
                },
                {
                    Key: "业务流程",
                    Title: TextModel.Computed('Work Flow', "业务流程"),
                    Icon: Icons.Flowchart,
                    IsSelected: false,
                    _component: undefined,
                    _authority: Authorities.WorkFlowPage,
                },
            ]
        },
    ],
    Buttons: [
    ]
}