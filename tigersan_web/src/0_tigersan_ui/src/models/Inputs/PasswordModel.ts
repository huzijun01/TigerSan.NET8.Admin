import { computed, ref } from 'vue'
import { Icons } from '../../base'
import { TextBoxModel } from './TextBoxModel'

export class PasswordModel extends TextBoxModel {
    //#region 【Props】
    readonly IsShowValue = ref(false)

    //#region [computed]
    readonly Type = computed(() => {
        return this.IsShowValue.value ? 'text' : 'password'
    })
    readonly EyeText = computed(() => {
        return this.IsShowValue.value ? Icons.Eye : Icons.Eye_Close
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Functions】
    readonly OnClickEye = () => {
        this.IsShowValue.value = !this.IsShowValue.value
    }
    //#endregion 【Functions】
}