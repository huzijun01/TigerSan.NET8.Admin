import { type BooleanFunc } from "../../types"
import { computed, ref } from "vue"

export class SwitchModel {
    //#region 【Fields】
    _onChange?: BooleanFunc
    //#endregion 【Fields】

    //#region 【Props】
    readonly Value = ref(false)
    readonly IsEnable = ref(true)
    readonly OnText = ref('ON')
    readonly OffText = ref('OFF')

    //#region [computed]
    readonly Text = computed(() => {
        return this.Value.value ? this.OnText.value : this.OffText.value
    })

    readonly classObj = computed(() => {
        return {
            'on': this.Value.value,
            'disable': !this.IsEnable.value,
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Functions】
    readonly OnClick = () => {
        if (!this.IsEnable.value) return

        this.Value.value = !this.Value.value
        this.OnChange()
    }

    readonly OnChange = () => {
        if (this._onChange) {
            this._onChange(this.Value.value)
        }
    }
    //#endregion 【Functions】
}