<template>
    <div class="table-panel" :class="model.RootClass.value">
        <table>
            <!-- 表头区域 -->
            <thead :style="bgStyle">
                <tr>
                    <th v-if="model.IsShowCheckBox.value" class="checkbox sticky" ref="refCheckbox" :style="bgStyle">
                        <div class="select-mask flex-center">
                            <input v-if="model.IsShowSelectAllCheckBox.value" type="checkbox"
                                v-model="model.IsSelectAll.value" v-on:change="model.RiseOnSelectStateChange">
                        </div>
                    </th>
                    <th v-for="h in model.HeaderModels" :key="h._id" :style="h.CellStyle.value">
                        <TableHeader :model="h" />
                    </th>
                </tr>
            </thead>

            <!-- 表格主体 -->
            <tbody>
                <tr v-for="r in model.RowModels" :key="r._id">
                    <td v-if="model.IsShowCheckBox.value" class="checkbox sticky" :class="r.SelectClass.value"
                        :style="bgStyle">
                        <div class="select-mask flex-center">
                            <input type="checkbox" v-model="r.IsChecked.value"
                                v-on:change="model.RiseOnSelectStateChange">
                        </div>
                    </td>
                    <td v-for="i in r.ItemModels" :key="i._id" :style="i._headerModel.CellStyle.value">
                        <TableItem :model="i" />
                    </td>
                </tr>
            </tbody>
        </table>
        <Loading v-if="model.IsLoading.value" />
    </div>
</template>

<script lang="ts" setup>
import TableItem from './TableItem.vue'
import TableHeader from './TableHeader.vue'
import Loading from '../Dialog/Loading.vue'
import { onMounted, onBeforeUnmount, type StyleValue } from 'vue'
import { TableModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: TableModel<any>,
        default: () => new TableModel([])
    }
})

const { refCheckbox } = model

let bgStyle: StyleValue = {
    background: model._headerBackground as any
}

// 过程:
onMounted(() => {
    model.Refresh(true)
    model._sizeBehavior.Observe()
    model.watchLocale.Start()
})

onBeforeUnmount(() => {
    model._sizeBehavior.Unobserver()
    model.watchLocale.Stop()
})
</script>

<style lang="less" scoped>
.sticky {
    position: sticky;
    left: 0;
    z-index: 1;
}

.line {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    z-index: 2;
    background: var(--theme-table-line-background);
    transform: translateY(100%);
}

.table-panel {
    position: relative;
    overflow: auto;
    flex-grow: 1;

    &.loading {
        overflow: hidden;
    }

    .loading {
        width: 100%;
        height: 100%;
        position: absolute;
    }

    &.fill table {
        width: 100%;
    }

    table {
        border-collapse: collapse;

        thead {
            /* 位置: */
            position: sticky; // 冻结
            top: 0;
            z-index: 3;

            tr {
                &::after {
                    .line();
                    height: 2px;
                }
            }
        }

        tbody {
            tr {
                position: relative;

                &::after {
                    .line();
                }
            }
        }

        td,
        th {
            padding: 0px;
        }
    }
}

.checkbox {
    width: 34px;

    .select-mask {
        min-height: 45px; // 最小高度
    }

    &:hover .select-mask {
        background: var(--theme-mask-hover);
    }

    &.select .select-mask {
        background: var(--theme-table-row-background-selected);
    }

    input {
        margin: 0 16px;
    }
}
</style>