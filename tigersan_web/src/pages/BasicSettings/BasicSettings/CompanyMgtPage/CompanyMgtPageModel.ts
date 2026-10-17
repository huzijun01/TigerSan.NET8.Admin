import { computed, ref, watch, type WatchHandle } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, BigintHelper, GetSubmitResult, IdName, ApiResult, loading, TreeModel, ArrayHelper, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { companyHelper, CompanyHelper, CompanyEntity, CompanyInfoModel } from '@/models'

/** 树 */
const tree = new TreeModel<CompanyEntity>()
/** “公司”选择框 */
const selectCompany = companyHelper.GetIdNameSelectModel()
selectCompany.Width.value = 280
/** 全局“公司”选择框 */
const selectCompanyGlobal = companyHelper.GetIdNameSelectModel()
selectCompanyGlobal.Width.value = 280
/** “可访问公司”集合 */
const AccessibleCompanies = computed(() => selectCompanyGlobal.CheckedValues.value.map(i => i?.id ?? 0n))

// 树:
tree._isActiveFirst = true
tree._isAllowUnactive = false
tree.IsShowCheckbox.value = false
tree._onActiveChange = (node, isActive) => {
    if (isActive) {
        if (!node._data) {
            console.warn('The _data is undefined!')
            return
        }
        selectCompany.Value.value = selectCompany.Items.find(n => BigintHelper.IsEqualAndNotUndefined(n.id, node._data?.id))
    } else {
        selectCompany.Value.value = undefined
    }
}

// 选择框:
selectCompany._isSelectFirst = true
selectCompany.IsShowClear.value = false
selectCompany._onChange = () => {
    tree.ActiveNode.value = tree.NodeArray.value.find(n => BigintHelper.IsEqualAndNotUndefined(n._data?.id, selectCompany.Value.value?.id))
}

selectCompanyGlobal.IsAllowMultiSelect.value = true
selectCompanyGlobal._getItemsAsync = undefined
selectCompanyGlobal._getItems = () => tree.GetCheckedNodeArray().map(i => new IdName(i._data?.id, i._data?.name))
selectCompanyGlobal._onInit = select => select.SelectAll()

export class CompanyMgtPageModel {
    //#region [static]
    /** “激活数据”监听 */
    private static watchActiveData?: WatchHandle
    /** 树 */
    static readonly tree = tree
    /** “公司”选择框 */
    static readonly selectCompany = selectCompany
    /** 全局“公司”选择框 */
    static readonly selectCompanyGlobal = selectCompanyGlobal
    /** “可访问公司”集合 */
    static readonly AccessibleCompanies = AccessibleCompanies
    //#region [static]

    /** 公司信息 */
    readonly companyInfo = new CompanyInfoModel()
    /** “父公司”选择框 */
    readonly selectParentCompany = companyHelper.GetIdNameSelectModel()

    /** “公司名称”项目配置 */
    readonly configName: FormItemConfig<CompanyEntity, string> = {
        _propName: 'name',
        PropText: Texts.Name,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.name)
        }
    }

    /** “公司地址”项目配置 */
    readonly configAddr: FormItemConfig<CompanyEntity, string> = {
        _propName: 'addr',
        PropText: Texts.Addr,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.addr)
        }
    }

    /** “父公司”项目配置 */
    readonly configParent: FormItemConfig<CompanyEntity, IdName> = {
        _propName: 'parent',
        PropText: Texts.Parent,
        IsEquired: false,
        Target: this.selectParentCompany.Value,
        _getValue: (obj, propName) => this.selectParentCompany.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, obj.parent)),
        _setValue: (obj, propName, value) => obj.parent = value ? value.id : undefined
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => {
        return new CompanyEntity()
    }

    /** “组织机构”表单配置 */
    readonly configCompanyForm: FormConfig<CompanyEntity> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            this.selectParentCompany._getItemsAsync = isEdit ? this.EditGetItemsAsync : this.AddGetItemsAsync
            await this.selectParentCompany.UpdateItemsAsync()
        },
        _itemConfigs: [
            this.configName,
            this.configAddr,
            this.configParent,
        ]
    }

    /** “组织机构”表单模型 */
    readonly companyForm = new FormModel(this.configCompanyForm)
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        // 监听:
        CompanyMgtPageModel.watchActiveData?.stop()
        CompanyMgtPageModel.watchActiveData = watch(CompanyMgtPageModel.tree.ActiveData, data => {
            this.companyInfo.Id.value = data?.id
            this.companyInfo.Name.value = data?.name
            this.companyInfo.Addr.value = data?.addr
            CompanyMgtPageModel.selectCompanyGlobal.UpdateItemsAsync()
        })
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await companyHelper.GetList({}).then(arr => {
                CompanyMgtPageModel.tree.Clear()
                CompanyMgtPageModel.tree.Init(CompanyHelper.Companies2Tree(arr))
            })

            await this.companyInfo.Refresh()
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.companyForm.Title.value = TextModel.GetText('Add Company', '新增公司')

        this.companyForm._getSource = this.AddGetSource

        this.companyForm._onSubmitAsync = async source => {
            const res = await companyHelper.Add(source as CompanyEntity)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.companyForm.Show()
    }

    /** 改 */
    readonly Edit = async () => {
        const model = CompanyMgtPageModel.tree.ActiveData.value
        if (!model) {
            console.warn('The model is undefined!')
            return
        }

        this.companyForm.Title.value = TextModel.GetText('Edit Company', '修改公司')

        this.companyForm._getSource = () => {
            return ObjectHelper.ShallowCopy(model)
        }

        this.companyForm._onSubmitAsync = async source => {
            const res = await companyHelper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.companyForm.Show(true)
    }

    /** 删 */
    readonly Delete = () => {
        DialogHelper.Show(
            Texts.Confirm,
            TextModel.GetText(
                'Are you sure to delete this company and its subordinate companies?',
                '是否确定删除该公司及其下级公司？'),
            undefined,
            this.DeleteRowData,
            DialogMode.YesOrNo,
            Colors.Warning)
    }

    readonly DeleteRowData = async (state: DialogState) => {
        if (state != DialogState.Yes) return

        const model = CompanyMgtPageModel.tree.ActiveData.value
        if (!model) {
            console.warn('The model is undefined!')
            return
        }

        try {
            loading.IsShow.value = true

            await companyHelper.Delete(model.id).then(res => {
                this.Refresh()
                ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    readonly AddGetItemsAsync = this.selectParentCompany._getItemsAsync
    readonly EditGetItemsAsync = async () => {
        const arr = await companyHelper.GetIdNames()

        const active = CompanyMgtPageModel.tree.ActiveNode.value
        if (!active) {
            console.warn('The node is undefined!')
            return arr
        }

        // 剔除“自身节点”及“后代节点”:
        const ids = active.GetArray().map(n => n._data?.id)
        ArrayHelper.Filter(arr, i => !BigintHelper.IsContain(ids, i.id))

        return arr
    }
    //#endregion 【Functions】
}
