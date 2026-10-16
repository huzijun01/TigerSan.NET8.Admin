import { ref, computed } from "vue"
import { ContentSizeBehavior } from "../../helpers"

/** 抽屉盒子模型 */
export class DrawerBoxModel extends ContentSizeBehavior {
    //#region 【Props】
    /** 是否“打开” */
    readonly Title = ref('Title')

    //#region [computed]
    /** “打开”类名 */
    readonly OpenClass = computed(() => { return { 'drawer-box-open': this.IsOpen.value } })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Functions】
    /** 点击后 */
    readonly OnClick = () => {
        this.IsOpen.value = !this.IsOpen.value
    }
    //#endregion 【Functions】
}