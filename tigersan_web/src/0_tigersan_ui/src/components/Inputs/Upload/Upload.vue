<template>
    <div class="upload flex-left" :style="model.RootStyle.value">
        <Image v-for="i in model.Images" :key="i._id" :model="i" />
        <div class="item add-panel input-border flex-center" v-if="model.IsAllowAdd.value" @click="model.Upload">
            <i class="iconfont">{{ Icons.Add_Thin }}</i>
        </div>
    </div>

    <!-- 图片预览 -->
    <ImagePreview :model="model._preview" />
</template>

<script lang="ts" setup>
import Image from './UploadImage.vue'
import ImagePreview from '../../Dialog/ImagePreview.vue'
import { onMounted } from 'vue'
import { Icons } from '../../../base'
import { UploadModel } from '../../../models'

const { model } = defineProps({
    model: {
        type: UploadModel,
        default: UploadModel.GetDefault
    }
})

onMounted(async () => {
    if (model._isAutoLoad) await model.Load()
})
</script>

<style lang="less" scoped>
.upload {
    gap: 10px;
    flex-wrap: wrap;

    .item {
        padding: 0;
        width: var(--size);
        height: var(--size);
        border-radius: 6px;
        overflow: hidden;
    }

    .add-panel {
        cursor: pointer;
        border-style: dashed;

        i {
            font-size: 25px;
            color: var(--color-secondary-text);
        }
    }
}
</style>