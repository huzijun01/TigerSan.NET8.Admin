<template>
    <div v-for="b in model.OpenedButtonModels" :key="b._id" class="flex-stretch"
        :class="{ 'display-none': !b.IsSelected.value }">
        <PageContent :component="b._component" />
    </div>
</template>

<script lang="ts" setup>
import PageContent from './PageContent.vue';
import { NavBarModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: NavBarModel,
        default: () => new NavBarModel()
    }
})
</script>

<style lang="less" scoped></style>