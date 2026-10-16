<template>
    <div class="row-data-panel" v-for="r in RowModels" :key="r._id">
        <KeyValue v-for="i in r.ItemModels" :key="i._id" :isAutoHidden="true" :prop-name="i._headerModel.ShowText.value"
            :prop-value="i.Text.value" />
    </div>
</template>

<script lang="ts" setup>
import KeyValue from '../Pagination/KeyValue.vue'
import { RowDataModel, TableModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: RowDataModel<any>,
        default: () => new RowDataModel(new TableModel([]))
    }
})

const { RowModels } = model.table
</script>

<style lang="less" scoped>
.row-data-panel {
    &>* {
        margin-bottom: 10px;
    }
}
</style>