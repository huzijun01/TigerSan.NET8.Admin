import { computed, ref, shallowRef } from "vue"

/** “文件选择器”回调 */
export type FileInputHandler = (files: FileList) => any

/** “上传基类”配置 */
export interface UploadOptions {
    /** 文件类型。默认值：'*' */
    type?: string
    /** 是否支持多选。默认值：false */
    multiple?: boolean
}

/** “上传”基类 */
export abstract class UploadBase {
    //#region 【Fields】
    /** 终止控制器 */
    readonly Controller = shallowRef<AbortController | undefined>()
    /** 文件选择器 */
    readonly fileInput
    //#endregion 【Fields】

    //#region 【Props】
    /** 百分比 */
    readonly Percent = ref(0)

    //#region [引用]
    /** 文件类型 */
    get Type() { return this.fileInput.accept }
    set Type(value) { this.fileInput.accept = value }
    /** 是否支持多选 */
    get Multiple() { return this.fileInput.multiple }
    set Multiple(value) { this.fileInput.multiple = value }
    //#endregion [引用]

    //#region [computed]
    /** 是否“正在处理” */
    readonly IsProcessing = computed(() => this.Controller.value != undefined)
    /** “百分比”文本 */
    readonly PercentText = computed(() => this.IsProcessing.value ? this.Percent.value + '%' : '')
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(onchange: FileInputHandler, options?: UploadOptions) {
        this.fileInput = UploadBase.GetInput(onchange, options)
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    static GetInput(onchange: FileInputHandler, options?: UploadOptions): HTMLInputElement {
        const input = document.createElement('input') as HTMLInputElement
        input.type = 'file'
        input.accept = options?.type || '*'
        input.multiple = options?.multiple ? false : true
        input.onchange = e => {
            const target = e.target as HTMLInputElement
            if (target.files) onchange(target.files)
        }
        return input
    }

    /** 上传 */
    readonly Upload = () => {
        this.fileInput.click()
    }
    //#endregion 【Functions】
}

/** 常用文件类型 */
export const FileTypes = {
    /** 所有图片 (推荐: 兼容性好) */
    Image: 'image/*',
    /** 精确图片格式 (JPG, PNG, GIF, WebP) */
    ImageStrict: 'image/jpeg,image/png,image/gif,image/webp',

    /** 所有视频 */
    Video: 'video/*',
    /** 常见视频格式 (MP4, WebM, Ogg) */
    VideoCommon: 'video/mp4,video/webm,video/ogg',

    /** 所有音频 */
    Audio: 'audio/*',
    /** 常见音频格式 (MP3, WAV, Ogg) */
    AudioCommon: 'audio/mpeg,audio/wav,audio/ogg',

    /** PDF 文档 */
    PDF: 'application/pdf,.pdf',

    /** Word 文档 (.doc, .docx) */
    Word: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx',

    /** Excel 文档 (.xls, .xlsx) */
    Excel: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,.xlsx',

    /** 压缩文件 (.zip, .rar, .7z) */
    Archive: 'application/zip,application/x-rar-compressed,application/x-7z-compressed,.zip,.rar,.7z',

    /** 任意文件 (默认) */
    Any: '*'
}