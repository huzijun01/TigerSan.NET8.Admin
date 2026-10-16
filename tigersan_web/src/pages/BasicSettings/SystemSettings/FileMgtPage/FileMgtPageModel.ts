import { computed, ref } from 'vue'
import { TableModel, ItemType, loading, ArrayHelper, ObjectHelper, DialogHelper, DialogMode, Colors, DialogState, Texts, FileType, ApiResult, StringHelper, PathHelper, UploadBase } from '@/0_tigersan_ui/tigerui'
import { fileModelHelper, FileInfo } from '@/models'

export class FileMgtPageModel extends UploadBase {
    //#region 【Fields】
    /** 表格模型 */
    readonly table = new TableModel<FileInfo>([
        {
            _propName: 'isDir',
            Text: Texts.Type,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: FileType.GetString,
        },
        {
            _propName: 'name',
            Text: Texts.Name,
            IsReadonly: true,
            Type: ItemType.Link,
            _onItemClickAsync: async item => {
                const data = item._rowModel._rowData
                if (data.isDir) {
                    this.SubPath.value = PathHelper.Combine(this.SubPath.value, data.name)
                    this.Refresh()
                } else {
                    const res = await fileModelHelper.DownloadFile(data.name, this.SubPath.value)
                    ApiResult.ShowResult(res, Texts.DownloadSuccessfully.value)
                }
            }
        },
        {
            _propName: 'createTime',
            Text: Texts.CreateTime,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: source => ObjectHelper.GetDateString(source.createTime)
        },
        {
            _propName: 'editTime',
            Text: Texts.EditTime,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
            _getString: source => ObjectHelper.GetDateString(source.editTime)
        },
        {
            _propName: 'size',
            Text: Texts.Size,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
    ])
    //#endregion 【Fields】

    //#region 【Props】
    /** 总数 */
    readonly Count = ref(0)
    /** 子路径 */
    readonly SubPath = ref('')

    //#region [computed]
    /** 是否“允许重命名” */
    readonly IsAllowRename = computed(() => !this.IsProcessing.value && this.table.IsOnlySelected.value)
    /** 是否“允许删除” */
    readonly IsAllowDelete = computed(() => !this.IsProcessing.value && this.table.IsSelected.value)
    /** 是否“允许返回” */
    readonly IsAllowGoBack = computed(() => !this.IsProcessing.value && StringHelper.IsNotEmpty(this.SubPath.value))
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        super(files => {
            const file = files[0]
            if (file) this.UploadAsync(file)
        })

        this.table.IsAllowMultiSelect.value = true
        this.table._onSlotChange = this.Refresh
        this.table._initItem = item => {
            FileType.InitItemModel(item)
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        loading.IsShow.value = true

        try {
            this.Count.value = 0
            const res = await fileModelHelper.GetPathList({ subPath: this.SubPath.value })
            const arr = res.data
            if (!arr) {
                this.SubPath.value = ''
                return
            }

            this.Count.value = arr.length
            ArrayHelper.Set(this.table.RowDatas, arr)
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 返回 */
    readonly Back = () => {
        this.SubPath.value = PathHelper.GetParent(this.SubPath.value)
        this.Refresh()
    }

    /** 新建文件夹 */
    readonly CreateDir = async () => {
        const name = prompt(Texts.Name.value)?.trim()
        if (!name) return

        const res = await fileModelHelper.CreateDir(name, this.SubPath.value)
        this.Refresh()
        ApiResult.ShowResult(res, Texts.AddedSuccessfully.value)
    }

    /** 上传（异步） */
    readonly UploadAsync = async (file: File) => {
        this.table.IsLoading.value = true

        try {
            this.Controller.value = new AbortController()
            const res = await fileModelHelper.Upload({
                file,
                subPath: this.SubPath.value,
                controller: this.Controller.value,
                onProgress: p => this.Percent.value = p
            })
            this.Refresh()
            ApiResult.ShowResult(res, Texts.UploadedSuccessfully.value)
        } finally {
            this.Percent.value = 0
            this.Controller.value = undefined
            this.table.IsLoading.value = false
        }
    }

    /** 停止 */
    readonly Stop = () => {
        this.Controller.value?.abort()
    }

    /** 重命名 */
    readonly Rename = async () => {
        const oldName = this.table.SelectedRowDatas.value[0]?.name
        if (!oldName) return

        const newName = prompt(Texts.Name.value, oldName)?.trim()
        if (!newName || oldName === newName) return

        const res = await fileModelHelper.Rename(oldName, newName, this.SubPath.value)
        this.Refresh()
        ApiResult.ShowResult(res, Texts.AddedSuccessfully.value)
    }

    /** 删 */
    readonly Delete = async () => {
        DialogHelper.Show(
            Texts.Confirm,
            Texts.DeleteConfirm.value,
            undefined,
            this.DeleteRowData,
            DialogMode.YesOrNo,
            Colors.Warning)
    }

    readonly DeleteRowData = async (state: DialogState) => {
        if (state != DialogState.Yes) return

        const names = this.table.SelectedRowDatas.value.map(i => i.name)
        if (names.length < 1) return

        const res = await fileModelHelper.Delete(names, this.SubPath.value, true)
        this.Refresh()
        ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
    }
    //#endregion 【Functions】
}
