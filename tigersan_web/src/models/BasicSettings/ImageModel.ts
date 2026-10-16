import { axiosHelper } from "@/helpers"
import { FileInfo } from "./FileModel"
import { ApiResult, UploadModel } from "@/0_tigersan_ui/tigerui"

class ImageModelHelper {
    /** 基础URL */
    static readonly _baseUrl = '/Image/'
    /** 基础URL */
    get BaseUrl() { return ImageModelHelper._baseUrl }

    // 查:
    /** 获取“图片”集合 */
    readonly GetList = async (searchPattern?: string) => await axiosHelper.Get<FileInfo[]>(ImageModelHelper._baseUrl + 'List', [
        { key: 'searchPattern', value: searchPattern },
    ])

    /** 获取“图片” */
    readonly Get = async (name: string) => await axiosHelper.GetBlob(ImageModelHelper._baseUrl + name)

    // 增:
    /** 上传
     * @returns 文件名 */
    readonly Upload = async (params: {
        file: File,
        maxSize?: bigint,
        controller?: AbortController,
        onProgress?: (percentCompleted: number) => any
    }) => {
        const formData = new FormData()

        formData.append("file", params.file)
        if (params.maxSize) formData.append("maxSize", params.maxSize.toString())

        return await axiosHelper.Post<string>(ImageModelHelper._baseUrl, undefined, formData, {
            signal: params.controller?.signal,
            onUploadProgress: e => {
                if (params.onProgress && e.total) params.onProgress(Math.round((e.loaded * 100) / e.total))
            }
        })
    }

    // 删:
    /** 删除 */
    readonly Delete = async (names: string[]) => await axiosHelper.Post('/Image/Delete', undefined, names)

    // Other:
    /** 获取“上传器”模型 */
    readonly GetUploadModel = () => new UploadModel({
        axiosBase: axiosHelper,
        upload: async file => {
            const res = await imageModelHelper.Upload({ file })
            if (!res.data) {
                return res
            }
            return ApiResult.Success(res.message, { name: res.data, url: imageModelHelper.BaseUrl + res.data })
        },
        delete: async config => {
            const res = await imageModelHelper.Delete([config.name])
            if (!res.data) {
                return res
            }
            return ApiResult.Success(res.message)
        },
        getImages: async () => {
            const res = await imageModelHelper.GetList()
            if (!res.data) return undefined
            return res.data.map(i => {
                return {
                    name: i.name,
                    url: imageModelHelper.BaseUrl + i.name
                }
            })
        }
    })
}

export const imageModelHelper = new ImageModelHelper()