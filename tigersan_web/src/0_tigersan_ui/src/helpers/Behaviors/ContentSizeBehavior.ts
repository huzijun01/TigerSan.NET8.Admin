import { computed, ref, shallowRef, type StyleValue } from "vue"

/** “内容尺寸”行为 */
export class ContentSizeBehavior {
    //#region 【Fields】
    protected _arrowOpen = 90
    protected _arrowClose = 0
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“打开” */
    readonly IsOpen = ref(true)
    /** 内容最大高度 */
    readonly ContentMaxHeight = ref(Number.MAX_VALUE)
    /** “内容容器”内边距 */
    readonly ContentPanelPadding = ref(0)
    /** 内容高度
     * （由“ContentSizeBehavior”内部维护） */
    readonly ContentHeight = ref(0)
    /** 尺寸容器 
     * （需绑定到“尺寸容器”上） */
    readonly refSizePanel = shallowRef<HTMLElement | undefined>()

    //#region [computed]
    /** “箭头”样式对象
     * （需绑定到“箭头”上） */
    readonly arrowStyle = computed((): StyleValue => {
        const arrowAngle = this.IsOpen.value ? this._arrowOpen : this._arrowClose
        return {
            transform: `rotate(${arrowAngle}deg)`
        }
    })

    /** “内容容器”样式对象 
     * （需绑定到“内容容器”上） */
    readonly ContentPanelStyle = computed((): StyleValue => {
        let height = this.IsOpen.value ? this.ContentHeight.value + this.ContentPanelPadding.value * 2 : 0

        return {
            height: `${height}px`,
            maxHeight: `${this.ContentMaxHeight.value}px`,
            overflow: this.IsOpen.value ? 'auto' : 'hidden',
            opacity: this.IsOpen.value ? 1 : 0,
            transition: 'var(--Global-Transition)'
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Functions】
    //#region [private]
    /** 更新内容高度 */
    readonly UpdateContentHeight = () => {
        this.ContentHeight.value = this.refSizePanel.value?.getBoundingClientRect().height ?? 0
    }
    //#endregion [private]

    /** 监听“尺寸容器”变化
     * （需在“onMounted”中调用） */
    ObserverSizePanel() {
        if (!this.refSizePanel.value) {
            console.warn('The refSizePanel is undefined!')
            return
        }

        new ResizeObserver(this.UpdateContentHeight)
            .observe(this.refSizePanel.value)
    }
    //#endregion 【Functions】
}