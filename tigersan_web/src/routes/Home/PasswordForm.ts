import { reactive } from 'vue'
import { PasswordModel, FormItemConfig, Verify, FormConfig, FormModel, ObjectHelper, GetSubmitResult, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { useUserInfo } from '@/stores'
import { PasswordEditModel, UserHelper } from '@/models'

export class PasswordForm {
    readonly passwordEdit = reactive(new PasswordEditModel())

    /** 密码框 */
    readonly password = new PasswordModel()
    readonly oldPassword = new PasswordModel()
    readonly confirmPassword = new PasswordModel()

    /** “原始密码”项目配置 */
    readonly configOldPassword: FormItemConfig<PasswordEditModel, string> = {
        _propName: 'oldPassword',
        PropText: Texts.OldPassword,
        IsEquired: true,
        Target: this.oldPassword.Value,
        _isVerifyOk: (source, isEdit) => Verify.IsValidWeekPassword(source.oldPassword)
    }

    /** “新密码”项目配置 */
    readonly configPassword: FormItemConfig<PasswordEditModel, string> = {
        _propName: 'password',
        PropText: Texts.NewPassword,
        IsEquired: true,
        Target: this.password.Value,
        _isVerifyOk: (source, isEdit) => Verify.IsValidWeekPassword(source.password)
    }

    /** “确认密码”项目配置 */
    readonly configConfirmPassword: FormItemConfig<PasswordEditModel, string> = {
        _propName: 'confirmPassword',
        PropText: Texts.ConfirmPassword,
        IsEquired: true,
        Target: this.confirmPassword.Value,
        _isVerifyOk: (source, isEdit) => Verify.IsEqual(source.password, source.confirmPassword)
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new PasswordEditModel()

    /** “修改密码”表单配置 */
    readonly configPersonMgtForm: FormConfig<PasswordEditModel> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            this.password.IsShowValue.value = false
            this.oldPassword.IsShowValue.value = false
            this.confirmPassword.IsShowValue.value = false
        },
        _itemConfigs: [
            this.configPassword,
            this.configOldPassword,
            this.configConfirmPassword,
        ]
    }

    /** “修改密码”表单模型 */
    readonly passwordForm = new FormModel(this.configPersonMgtForm)

    /** 改 */
    readonly Edit = async () => {
        this.passwordForm.Title.value = TextModel.GetText('Edit UserInfo', '修改用户信息')

        this.passwordForm._getSource = () => {
            ObjectHelper.ShallowSet(new PasswordEditModel(), this.passwordEdit)
            this.passwordEdit.id = useUserInfo().id
            return this.passwordEdit
        }

        this.passwordForm._onSubmitAsync = async source => {
            const res = await UserHelper.EditPassword(source)
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.passwordForm.Show(true)
    }
}