import { reactive, ref } from 'vue'
import { Verify, ObjectHelper, FormModel, FormConfig, FormItemConfig, PasswordModel, Texts, GetSubmitResult, loading, TextModel } from '@/0_tigersan_ui/tigerui'
import { personHelper, UserInfo } from '@/models'
import { useUserInfo } from '@/stores'

export class UserInfoForm {
    isPasswordChanged = false
    readonly person = reactive(new UserInfo())
    /** 密码框 */
    readonly password = new PasswordModel()

    /** “公司”项目配置 */
    readonly configCompany: FormItemConfig<UserInfo, string> = {
        _propName: 'companyIdName',
        PropText: Texts.Company,
        IsEquired: false,
        Target: ref(),
        _getValue: source => source.companyIdName.name,
        _setValue: (source, propName, value) => source.companyIdName.name = value ?? ''
    }

    /** “部门”项目配置 */
    readonly configDepartment: FormItemConfig<UserInfo, string> = {
        _propName: 'departmentIdName',
        PropText: Texts.Department,
        IsEquired: false,
        Target: ref(),
        _getValue: source => source.departmentIdName.name,
        _setValue: (source, propName, value) => source.departmentIdName.name = value ?? ''
    }

    /** “角色”项目配置 */
    readonly configRole: FormItemConfig<UserInfo, string> = {
        _propName: 'roleIdName',
        PropText: Texts.Role,
        IsEquired: true,
        Target: ref(),
        _getValue: source => source.roleIdName.name,
        _setValue: (source, propName, value) => source.roleIdName.name = value ?? ''
    }

    /** “用户名”项目配置 */
    readonly configUsername: FormItemConfig<UserInfo, string> = {
        _propName: 'username',
        PropText: Texts.Username,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidUsername(source.username)
    }

    /** “昵称”项目配置 */
    readonly configTagId: FormItemConfig<UserInfo, string> = {
        _propName: 'nickname',
        PropText: Texts.Nickname,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidNickname(source.nickname)
    }

    /** “密码”项目配置 */
    readonly configPassword: FormItemConfig<UserInfo, string> = {
        _propName: 'password',
        PropText: Texts.Password,
        IsEquired: true,
        Target: this.password.Value,
        _onChange: () => this.isPasswordChanged = true,
        _isVerifyOk: (source, isEdit) => {
            if (isEdit && !this.isPasswordChanged) return Verify.OK()
            return Verify.IsValidWeekPassword(source.password)
        }
    }

    /** “电话”项目配置 */
    readonly configPhone: FormItemConfig<UserInfo, string> = {
        _propName: 'phone',
        PropText: Texts.Phone,
        IsEquired: false,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidPhoneNumber(source.phone)
    }

    /** “邮箱”项目配置 */
    readonly configMail: FormItemConfig<UserInfo, string> = {
        _propName: 'mail',
        PropText: Texts.Mail,
        IsEquired: false,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidEmail(source.mail)
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new UserInfo()

    /** “用户信息”表单配置 */
    readonly configPersonMgtForm: FormConfig<UserInfo> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            this.isPasswordChanged = false
            this.password.IsShowValue.value = false
        },
        _itemConfigs: [
            this.configCompany,
            this.configDepartment,
            this.configRole,
            this.configUsername,
            this.configTagId,
            this.configPassword,
            this.configPhone,
            this.configMail,
        ]
    }

    /** “用户信息”表单模型 */
    readonly userInfoForm = new FormModel(this.configPersonMgtForm)

    //#region 【Ctor】
    constructor() {
        this.password.Width.value = '108px'
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 改 */
    readonly Edit = async () => {
        this.userInfoForm.Title.value = TextModel.GetText('Edit UserInfo', '修改用户信息')

        this.userInfoForm._getSource = () => {
            const userInfo = useUserInfo()
            ObjectHelper.ShallowSet(userInfo, this.person)
            return this.person
        }

        this.userInfoForm._onSubmitAsync = async source => {
            try {
                loading.IsShow.value = true

                const res = await personHelper.Edit(source)
                return GetSubmitResult(res, Texts.EditedSuccessfully.value)
            } finally {
                loading.IsShow.value = false
            }
        }

        this.userInfoForm.Show(true)
    }
    //#endregion 【Functions】
}