<template>
    <div class="item img-panel input-border" v-show="!model.IsDelete.value">
        <img :src="model.BlobUrl.value" :alt="model._config.name">
        <div class="mask flex-center">
            <div class="button-panel flex-center">
                <i class="iconfont" @click="model.Open">{{ Icons.Search }}</i>
                <i class="iconfont" @click="model.MarkDelete">{{ Icons.Delete_Linear }}</i>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { Icons } from '../../../base'
import { UploadImageModel } from '../../../models'

const { model } = defineProps({
    model: {
        type: UploadImageModel,
        default: UploadImageModel.GetDefault
    }
})

onMounted(async () => {
    await model.Load()
})

onBeforeUnmount(() => {
    model.Dispose()
})
</script>

<style lang="less" scoped>
.img-panel {
    position: relative;
    background: transparent;

    &>* {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    img {
        object-fit: var(--object-fit);
    }

    .mask {
        opacity: 0;
        background: rgba(0, 0, 0, 0.5);
        transition: var(--Global-Transition);

        .button-panel {
            gap: 10px;

            i {
                font-size: 20px;
                cursor: pointer;
                transition: var(--Global-Transition);

                &:hover {
                    font-weight: bold;
                    color: var(--theme-brand);
                }
            }
        }
    }

    &:hover {
        .mask {
            opacity: 1;
        }
    }
}
</style>