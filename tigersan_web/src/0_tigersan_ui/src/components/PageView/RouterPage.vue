<template>
    <div class="page-content flex-stretch" ref="refRoot"></div>
</template>

<script lang="ts" setup>
import DefaultPage from './DefaultPage.vue'
import { shallowRef, onMounted, type App, onBeforeMount } from 'vue'
import { ComponentHelper } from '../../helpers'
import { router, RouterPageModel } from '../../models'

// 字段:
let appCache: App | undefined
const refRoot = shallowRef<HTMLElement | undefined>()

RouterPageModel._onPageChange = page => {
    if (!refRoot.value) {
        console.warn('The refRoot is undefined!')
        return
    }

    if (appCache && refRoot.value.children.length > 0) {
        appCache.unmount()
        appCache = undefined
    }

    // 创建App:
    appCache = ComponentHelper.CreateApp(page.component ?? DefaultPage)

    // 挂载:
    appCache.mount(refRoot.value)
}

onMounted(() => {
    router.GoTo('/')
})

onBeforeMount(() => {
    appCache?.unmount()
    appCache = undefined
})
</script>

<style lang="less" scoped></style>