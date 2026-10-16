import { axiosHelper } from "@/helpers"
import { Settings } from "@/settings"

/** "文件"信息 */
export class FileInfo {
    isDir = false
    name = ''
    createTime = new Date()
    editTime?: Date
    bytes?: bigint
    size?: string
}

class FileHelper {
    /** 基础URL */
    static readonly _baseUrl = Settings.AppBaseUrl + '/File/DownloadFile'
    /** 基础URL */
    get BaseUrl() { return FileHelper._baseUrl }

    // 查:
    /** 获取“路径信息”集合 */
    readonly GetPathList = async (param: {
        subPath?: string,
        searchPattern?: string,
        isTopOnly?: boolean,
    }) => await axiosHelper.Get<FileInfo[]>('/File/PathList', [
        { key: 'subPath', value: param.subPath },
        { key: 'searchPattern', value: param.searchPattern },
        { key: 'isTopOnly', value: param.isTopOnly },
    ])

    /** 下载“文件” */
    readonly DownloadFile = async (name: string, subPath?: string) => await axiosHelper.DownloadFile(name, '/File/DownloadFile', [
        { key: 'name', value: name },
        { key: 'subPath', value: subPath },
    ])

    // 增:
    /** 新建“文件夹” */
    readonly CreateDir = async (name?: string, subPath?: string) => await axiosHelper.Post('/File/Dir', [
        { key: 'name', value: name },
        { key: 'subPath', value: subPath },
    ])

    /** 上传“文件”
     * @returns Query参数 */
    readonly Upload = async (params: {
        file: File,
        name?: string,
        subPath?: string,
        isOverwrite?: boolean,
        maxSize?: bigint,
        controller?: AbortController,
        onProgress?: (percentCompleted: number) => any
    }) => {
        const formData = new FormData()

        formData.append("file", params.file)
        if (params.name) formData.append("name", params.name)
        if (params.subPath) formData.append("subPath", params.subPath)
        if (params.isOverwrite) formData.append("isOverwrite", params.isOverwrite.toString())
        if (params.maxSize) formData.append("maxSize", params.maxSize.toString())

        return await axiosHelper.Post<string>('/File/Upload', undefined, formData, {
            signal: params.controller?.signal,
            onUploadProgress: e => {
                if (params.onProgress && e.total) params.onProgress(Math.round((e.loaded * 100) / e.total))
            }
        })
    }

    // 改:
    /** 重命名 */
    readonly Rename = async (oldName: string, newName: string, subPath?: string) => await axiosHelper.Put('/File/Rename', [
        { key: 'oldName', value: oldName },
        { key: 'newName', value: newName },
        { key: 'subPath', value: subPath },
    ])

    // 删:
    /** 删除 */
    readonly Delete = async (names: string[], subPath?: string, recursive?: boolean) => await axiosHelper.Post('/File/Delete', [
        { key: 'subPath', value: subPath },
        { key: 'recursive', value: recursive },
    ], names)
}

export const fileModelHelper = new FileHelper()