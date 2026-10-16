import { ref } from 'vue'
import { TextBoxModel } from './TextBoxModel'
import type { StringFunc } from '../../types'

export class SearchModel extends TextBoxModel {
    //#region 【Fields】
    _onSearch?: StringFunc
    //#endregion 【Fields】

    //#region 【Props】
    readonly IsShowValue = ref(false)
    //#endregion 【Props】

    //#region 【Functions】
    readonly OnSearch = () => {
        if (this._onSearch) {
            this._onSearch(this.Value.value)
        }
    }
    //#endregion 【Functions】
}