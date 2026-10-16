import { ref } from 'vue'
import { TextBoxModel, PasswordModel, FormItemConfig, Verify, ApiResultCode, SubmitResult, FormResult, ObjectHelper, authorityHelper, router, FormConfig, FormModel, DialogState, DialogHelper, DialogMode, Colors, TokenHelper, loading, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { useUserInfo } from '@/stores'
import { axiosHelper } from "@/helpers"
import { navData } from '@/navs/navModel'
import { UserInfo, UserHelper } from '@/models'

export class LoginFormModel {
    //#region 【Fields】
    private id = ''

    // 组件模型:
    readonly uname = new TextBoxModel()

    readonly pwd = new PasswordModel()

    readonly captcha = new TextBoxModel()

    // 配置:
    /** “用户名”项目配置 */
    readonly configUsername: FormItemConfig<UserInfo, string> = {
        _propName: 'username',
        PropText: '',
        IsEquired: true,
        Target: this.uname.Value,
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.username)
        }
    }

    /** “密码”项目配置 */
    readonly configPassword: FormItemConfig<UserInfo, string> = {
        _propName: 'password',
        PropText: '',
        IsEquired: true,
        Target: this.pwd.Value,
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.password)
        }
    }

    /** “验证码”项目配置 */
    readonly configCaptcha: FormItemConfig<UserInfo, string> = {
        _propName: 'captcha',
        PropText: '',
        IsEquired: true,
        Target: this.captcha.Value,
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.captcha)
        }
    }

    /** “增”源数据获取方法 */
    readonly GetSource = () => {
        if (true) {
            return new UserInfo()
        } else {
            return new UserInfo('admin', 'admin123', '')
        }
    }

    /** 提交 */
    readonly OnSubmitAsync = async (source: object) => {
        const userInfoForm = source as UserInfo
        // 发送“登录请求”:
        var res = await UserHelper.LoginAsync(this.id, userInfoForm.captcha, userInfoForm.username, userInfoForm.password)
        if (res.code === ApiResultCode.InvalidCaptcha) {
            this.UpdateCaptcha()
            this.configCaptcha.ItemModel?.SetError(Texts.IncorrectCaptcha.value)
            return new SubmitResult()
        }
        else if (!res.data) {
            this.UpdateCaptcha()
            return new SubmitResult(res.message, FormResult.Error)
        }

        this.GoToHome(res.data as object)

        return new SubmitResult('登录成功')
    }

    /** “登录”表单配置 */
    readonly configLoginForm: FormConfig<UserInfo> = {
        _getSource: this.GetSource,
        _onSubmitAsync: this.OnSubmitAsync,
        _itemConfigs: [
            this.configUsername,
            this.configPassword,
            this.configCaptcha,
        ]
    }

    /** “登录”表单模型 */
    readonly form = new FormModel(this.configLoginForm)
    //#endregion 【Fields】

    //#region 【Props】
    readonly CaptchaUrl = ref<string | undefined>()
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this.form._isShowSuccessResult = false
        this.uname.Width.value = "100%"
        this.uname.Placeholder.value = TextModel.Computed('Username/Phone/Email', '用户名/电话/邮箱')
        this.pwd.Width.value = "100%"
        this.pwd.Placeholder.value = Texts.Password
        this.captcha.Width.value = '100%'
        this.captcha.Placeholder.value = Texts.Captcha
        this.captcha._onEnter = () => this.OnSubmitAsync(this.form._source)
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 更新“验证码” */
    readonly UpdateCaptcha = async () => {
        try {
            loading.IsShow.value = true

            const res = await UserHelper.GetCaptcha()
            const data = res.data
            if (!data) {
                DialogHelper.Error(res.message)
                return
            }
            this.id = data.id

            if (this.CaptchaUrl.value) {
                URL.revokeObjectURL(this.CaptchaUrl.value)
            }
            this.CaptchaUrl.value = `data:image/png;base64,${data.captcha}`
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 登出 */
    readonly Logout = () => {
        DialogHelper.Show(
            Texts.Confirm,
            Texts.LogoutConfirm.value,
            undefined,
            this.FnLogout,
            DialogMode.YesOrNo,
            Colors.Warning)
    }

    readonly FnLogout = async (state: DialogState) => {
        if (state != DialogState.Yes) return

        try {
            loading.IsShow.value = true

            const userInfo = useUserInfo()

            // 发送“登出请求”:
            var res = await UserHelper.LogoutAsync(userInfo.username)
            if (res.code != ApiResultCode.Success) {
                DialogHelper.Error(res.message)
                return
            }

            TokenHelper.Save()
            ObjectHelper.ShallowSet(new UserInfo(), userInfo)
            router.GoTo('/')
        } finally {
            loading.IsShow.value = false
        }
    }

    /** Token登录 */
    readonly LoginByToken = async () => {
        const token = TokenHelper.Get()
        if (!token) return

        try {
            loading.IsShow.value = true

            // 发送“登出请求”:
            var res = await UserHelper.LoginByTokenAsync(token)
            if (!res.data) {
                TokenHelper.Save()
                DialogHelper.Error(res.message)
                return
            }

            this.GoToHome(res.data)
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 进入主页 */
    readonly GoToHome = (data: object) => {
        const userInfo = useUserInfo()

        // 保存“用户信息”:
        ObjectHelper.ShallowSet(data as object, userInfo)

        // 添加“权限”:
        if (userInfo.isAdmin && userInfo.isRoot) {
            authorityHelper.AddAllAuthorities()
        } else {
            authorityHelper.SetAuthorities(userInfo.authorities)
        }

        // 设置Token:
        axiosHelper.SetAuthorization(userInfo.token)
        TokenHelper.Save(userInfo.token)

        // 初始化“导航栏”:
        navData.InitBasicSettings()
        // 跳转到“主页”:
        router.GoTo('Home')
    }
    //#endregion 【Functions】
}

export const loginFormModel = new LoginFormModel()