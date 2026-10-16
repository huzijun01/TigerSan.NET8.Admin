import { ref, computed } from "vue"
import { loading, StringHelper, Texts, PieModel, Colors, WatchBehavior } from "@/0_tigersan_ui/tigerui"
import { siteHelper } from "./SiteModel"
import { assetHelper } from "../Home/AssetModel"
import { AssetStates } from "../base/AssetStates"
import { tagHelper } from "../Equipments/TagModel"
import { baseStationHelper } from "../Equipments/BaseStationModel"

export class CompanyInfoModel {
    //#region 【Fields】
    /** “ID”监听 */
    readonly watchId
    /** 资产状态 */
    readonly assetStates = new PieModel()
    //#endregion 【Fields】

    //#region 【Props】
    readonly Id = ref<bigint | undefined>()
    readonly Name = ref<string | undefined>()
    readonly Addr = ref<string | undefined>()
    readonly SiteCount = ref(0)
    readonly BaseStationCount = ref(0)
    readonly AssetCount = ref(0)
    readonly TagCount = ref(0)
    readonly IsShowAddr = computed(() => { return StringHelper.IsNotEmpty(this.Addr.value) })
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this.watchId = new WatchBehavior(this.Id, this.Refresh)

        this.assetStates.Height.value = 300
        this.assetStates._isAutoInit = false
        // this.assetStates.IsShowGuideLine.value = false
        this.assetStates.Title.value = Texts.AssetState
        this.assetStates.SetConfigs([
            {
                Name: Texts.NoRecord,
                Color: Colors.Blue,
                getValueAsync: async () => await assetHelper.GetCount({ company: this.Id.value, state: AssetStates.NoRecord })
            },
            {
                Name: Texts.Inbound,
                Color: Colors.Yellow,
                getValueAsync: async () => await assetHelper.GetCount({ company: this.Id.value, state: AssetStates.Inbound })
            },
            {
                Name: Texts.InStore,
                Color: Colors.Green,
                getValueAsync: async () => await assetHelper.GetCount({ company: this.Id.value, state: AssetStates.InStore })
            },
            {
                Name: Texts.Stolid,
                Color: Colors.Orange,
                getValueAsync: async () => await assetHelper.GetCount({ company: this.Id.value, state: AssetStates.Stolid })
            },
            {
                Name: Texts.Outbound,
                Color: Colors.Info,
                getValueAsync: async () => await assetHelper.GetCount({ company: this.Id.value, state: AssetStates.Outbound })
            },
            {
                Name: Texts.InTransit,
                Color: Colors.Brand,
                getValueAsync: async () => await assetHelper.GetCount({ company: this.Id.value, state: AssetStates.InTransit })
            },
            {
                Name: Texts.Timeout,
                Color: Colors.Red,
                getValueAsync: async () => await assetHelper.GetCount({ company: this.Id.value, state: AssetStates.Timeout })
            },
        ])
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            this.Clear()

            const id = this.Id.value
            if (!id) return

            await this.assetStates.Init()
            this.SiteCount.value = await siteHelper.GetCount({ company: id })
            this.BaseStationCount.value = await baseStationHelper.GetCount({ company: id })
            this.AssetCount.value = await assetHelper.GetCount({ company: id })
            this.TagCount.value = await tagHelper.GetCount({ company: id })
        } finally {
            loading.IsShow.value = false
        }
    }

    readonly Clear = async () => {
        this.SiteCount.value = 0
        this.BaseStationCount.value = 0
        this.AssetCount.value = 0
        this.TagCount.value = 0
    }
    //#endregion 【Functions】
}