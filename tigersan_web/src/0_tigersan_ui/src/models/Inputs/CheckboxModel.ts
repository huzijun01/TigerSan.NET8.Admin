import { ref } from "vue"
import type { StringArrayFunc } from "../../types"
import { nanoid } from "nanoid"

export class CheckboxModel {
    //#region 【Fields】
    _id = nanoid()
    _onChange?: (model: CheckboxModel) => any
    //#endregion 【Fields】

    //#region 【Props】
    readonly IsChecked = ref(false)
    readonly Value = ref<string>()
    readonly Text = ref('')
    readonly IsReadonly = ref(false)
    //#endregion 【Props】

    //#region 【Functions】
    readonly OnChange = () => {
        if (this._onChange) {
            this._onChange(this)
        }
    }
    //#endregion 【Functions】
}

export class CheckboxGroupModel {
    //#region 【Fields】
    _onChange?: StringArrayFunc
    //#endregion 【Fields】

    //#region 【Props】
    readonly Values = ref<Array<string>>([])
    //#endregion 【Props】

    //#region 【Functions】
    readonly OnChange = () => {
        if (this._onChange) {
            this._onChange(this.Values.value)
        }
    }
    //#endregion 【Functions】
}