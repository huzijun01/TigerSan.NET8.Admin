<template>
    <PageCard>
        <div class="flow-panel flex-center">
            <h2>{{ Texts.AssetState }}</h2>
            <Svg :model="model.svgAssetState" />
            <h2 class="online-state">{{ Texts.OnlineState }}</h2>
            <Svg :model="model.svgOnlineState" />
        </div>
    </PageCard>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { PageCard, Svg, Texts } from '@/0_tigersan_ui/tigerui'
import { WorkFlowPageModel } from './WorkFlowPageModel'

const { model } = defineProps({
    model: {
        type: WorkFlowPageModel,
        default: () => new WorkFlowPageModel()
    }
})

// 【字段】:

// 【过程】:
onMounted(() => {
})

// 【方法】:
</script>

<style lang="less" scoped>
.flow-panel {
    height: 100%;
    flex-direction: column;

    h2 {
        margin-bottom: 15px;
    }

    .online-state {
        margin-top: 50px;
    }
}
</style>