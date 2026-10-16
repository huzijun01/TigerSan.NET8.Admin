import { nanoid } from 'nanoid'
import type { Property } from 'csstype'
import { computed, ref, shallowReactive, type StyleValue } from 'vue'
import { Texts } from '../../../texts'
import { UploadBase, FileTypes } from '../../UploadBase'
import { ImagePreviewModel } from '../../Dialog/ImagePreviewModel'
import { ApiResultCode, ApiResult } from '../../ApiResult'
import { Methods, ArrayHelper, AxiosBase, KeyValueModel } from '../../../helpers'

/** “图片”URL */
export type ImageUrl = { name: string, url: string, params?: KeyValueModel[] }
/** “图片”文件 */
export type ImageFile = { name: string, file: File }
/** “图片”配置 */
export type ImageConfig = { name: string, url?: string, params?: KeyValueModel[], file?: File }
/** “上传”方法 */
export type FnUpload = (file: File) => Promise<ApiResult<ImageUrl>>
/** “删除”方法 */
export type FnDelete = (config: ImageUrl) => Promise<ApiResult<any>>
/** “获取图片集合”方法 */
export type FnGetImages = () => Promise<ImageConfig[] | undefined>
/** “上传后”回调 */
export type UploadedHandler = (config: ImageUrl) => Promise<void>
/** “删除后”回调 */
export type DeletedHandler = (config: ImageConfig) => Promise<void>

/** “图片”模型 */
export class UploadImageModel {
    //#region 【Fields】
    /** ID */
    readonly _id = nanoid()
    /** 所属“上传器” */
    readonly _upload: UploadModel
    /** 配置 */
    _config: ImageConfig
    //#endregion 【Fields】

    //#region 【Props】
    /** Blob URL
     * （由“ImageModel”内部维护） */
    readonly BlobUrl = ref<string | undefined>()
    /** 是否“删除”
     * （由“ImageModel”内部维护） */
    readonly IsDelete = ref(false)
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(upload: UploadModel, config: ImageConfig) {
        this._upload = upload
        this._config = config
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 获取“默认模型” */
    static GetDefault() {
        return new UploadImageModel(UploadModel.GetDefault(), { name: '', url: '' })
    }

    /** 加载 */
    readonly Load = async () => {
        if (this.BlobUrl.value) {
            URL.revokeObjectURL(this.BlobUrl.value)
            this.BlobUrl.value = undefined
        }

        if (this._config.url) {
            try {
                const blob = await this._upload._axiosBase.GetBlob(this._config.url, this._config.params, this._upload._method)
                if (!blob) return
                this.BlobUrl.value = URL.createObjectURL(blob)
            } catch (error) {
                console.error(error)
            }
        } else if (this._config.file) {
            this.BlobUrl.value = URL.createObjectURL(this._config.file)
        } else {
            console.warn('The "url" and "file" cannot both be undefined!')
            ArrayHelper.Delete(this._upload.Images, this)
        }
    }

    /** 销毁 */
    readonly Dispose = () => {
        if (this.BlobUrl.value) {
            URL.revokeObjectURL(this.BlobUrl.value)
            this.BlobUrl.value = undefined
        }

        this._config.url = undefined
        this._config.params = undefined
        this._config.file = undefined
    }

    /** 打开 */
    readonly Open = () => {
        this._upload._preview.Show()
        this._upload._preview.Title.value = this._config.name
        this._upload._preview.Url.value = this.BlobUrl.value
    }

    /** 标记删除 */
    readonly MarkDelete = () => {
        if (this._config.file || !this.BlobUrl.value) {
            ArrayHelper.Delete(this._upload.Images, this)
        } else {
            this.IsDelete.value = true
        }
    }

    /** 上传 */
    readonly UploadAsync = async (): Promise<ApiResult<any>> => {
        if (!this._config.file) return ApiResult.Success('No need to upload!')
        if (this._upload.IsInoperable.value) return ApiResult.Error('Is inoperable!')

        this._upload.IsLoading.value = true

        try {
            this._upload.Controller.value = new AbortController()
            const res = await this._upload._upload(this._config.file)
            if (!res.data) {
                ApiResult.ShowResult(res, res.message, false)
                return res
            }

            this._config = res.data // 覆盖“配置”
            this.Load() // 重新加载
            this._upload._onUploaded?.(res.data)
            ApiResult.ShowResult(res, undefined, false)
            return ApiResult.Success(Texts.UploadedSuccessfully.value)
        } finally {
            this._upload.Percent.value = 0
            this._upload.Controller.value = undefined
            this._upload.IsLoading.value = false
        }
    }

    /** 删除 */
    readonly DeleteAsync = async (): Promise<ApiResult<any>> => {
        if (this._upload.IsInoperable.value) return ApiResult.Error('Is inoperable!')
        this._upload.IsLoading.value = true

        try {
            if (this._config.url && !this._config.file) {
                const res = await this._upload._delete({
                    name: this._config.name,
                    url: this._config.url,
                    params: this._config.params
                })
                if (res.code === ApiResultCode.Error) {
                    ApiResult.ShowResult(res)
                    return res
                } else {
                    ApiResult.ShowResult(res, undefined, false)
                }
            }
            await this._upload._onDeleted?.(this._config)
            ArrayHelper.Delete(this._upload.Images, this)
            return ApiResult.Success(Texts.DeletedSuccessfully.value)
        } finally {
            this._upload.IsLoading.value = false
        }
    }
    //#endregion 【Functions】
}

/** “上传器”模型 */
export class UploadModel extends UploadBase {
    //#region 【Fields】
    /** 图片预览
     * （由“UploadModel”内部维护） */
    readonly _preview = new ImagePreviewModel()
    /** “Axios基类”实例 */
    readonly _axiosBase: AxiosBase
    /** 是否“自动加载” */
    _isAutoLoad = true
    /** “获取图片”请求方法 */
    _method = Methods.Get
    /** “上传”方法 */
    _upload: FnUpload
    /** “删除”方法 */
    _delete: FnDelete
    /** “获取图片集合”方法 */
    _getImages: FnGetImages
    /** “上传”后 */
    _onUploaded?: UploadedHandler
    /** “删除”后 */
    _onDeleted?: DeletedHandler
    //#endregion 【Fields】

    //#region 【Props】
    /** 尺寸 */
    readonly Size = ref(150)
    /** 是否“允许多个” */
    readonly IsAllowMulti = ref(true)
    /** 填充方式 */
    readonly ObjectFit = ref<Property.ObjectFit>('contain')
    /** “图片”集合 */
    readonly Images = shallowReactive<UploadImageModel[]>([])
    /** 是否“正在加载”
     * （由“UploadModel”内部维护） */
    readonly IsLoading = ref(false)

    //#region [computed]
    /** 使用的“图片”集合 */
    readonly UsedImages = computed(() => this.Images.filter(i => !i.IsDelete.value))
    /** 是否“不可操作” */
    readonly IsInoperable = computed(() => this.IsProcessing.value || this.IsLoading.value)
    /** 是否“允许添加” */
    readonly IsAllowAdd = computed(() => this.IsAllowMulti.value || this.UsedImages.value.length < 1)
    /** 根样式 */
    readonly RootStyle = computed((): StyleValue => {
        return {
            '--size': this.Size.value + 'px',
            '--object-fit': this.ObjectFit.value,
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(opts: {
        axiosBase?: AxiosBase
        upload: FnUpload
        delete: FnDelete
        getImages: FnGetImages
    }) {
        super(files => {
            const file = files[0]
            if (file) this.Add({ name: file.name, file: file })
        })
        this.Type = FileTypes.Image
        this._axiosBase = opts.axiosBase ?? new AxiosBase()
        this._upload = opts.upload
        this._delete = opts.delete
        this._getImages = opts.getImages
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 获取“默认模型” */
    static GetDefault() {
        return new UploadModel({
            upload: async () => ApiResult.Success(Texts.UploadedSuccessfully.value),
            delete: async () => ApiResult.Success(Texts.DeletedSuccessfully.value),
            getImages: async () => [],
        })
    }

    /** 加载 */
    readonly Load = async () => {
        this.Images.splice(0)

        if (!this._getImages) return
        const arr = await this._getImages()
        if (!arr) return

        arr.forEach(i => this.Add(i))
    }

    /** 添加 */
    readonly Add = (config: ImageConfig) => {
        if (!this.IsAllowAdd.value) return

        if (!config.url && !config.file) {
            console.warn('Please input url or file!')
            return
        }

        this.Images.push(new UploadImageModel(this, config))
    }

    /** 提交 */
    readonly Submit = async (): Promise<ApiResult<any>> => {
        const deleteImages = this.Images.filter(i => i.IsDelete.value && !i._config.file)
        for (let i = 0; i < deleteImages.length; i++) {
            const res = await (deleteImages[i] as UploadImageModel).DeleteAsync()
            if (res.code === ApiResultCode.Error) return res
        }

        const uploadImages = this.Images.filter(i => !i.IsDelete.value && i._config.file)
        for (let i = 0; i < uploadImages.length; i++) {
            const res = await (uploadImages[i] as UploadImageModel).UploadAsync()
            if (res.code === ApiResultCode.Error) return res
        }

        return ApiResult.Success(Texts.SubmittedSuccessfully.value)
    }

    /** 删除 */
    readonly Delete = async (): Promise<ApiResult<any>> => {
        const fnDeletes = this.Images.map(i => i.DeleteAsync)
        for (let i = 0; i < fnDeletes.length; i++) {
            const res = await (fnDeletes[i] as () => Promise<ApiResult<any>>)()
            if (res.code === ApiResultCode.Error) return res
        }

        return ApiResult.Success(Texts.DeletedSuccessfully.value)
    }
    //#endregion 【Functions】
}