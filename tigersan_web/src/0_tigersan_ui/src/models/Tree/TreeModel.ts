import { nanoid } from "nanoid"
import { computed, ref, shallowRef, shallowReactive, type StyleValue, type ComputedRef } from "vue"
import { Texts } from "../../texts"
import type { NumberAction } from "../../types"
import { AuthorityVerify } from "../Authority/AuthorityVerify"
import { ArrayHelper, BigintHelper, ContentSizeBehavior, FolderBehavior, LanguageBehavior, type IRoot } from "../../helpers"

export type TreeNodeModelFunc<TData> = (node: TreeNodeModel<TData>) => any

/** “树节点”模型 */
export class TreeNodeModel<TData> extends ContentSizeBehavior {
    //#region 【Fields】
    /** 是否“自动更新”选中状态 */
    private _isAutoUpdate = true
    /** ID */
    readonly _id = nanoid()
    /** “目录”行为 */
    private _behavior: FolderBehavior<TreeModel<TData>, this>
    /** 权限 */
    _authority?: AuthorityVerify
    /** 分隔符 */
    _separator = '>'
    /** 所属树 */
    _tree: TreeModel<TData>
    /** 数据 */
    _data?: TData
    /** 父项 */
    _parent?: TreeNodeModel<TData>
    /** 配置（内部维护） */
    _config?: TreeNodeConfig<TData>
    /** 激活后 */
    _onActive?: TreeNodeModelFunc<TData>
    /** 失活后 */
    _onUnactive?: TreeNodeModelFunc<TData>
    /** 选中后 */
    _onChecked?: TreeNodeModelFunc<TData>
    //#endregion 【Fields】

    //#region 【Props】
    /** 子项高度 */
    readonly SubItemsHeight = ref(0)
    /** 是否“允许显示” */
    readonly IsAllowShow = computed(() => this.IsShow.value && this.IsHasAuthority.value)
    /** 是否“具有权限” */
    readonly IsHasAuthority = computed(() => !this._authority || this._authority.IsEnable.value)
    /** 键（用于权限） */
    readonly Key = ref('')
    /** 文本 */
    readonly Text
    /** 显示文本 */
    readonly ShowText
    /** 颜色 */
    readonly Color = ref('')
    /** 是否显示 */
    readonly IsShow = ref(true)
    /** 是否“选中” */
    readonly IsChecked = ref(false)
    /** 是否“不确定” */
    readonly IsIndeterminate = ref(false)
    /** “子项”集合 */
    readonly Childs = shallowReactive<TreeNodeModel<TData>[]>([])
    /** “目录”集合 */
    get FolderModels(): TreeNodeModel<TData>[] {
        return this.Childs
    }

    //#region [computed]
    /** 是否“激活” */
    readonly IsActive = computed(() => {
        return this._tree.ActiveNode.value?._id === this._id
    })

    /** 路径 */
    readonly Path = computed(() => {
        this._tree.NodeArray
        let path = ''

        this.UpTraverse(node => {
            path = path === '' ? node.Key.value : `${node.Key.value}${this._separator}${path}`
        })

        return path
    })

    /** 根类 */
    readonly RootClass = computed(() => {
        return {
            open: this.IsOpen.value,
            active: this.IsActive.value,
            checked: this.IsChecked.value,
        }
    })

    /** 颜色样式 */
    readonly ColorStyle = computed((): StyleValue => {
        return {
            color: this.Color.value,
        }
    })

    /** 是否“有子项” */
    readonly IsHaveChild = computed(() => {
        return this.Childs.length > 0
    })

    /** “内容容器”样式对象 
     * （需绑定到“内容容器”上） */
    readonly ContentPanelStyle = computed((): StyleValue => {
        return {
            height: `${this.SubItemsHeight.value}px`,
            maxHeight: `${this.ContentMaxHeight.value}px`,
            overflow: this.IsOpen.value ? 'auto' : 'hidden',
            opacity: this.IsOpen.value ? 1 : 0,
            transition: 'var(--Global-Transition)'
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        tree: TreeModel<TData>,
        data?: TData,
        parent?: TreeNodeModel<TData>,
        childs?: TreeNodeModel<TData>[]) {
        super()
        this._tree = tree
        this._data = data
        this._parent = parent
        this._behavior = new FolderBehavior(this._tree, this)
        if (childs) this.Childs.push(...childs)

        const lbText = new LanguageBehavior(Texts.Null)
        this.Text = lbText.Text
        this.ShowText = lbText.ShowText
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    //#region [static]
    /** 遍历集合 */
    static TraverseRange<T>(nodes: TreeNodeModel<T>[], callback: TreeNodeModelFunc<T>) {
        nodes.forEach(node => node.Traverse(callback))
    }

    /** 获取数组（无嵌套） */
    static GetArrayRange<T>(nodes: TreeNodeModel<T>[]) {
        const arr: TreeNodeModel<T>[] = []
        nodes.forEach(node => {
            arr.push(...node.GetArray())
        })
        return arr
    }
    //#endregion [static]

    /** 更新“祖先节点”选中状态 */
    readonly UpdateParentNodesIsChecked = () => {
        if (!this._isAutoUpdate) return

        this._isAutoUpdate = false

        this.UpTraverse(node => {
            if (this._id === node._id) return
            node.IsChecked.value = node.Childs.every(n => n.IsChecked.value)
            node.IsIndeterminate.value = node.Childs.some(n => n.IsChecked.value || n.IsIndeterminate.value) && !node.IsChecked.value
        })

        this._isAutoUpdate = true
    }

    /** 更新“后代节点”选中状态 */
    readonly UpdateSubNodesIsChecked = () => {
        if (!this._isAutoUpdate) return

        this._isAutoUpdate = false

        this.Traverse(node => {
            if (this._id === node._id) return
            node.IsChecked.value = this.IsChecked.value
            node.IsIndeterminate.value = false
        })

        this._isAutoUpdate = true
    }

    /** 遍历 */
    readonly Traverse = (callback: TreeNodeModelFunc<TData>) => {
        callback(this)

        if (this.Childs) {
            this.Childs.forEach(child => child.Traverse(callback))
        }
    }

    /** 向上遍历 */
    readonly UpTraverse = (callback: TreeNodeModelFunc<TData>) => {
        callback(this)

        if (this._parent) {
            this._parent.UpTraverse(callback)
        }
    }

    /** 获取数组（无嵌套） */
    readonly GetArray = (): TreeNodeModel<TData>[] => {
        const arr: TreeNodeModel<TData>[] = []
        this.Traverse(node => { arr.push(node) })
        return arr
    }

    /** 点击后 */
    readonly OnClick = () => {
        this._tree.OnClickInternal(this)
    }

    /** 点击箭头后 */
    readonly OnClickArrow = () => {
        if (this.IsHaveChild.value) {
            this.IsOpen.value = !this.IsOpen.value
        }

        this._tree.UpdateHeight()
    }

    /** 改变后 */
    readonly OnChange = () => {
        if (this.IsChecked.value) {
            this._onChecked?.(this)
            this._tree._onChecked?.(this)
        }

        this.UpdateParentNodesIsChecked()
        this.UpdateSubNodesIsChecked()
    }

    /** 更新“高度” */
    readonly UpdateHeight = () => {
        this._behavior.UpdateHeight()
    }

    /** 更新“旧状态” */
    readonly UpdateOldState = () => {
        this._behavior.UpdateOldState()
    }
    //#endregion 【Functions】
}

/** “树节点”配置 */
export class TreeNodeConfig<TData> {
    // Fields:
    /** 数据 */
    _data?: TData
    /** 权限 */
    _authority?: AuthorityVerify
    /** 激活后 */
    _onActive?: TreeNodeModelFunc<TData>
    /** 选中后 */
    _onChecked?: TreeNodeModelFunc<TData>
    /** 失活后 */
    _onUnactive?: TreeNodeModelFunc<TData>

    // Properties:
    /** 键（用于权限） */
    Key?: string
    /** 文本 */
    Text?: string | ComputedRef<string>
    /** 颜色 */
    Color?: string
    /** 是否显示 */
    IsShow?: boolean
    /** 是否“激活” */
    IsActive?: boolean
    /** 是否“选中” */
    IsChecked?: boolean
    /** “子项”集合 */
    Childs?: TreeNodeConfig<TData>[]
}

/** “树”模型 */
export class TreeModel<TData> implements IRoot {
    //#region 【Fields】
    /** 是否“默认激活首个” */
    _isActiveFirst = false
    /** 是否“允许失活” */
    _isAllowUnactive = true
    /** 获取“文件夹”高度
     * （Tree内部会自动添加回调） */
    _getFolderHeight?: NumberAction
    /** “配置”集合 */
    _configs: TreeNodeConfig<TData>[] = []
    /** 默认“数据” */
    _defaultData?: TData
    /** 默认“选中状态” */
    _defaultIsChecked: boolean
    /** 初始化后 */
    _onInit?: TreeNodeModelFunc<TData>
    /** 激活后 */
    _onActive?: TreeNodeModelFunc<TData>
    /** “激活状态”改变后 */
    _onActiveChange?: (node: TreeNodeModel<TData>, isActive: boolean) => any
    /** 选中后 */
    _onChecked?: TreeNodeModelFunc<TData>
    /** 失活后 */
    _onUnactive?: TreeNodeModelFunc<TData>
    /** 初始化后 */
    _onInited?: Function
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“显示复选框” */
    readonly IsShowCheckbox = ref(true)
    /** 激活节点 */
    readonly ActiveNode = shallowRef<TreeNodeModel<TData> | undefined>()
    /** “根文件夹”模型 */
    readonly RootNode = new TreeNodeModel<TData>(this)

    //#region [computed]
    /** 是否“已激活” */
    readonly IsActive = computed(() => this.ActiveNode.value != undefined)
    /** “节点”数组（无嵌套） */
    readonly NodeArray = computed(() => TreeNodeModel.GetArrayRange<TData>(this.RootNode.Childs))
    /** “选中节点”数组（无嵌套） */
    readonly CheckedNodeArray = computed(() => this.NodeArray.value.filter(n => n.IsChecked.value))
    /** “激活节点”的数据 */
    readonly ActiveData = computed(() => this.ActiveNode.value?._data)
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        configs?: TreeNodeConfig<TData>[],
        defaultData?: TData,
        defaultIsChecked: boolean = false) {
        this._defaultData = defaultData
        this._defaultIsChecked = defaultIsChecked
        this.Init(configs)
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 获取“选中节点及其子节点”数组（无嵌套） */
    readonly GetCheckedNodeArray = (): TreeNodeModel<TData>[] => {
        const activeNode = this.ActiveNode.value
        if (!activeNode || !activeNode._config) return []
        const tree = new TreeModel([activeNode._config])
        return tree.NodeArray.value
    }

    /** 点击后（内部方法） */
    readonly OnClickInternal = (node: TreeNodeModel<TData>) => {
        if (node.IsActive.value) {
            if (!this._isAllowUnactive) return
            this.ActiveNode.value = undefined
            this._onUnactive?.(node)
            node._onUnactive?.(node)
            this._onActiveChange?.(node, false)
        } else {
            this.ActiveNode.value = node
            this._onActive?.(node)
            node._onActive?.(node)
            this._onActiveChange?.(node, true)
        }
    }

    /** 清空 */
    readonly Clear = () => {
        this.RootNode.Childs.splice(0)
    }

    /** 初始化 */
    readonly Init = (
        configs?: TreeNodeConfig<TData>[],
        defaultData?: TData,
        defaultIsChecked: boolean = false) => {
        this._defaultData = defaultData
        this._defaultIsChecked = defaultIsChecked

        if (configs) this._configs = configs

        try {
            this.Clear()
            this.ActiveNode.value = undefined

            if (!this._configs) return

            this._configs.forEach(config => {
                const node = GetNodeModel(this, config)
                this.RootNode.Childs.push(node)
            })

            this.NodeArray.value.forEach(node => {
                if (!(node._config && node._config._data != undefined)) {
                    node._data = this._defaultData
                }

                if (!(node._config && node._config.IsChecked != undefined)) {
                    node.IsChecked.value = this._defaultIsChecked
                }

                this._onInit?.(node)
            })

            if (this._isActiveFirst && !this.ActiveNode.value) this.ActiveFirst()
        } finally {
            this._onInited?.()
            this.UpdateHeight()
        }
    }

    /** 激活首个 */
    readonly ActiveFirst = () => {
        if (this.RootNode.Childs.length < 1) return
        this.ActiveNode.value = this.RootNode.Childs[0]
    }

    /** 更新“状态” */
    readonly UpdateState = () => {
        const ends = this.NodeArray.value.filter(n => n.Childs.length < 1)
        ends.forEach(n => n.UpdateParentNodesIsChecked())

        this.NodeArray.value.forEach(node => {
            this._onInit?.(node)
        })
    }

    /** 设置“激活节点” */
    readonly SetActiveNode = (key: string) => {
        const node = this.NodeArray.value.find(n => n.Key.value === key)
        if (!node) return
        this.ActiveNode.value = node
    }

    /** 获取“数据”集合 */
    readonly GetDatas = (): TData[] => {
        return this.NodeArray.value.map(n => (n._data as TData))
    }

    /** 更新“高度” */
    readonly UpdateHeight = () => {
        FolderBehavior.RecursivelyOperateSubItems(this.RootNode, folderModel => {
            folderModel.UpdateHeight()
        })
    }
    //#endregion 【Functions】
}

/** 获取“节点模型” */
function GetNodeModel<TData>(tree: TreeModel<TData>, config: TreeNodeConfig<TData>, parent?: TreeNodeModel<TData>): TreeNodeModel<TData> {
    const node = new TreeNodeModel<TData>(tree, config._data, parent)
    node._config = config
    InitNodeModel(config, node)

    if (config.Childs) {
        config.Childs.forEach(childConfig => {
            node.Childs.push(GetNodeModel(tree, childConfig, node))
        })
    }

    return node
}

/** 初始化“节点模型” */
function InitNodeModel<TData>(config: TreeNodeConfig<TData>, model: TreeNodeModel<TData>) {
    // Fields:
    if (config._data != undefined) model._data = config._data
    if (config._authority != undefined) model._authority = config._authority
    if (config._onActive != undefined) model._onActive = config._onActive
    if (config._onChecked != undefined) model._onChecked = config._onChecked
    if (config._onUnactive != undefined) model._onUnactive = config._onUnactive

    // Properties:
    if (config.Key != undefined) model.Key.value = config.Key
    if (config.Text != undefined) model.Text.value = config.Text
    if (config.Color != undefined) model.Color.value = config.Color
    if (config.IsShow != undefined) model.IsShow.value = config.IsShow
    if (config.IsChecked != undefined) model.IsChecked.value = config.IsChecked
}

/** “树”助手 */
export class TreeHelper {
    /** “项目数组”转“树配置” */
    static Array2Tree<T extends object>(
        items: T[],
        getText: (item: T) => string | ComputedRef<string>,
        getIndex: (item: T) => number | bigint | string,
        getParent: (item: T) => number | bigint | string | undefined,
        getKey?: (item: T) => string): TreeNodeConfig<T>[] {

        /** “节点”数组 */
        function GetNode(item: T): TreeNodeConfig<T> {
            const node = new TreeNodeConfig<T>()
            node._data = item
            node.Key = getKey?.(item)
            node.Text = getText(item)
            return node
        }

        /** “节点”数组 */
        const nodes: TreeNodeConfig<T>[] = []
        /** “节点”数组（无嵌套） */
        const nodeArray: TreeNodeConfig<T>[] = []

        /** “根项目”数组 */
        let rootItems = items.filter(i => !getParent(i))
        /** “剩余项目”数组 */
        const remainingItems = items.filter(i => getParent(i))
        /** “新根项目”数组 */
        const newRootItems: T[] = []

        // 添加“根项目”:
        rootItems.forEach(rootItem => {
            /** 根节点 */
            const rootNode = GetNode(rootItem)
            rootNode.Childs = []
            nodes.push(rootNode)
            nodeArray.push(rootNode)
        })

        // 添加“后代项目”:
        while (rootItems.length > 0) {
            newRootItems.splice(0)

            // 添加“根项目”:
            rootItems.forEach(rootItem => {
                /** 根节点 */
                const rootNode = nodeArray.find(n => n._data != undefined && BigintHelper.IsEqualAndNotUndefined(getIndex(n._data), getIndex(rootItem)))
                if (!rootNode) {
                    console.warn('The rootNode is undefined!')
                    return
                }

                /** “孙项目”数组 */
                const subItems = remainingItems.filter(i => BigintHelper.IsEqualAndNotUndefined(getParent(i), getIndex(rootItem)))
                newRootItems.push(...subItems)

                // 添加“根节点”:
                subItems.forEach(subItem => {
                    // 添加“孙节点”:
                    const subNode = GetNode(subItem)
                    if (!rootNode.Childs) {
                        rootNode.Childs = []
                    }
                    rootNode.Childs.push(subNode)
                    nodeArray.push(subNode)

                    // 删除“孙项目”:
                    ArrayHelper.Delete(remainingItems, subItem)
                })
            })

            rootItems.splice(0)
            rootItems.push(...newRootItems)
        }

        if (remainingItems.length > 0) {
            console.warn('There are unused items!\r\n', remainingItems)
        }

        return nodes
    }
}