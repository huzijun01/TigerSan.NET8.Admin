import { ref, shallowReactive } from 'vue'
import { Colors } from '../../base'
import { NavBarModel } from '../NavBar/NavBarModel'
import { NavFolderModel } from '../NavBar/NavFolderModel'
import { NavButtonModel } from '../NavBar/NavButtonModel'
import { AuthorityVerify, PathIsReadonly } from './AuthorityVerify'
import { TreeHelper, TreeModel, TreeNodeConfig, TreeNodeModel } from '../Tree/TreeModel'
import { FolderBehavior } from '../../helpers'

/** “权限”模型 */
export class AuthorityModel {
    role: bigint = 0n
    path = ''
    isReadonly = false
}

/** “权限节点”数据 */
export class AuthorityNodeData {
    item: NavButtonModel | NavFolderModel
    isReadonly: boolean
    constructor(item: NavButtonModel | NavFolderModel, isReadonly: boolean = false) {
        this.item = item
        this.isReadonly = isReadonly
    }
}

/** “权限助手”模型 */
export class AuthorityHelper {
    //#region 【Fields】
    static readonly _action = 'Authority'
    /** “权限”树模型 */
    readonly _tree = new TreeModel<AuthorityNodeData>()
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“只读” */
    readonly IsReadonly = ref(false)
    /** “权限”数组 */
    readonly Authorities = shallowReactive<PathIsReadonly[]>([])
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this._tree._onInit = node => {
            if (node._data === undefined) {
                console.warn('The _data is undefined!')
                return
            }
            if (node._data.isReadonly) {
                node.Color.value = Colors.Warning
            }
        }
        this._tree._onActive = node => {
            if (node._data === undefined) {
                console.warn('The _data is undefined!')
                return
            }
            this.IsReadonly.value = node._data.isReadonly
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    //#region [private]
    /** 设置“是否只读” */
    private readonly SetIsReadonly = (node: TreeNodeModel<AuthorityNodeData>, isReadonly: boolean) => {
        if (node._data === undefined) {
            console.warn('The _data is undefined!')
            return
        }
        node._data.isReadonly = this.IsReadonly.value
        node.Color.value = isReadonly ? Colors.Warning : ''
    }
    //#endregion [private]

    //#region [static]
    /** “导航栏”转“树配置” */
    static Nav2Tree(rootFolder: NavFolderModel): TreeNodeConfig<AuthorityNodeData>[] {
        let datas: AuthorityNodeData[] = []
        const AddData = (i: NavButtonModel | NavFolderModel) => datas.push(new AuthorityNodeData(i))
        AddData(rootFolder)
        FolderBehavior.RecursivelyOperateSubItems(rootFolder, AddData, AddData)

        return TreeHelper.Array2Tree<AuthorityNodeData>(
            datas,
            item => item.item.Title.value,
            item => item.item._id,
            item => item.item.ParentFolderModel?._id,
            item => item.item.Key.value)
    }
    //#endregion [static]

    /** 添加“导航栏”到“树配置” */
    readonly AddNav2TreeConfigs = (nav: NavBarModel) => {
        var configs = AuthorityHelper.Nav2Tree(nav.RootFolder)
        const first = configs[0]
        if (!first) {
            console.warn('There are no items in the configs!')
            return
        }
        first.Text = nav.RootFolderTitle
        this._tree._configs.push(...configs)
    }

    /** 清除“树配置” */
    readonly ClearTreeConfigs = () => {
        this._tree._configs.splice(0)
    }

    /** 初始化“树模型” */
    readonly InitTree = (authorities?: AuthorityModel[]) => {
        this._tree.Init(undefined, undefined, true)

        if (authorities) {
            this._tree.NodeArray.value.forEach(node => {
                if (!node._data) {
                    console.warn('The _data is undefined!')
                    return
                }

                // 是否“选中”:
                const authority = authorities.find(a => node.Path.value === a.path)
                node.IsChecked.value = authority != undefined

                // 是否“只读”:
                if (authority) {
                    node._data.isReadonly = authority.isReadonly
                }
            })
        }

        // 权限路径:
        this._tree.NodeArray.value.forEach(node => {
            if (!node._data) {
                console.warn('The _data is undefined!')
                return
            }

            if (node._data.item._authority) node._data.item._authority.Path.value = node.Path.value
        })

        this._tree.UpdateState()
    }

    /** 获取“权限模型”集合 */
    readonly GetAuthorities = (): AuthorityModel[] => {
        const authorities: AuthorityModel[] = []

        this._tree.NodeArray.value.forEach(node => {
            if (!node.IsChecked.value && !node.IsIndeterminate.value) return

            const authority = new AuthorityModel()
            authority.path = node.Path.value

            if (node._data === undefined) {
                console.warn('The _data is undefined!')
                return
            }
            authority.isReadonly = node._data.isReadonly

            authorities.push(authority)
        })

        return authorities
    }

    /** 更新“是否只读” */
    readonly UpdateIsReadonlyRange = () => {
        const node = this._tree.ActiveNode.value
        if (node) {
            node.Traverse(n => this.SetIsReadonly(n, this.IsReadonly.value))
        }
    }

    /** 获取“权限验证” */
    readonly GetAuthority = (): AuthorityVerify => new AuthorityVerify(this.Authorities)

    /** 设置“权限”集合 */
    readonly SetAuthorities = (authorities: PathIsReadonly[]) => {
        authorityHelper.InitTree()
        this.Authorities.splice(0)
        this.Authorities.push(...authorities.map(a => new PathIsReadonly(a.path, a.isReadonly)))
    }

    /** 添加“所有权限” */
    readonly AddAllAuthorities = () => {
        authorityHelper.InitTree()
        const authorities = this._tree.NodeArray.value.map(n => new PathIsReadonly(n.Path.value, false))
        this.Authorities.splice(0)
        this.Authorities.push(...authorities)
    }
    //#endregion 【Functions】
}

/** “权限助手”实例 */
export const authorityHelper = new AuthorityHelper()
