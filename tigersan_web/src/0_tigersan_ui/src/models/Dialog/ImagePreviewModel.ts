import { ref } from "vue"
import { PopWindowModel } from "./PopWindowModel"

export class ImagePreviewModel extends PopWindowModel {
    //#region 【Props】
    /** URL */
    readonly Url = ref<string | undefined>()
    //#endregion 【Props】
}