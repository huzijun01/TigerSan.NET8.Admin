import { ref, type ShallowReactive, computed } from "vue"

export class PathIsReadonly {
    path: string
    isReadonly: boolean
    constructor(path = '', isReadonly = true) {
        this.path = path
        this.isReadonly = isReadonly
    }
}

/** 权限验证 */
export class AuthorityVerify {
    //#region 【Fields】
    /** “权限”数组 */
    readonly Authorities: ShallowReactive<PathIsReadonly[]>
    /** 路径 */
    readonly Path = ref('')
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“可用” */
    readonly IsEnable = computed((): boolean => {
        return this.Authorities.some(n => n.path === this.Path.value)
    })

    /** 是否“只读” */
    readonly IsReadonly = computed((): boolean => {
        const find = this.Authorities.find(n => n.path === this.Path.value)
        if (!find) {
            console.warn('The find is undefined!')
            return false
        }
        return find ? find.isReadonly : true
    })
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(authorities: ShallowReactive<PathIsReadonly[]>, path: string = '') {
        this.Authorities = authorities
        this.Path.value = path
    }
    //#endregion 【Ctor】
}
