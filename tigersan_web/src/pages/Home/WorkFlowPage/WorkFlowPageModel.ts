import { CsvLayerModel, Icons, PointModel, SvgModel } from "@/0_tigersan_ui/tigerui";

export class WorkFlowPageModel {
    readonly svgAssetState = new SvgModel()
    readonly svgOnlineState = new SvgModel()

    constructor() {
        this.svgAssetState.BgUrl.value = '资产状态.png'
        this.svgAssetState.ImageStyle.value = { width: '500px' }
        this.svgAssetState.SetLayers([{
            points: [
                {
                    X: 190,
                    Y: 60,
                    Icon: Icons.Setting_Planar
                },
                {
                    X: 446,
                    Y: 60,
                    Icon: Icons.Setting_Planar
                },
            ]
        }])

        this.svgOnlineState.BgUrl.value = '在线状态.png'
        this.svgOnlineState.ImageStyle.value = { width: '220px' }
        this.svgOnlineState.SetLayers([{
            points: [
                {
                    X: 62,
                    Y: 62,
                    Icon: Icons.Setting_Planar
                },
            ]
        }])
    }
}