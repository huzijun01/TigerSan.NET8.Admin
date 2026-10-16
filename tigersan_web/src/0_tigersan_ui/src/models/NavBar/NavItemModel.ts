import { computed, ref } from "vue"
import { nanoid } from 'nanoid'
import { Icons } from "../../base"
import { Texts } from "../../texts"
import { NavBarModel } from './NavBarModel'
import { LanguageBehavior } from "../../helpers"
import { AuthorityVerify } from "../Authority/AuthorityVerify"

export class NavItemModel {
    //#region 【Fields】
    /** ID */
    readonly _id = nanoid()
    /** 权限 */
    _authority?: AuthorityVerify
    //#endregion 【Fields】

    //#region 【Props】
    /** 键（用于权限） */
    readonly Key = ref('')
    /** 图标 */
    readonly Icon = ref(Icons.Folder_Linear)
    /** “标题”文本 */
    readonly Title
    /** “标题”显示文本 */
    readonly ShowTitle
    /** 是否“显示” */
    readonly IsShow = ref(true)
    /** 所属“导航栏”模型 */
    readonly NavBarModel: NavBarModel
    /** 是否“允许显示” */
    readonly IsAllowShow = computed(() => this.IsShow.value && this.IsHasAuthority.value)
    /** 是否“具有权限” */
    readonly IsHasAuthority = computed(() => !this._authority || this._authority.IsEnable.value)
    //#endregion 【Props】

    constructor(navModel: NavBarModel) {
        this.NavBarModel = navModel

        const lbTitle = new LanguageBehavior(Texts.Null)
        this.Title = lbTitle.Text
        this.ShowTitle = lbTitle.ShowText
    }
}