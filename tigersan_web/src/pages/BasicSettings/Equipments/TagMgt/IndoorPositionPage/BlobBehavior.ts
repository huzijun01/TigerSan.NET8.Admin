import { ref } from "vue"
import { imageModelHelper } from "@/models"
import { loading } from "@/0_tigersan_ui/tigerui"

export class BlobBehavior {
    //#region 【Fields】
    _blob?: Blob
    //#endregion 【Fields】

    //#region 【Props】
    /** 名称 */
    readonly Name = ref('')
    /** URL（由“BlobBehavior”内部维护） */
    readonly Url = ref('')
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly Load = async () => {
        try {
            loading.IsShow.value = true

            // 1. 获取新的 Blob 数据
            const newBlob = await imageModelHelper.Get(this.Name.value)

            if (newBlob) {
                // 2. 【关键步骤】释放旧的 URL
                // 此时 this.Url.value 持有的是上一次创建的 Object URL
                // 如果这是第一次调用，value 为空字符串，revokeObjectURL 通常会安全地忽略空字符串
                if (this.Url.value) {
                    URL.revokeObjectURL(this.Url.value)
                }

                // 3. 更新 Blob 引用
                this._blob = newBlob

                // 4. 创建新的 Object URL 并直接赋值给响应式引用
                this.Url.value = URL.createObjectURL(this._blob)
            } else {
                this.Url.value = ''
            }
        } catch (error) {
            console.error(error)
        } finally {
            loading.IsShow.value = false
        }
    }

    readonly Dispose = () => {
        if (this.Url.value) {
            URL.revokeObjectURL(this.Url.value)
        }

        // 清空状态
        this.Url.value = ''
        this._blob = undefined
    }
    //#endregion 【Functions】
}