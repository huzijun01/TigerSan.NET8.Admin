import { computed, shallowRef } from 'vue'
import { navHome } from "@/navs/navHome"
import { authorityHelper, NavBarModel } from '@/0_tigersan_ui/tigerui'
import { navBasicSettings } from "@/navs/navBasicSettings"

/** 前端使用的导航 */
export const navModel = new NavBarModel()
/** “主页”导航 */
const navModelHome = new NavBarModel(navHome, '主页')
/** “基础设置”导航 */
const navModelBasicSettings = new NavBarModel(navBasicSettings, '基础设置')

/** 导航数据 */
export class NavData {
    private static readonly Nav = shallowRef(navBasicSettings)
    /** 是否在“主页” */
    static readonly IsAtHome = computed(() => this.Nav.value === navHome)

    /** 初始化“主页” */
    static readonly InitHome = () => {
        navModel.IsOpen.value = true
        navModel.Init(navHome)
        this.Nav.value = navHome
    }

    /** 初始化“基础设置” */
    static readonly InitBasicSettings = () => {
        navModel.IsOpen.value = true
        navModel.Init(navBasicSettings)
        this.Nav.value = navBasicSettings
    }
}

/** 初始化“导航”树结构 */
export function InitTree() {
    authorityHelper.ClearTreeConfigs()
    authorityHelper.AddNav2TreeConfigs(navModelBasicSettings)
    authorityHelper.AddNav2TreeConfigs(navModelHome)
}