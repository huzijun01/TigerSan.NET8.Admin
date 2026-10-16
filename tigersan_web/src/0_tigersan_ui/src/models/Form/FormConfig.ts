import { ref, type Ref, type ComputedRef } from "vue"
import type { TObjectAction, TGetter, TSetter, UnknownChange } from "../../types"
import { type FormVerify, type FormSubmit, type FormSubmitAsync, FormModel, FormItemModel } from "./FormModel"

/** 表单配置 */
export class FormConfig<TSource extends object> {
    //#region 【Fields】
    /** “表单项目配置”集合 */
    _itemConfigs?: FormItemConfig<TSource, any>[]
    /** “源数据获取”方法  */
    _getSource: TObjectAction<TSource>
    /** 关闭后 */
    _onClose?: (isCancel: boolean) => any
    /** 提交时 */
    _onSubmit?: FormSubmit<TSource>
    /** 提交时（异步） */
    _onSubmitAsync?: FormSubmitAsync<TSource>
    /** 初始化前 */
    _beforeInit?: (isEdit: boolean) => any
    /** 初始化前（异步） */
    _beforeInitAsync?: (isEdit: boolean) => Promise<void>
    /** 初始化后 */
    _onInit?: (isEdit: boolean) => any
    /** 初始化后（异步）：优先执行该方法 */
    _onInitAsync?: (isEdit: boolean) => Promise<void>
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“显示” */
    IsShow?: boolean
    /** 标题 */
    Title?: string | ComputedRef<string>
    /** “提交”文本 */
    CancelText?: string | ComputedRef<string>
    /** “提交”文本 */
    SubmitText?: string | ComputedRef<string>
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(getSource: TObjectAction<TSource>) {
        this._getSource = getSource
    }
    //#endregion 【Ctor】
}

/** 表单项目配置 */
export class FormItemConfig<TSource extends object, TTarget> {
    //#region 【Fields】
    /** 属性名 */
    _propName: string
    /** “属性名”垂直对齐 */
    _propNameVerticalAlign?: string
    /** “源数据”getter */
    _getValue?: TGetter<TSource, TTarget | undefined | Promise<TTarget | undefined>>
    /** “源数据”setter */
    _setValue?: TSetter<TSource, TTarget | undefined>
    /** 改变后 */
    _onChange?: UnknownChange
    /** 是否“验证无误” */
    _isVerifyOk?: FormVerify<TSource>
    //#endregion 【Fields】

    //#region 【Props】
    //#region [需手动绑定]
    /** 目标数据
     * （需手动绑定到“表单元素”上） */
    Target: Ref<TTarget | undefined> = ref<TTarget>()
    /** 表单项目模型
     * （由“FormItemModel”传入，需手动绑定到“表单元素”上） */
    ItemModel?: FormItemModel<TSource, TTarget>
    //#endregion [需手动绑定]

    /** 属性文本 */
    PropText?: string | ComputedRef<string>
    /** 是否“必填” */
    IsEquired?: boolean
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(propName: string, target?: Ref<TTarget>) {
        this._propName = propName
        if (target != undefined) this.Target = target
    }
    //#endregion 【Ctor】
}

/** 设置“表单模型” */
export function SetFormModel<TSource extends object>(formModel: FormModel<TSource>, formConfig: FormConfig<TSource>) {
    // Fields:
    formModel._itemModels = GetItemModels(formModel, formConfig)
    formModel._onClose = formConfig._onClose
    formModel._onSubmit = formConfig._onSubmit
    formModel._onSubmitAsync = formConfig._onSubmitAsync
    formModel._beforeInit = formConfig._beforeInit
    formModel._beforeInitAsync = formConfig._beforeInitAsync
    formModel._onInit = formConfig._onInit
    formModel._onInitAsync = formConfig._onInitAsync

    // Properties:
    if (formConfig.IsShow != undefined) formModel.IsShow.value = formConfig.IsShow
    if (formConfig.Title != undefined) formModel.Title.value = formConfig.Title
    if (formConfig.CancelText != undefined) formModel.CancelText.value = formConfig.CancelText
    if (formConfig.SubmitText != undefined) formModel.SubmitText.value = formConfig.SubmitText
}

/** 获取“表单项目模型”集合 */
export function GetItemModels<TSource extends object, TTarget>(formModel: FormModel<TSource>, formConfig: FormConfig<TSource>): FormItemModel<TSource, TTarget>[] {
    if (!formConfig._itemConfigs) return []

    let itemModels = new Array<FormItemModel<TSource, TTarget>>()

    formConfig._itemConfigs.forEach(itemConfig => {
        // create:
        const itemModel = new FormItemModel<TSource, TTarget>(formModel, itemConfig._propName, itemConfig.Target)

        // Fields:
        if (itemConfig._propNameVerticalAlign != undefined) itemModel._propNameVerticalAlign = itemConfig._propNameVerticalAlign
        if (itemConfig._getValue != undefined) itemModel._getValue = itemConfig._getValue
        if (itemConfig._setValue != undefined) itemModel._setValue = itemConfig._setValue
        itemModel._onChange = itemConfig._onChange
        itemModel._isVerifyOk = itemConfig._isVerifyOk

        // Properties:
        if (itemConfig.IsEquired != undefined) itemModel.IsEquired.value = itemConfig.IsEquired
        if (itemConfig.PropText != undefined) itemModel.PropText.value = itemConfig.PropText

        // Functions:
        itemConfig.ItemModel = itemModel // 传入“表单项目模型”

        // push:
        itemModels.push(itemModel)
    })

    return itemModels
}