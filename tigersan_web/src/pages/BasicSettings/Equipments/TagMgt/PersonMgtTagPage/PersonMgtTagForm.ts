import { ref } from 'vue'
import { FormItemConfig, Verify, FormConfig, FormModel, SubmitResult, ObjectHelper, DialogHelper, DialogMode, Colors, DialogState, loading, Texts } from '@/0_tigersan_ui/tigerui'
import { PersonMgtTagModel, personMgtTagTable } from './PersonMgtTagTable'

export class PersonMgtTagForm {
    /** “IMEI”项目配置 */
    readonly configIMEI: FormItemConfig<PersonMgtTagModel, string> = {
        _propName: 'IMEI',
        PropText: 'IMEI',
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.IMEI)
        }
    }

    /** “设备名称”项目配置 */
    readonly configEqpName: FormItemConfig<PersonMgtTagModel, string> = {
        _propName: 'EqpName',
        PropText: Texts.EqpName,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.EqpName)
        }
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => {
        return new PersonMgtTagModel()
    }

    /** “人员管理标签”表单配置 */
    readonly configPersonMgtTagForm: FormConfig<PersonMgtTagModel> = {
        _getSource: this.AddGetSource,
        _itemConfigs: [
            this.configEqpName,
            this.configIMEI,
        ]
    }

    /** “人员管理标签”表单模型 */
    readonly personMgtTagForm = new FormModel<PersonMgtTagModel>(this.configPersonMgtTagForm)

    /** 查 */
    readonly Refresh = () => {
        try {
            loading.IsShow.value = true

            personMgtTagTable.Refresh()
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = () => {
        this.personMgtTagForm.Title.value = '新增标签'

        this.personMgtTagForm._getSource = this.AddGetSource

        this.personMgtTagForm._onSubmit = source => {
            personMgtTagTable.RowDatas.push(source)
            personMgtTagTable.Refresh()

            return new SubmitResult(Texts.AddedSuccessfully.value)
        }

        this.personMgtTagForm.Show()
    }

    /** 改 */
    readonly Edit = () => {
        this.personMgtTagForm.Title.value = '修改标签'

        let iRow = 0

        this.personMgtTagForm._getSource = () => {
            const rowData = personMgtTagTable.SelectedRowDatas.value[0]
            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new PersonMgtTagModel()
            }

            iRow = personMgtTagTable.RowDatas.indexOf(rowData)
            return ObjectHelper.ShallowCopy(rowData)
        }

        this.personMgtTagForm._onSubmit = source => {
            personMgtTagTable.RowDatas[iRow] = source
            return new SubmitResult(Texts.EditedSuccessfully.value)
        }

        this.personMgtTagForm.Show()
    }

    /** 删 */
    readonly Delete = () => {
        DialogHelper.Show(
            Texts.Confirm,
            Texts.DeleteConfirm.value,
            undefined,
            this.DeleteRowData,
            DialogMode.YesOrNo,
            Colors.Warning)
    }

    readonly DeleteRowData = (state: DialogState) => {
        if (state != DialogState.Yes) return

        const rowData = personMgtTagTable.SelectedRowDatas.value[0]
        if (!rowData) {
            console.warn('The rowData is undefined!')
            return
        }

        personMgtTagTable.DeleteRowData(rowData)

        DialogHelper.Success(Texts.DeletedSuccessfully.value)
    }
}