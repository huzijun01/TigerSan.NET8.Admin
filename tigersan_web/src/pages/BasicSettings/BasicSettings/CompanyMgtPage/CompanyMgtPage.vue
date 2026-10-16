<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="CompanyMgtPageModel.selectCompany" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                        <button v-if="!Authorities.CompanyMgtPage.IsReadonly.value" @click="model.Add">
                            {{ Texts.Add.value }}</button>
                        <button v-if="!Authorities.CompanyMgtPage.IsReadonly.value" class="bg-warning"
                            :disabled="!tree.IsActive.value" @click="model.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.CompanyMgtPage.IsReadonly.value" class="bg-danger"
                            :disabled="!tree.IsActive.value" @click="model.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 内容: -->
            <div class="content-panel">
                <div class="left-panel">
                    <Tree :model="tree" />
                </div>
                <div class="right-panel">
                    <CompanyInfo v-if="tree.IsActive.value" :model="model.companyInfo" />
                </div>
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="model.companyForm">
        <FormRow>
            <FormItem :model="model.configName.ItemModel">
                <input type="text" v-model="model.configName.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configAddr.ItemModel">
                <input type="text" v-model="model.configAddr.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configParent.ItemModel">
                <Select :model="model.selectParentCompany" />
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import CompanyInfo from './CompanyInfo.vue'
import { onMounted } from 'vue'
import { Authorities } from '@/navs/Authorities'
import { CompanyMgtPageModel } from './CompanyMgtPageModel'
import { PageCard, PopForm, FormRow, FormItem, Tree, Select, Texts } from '@/0_tigersan_ui/tigerui'

// 【字段】:
const model = new CompanyMgtPageModel()
const tree = CompanyMgtPageModel.tree
// 【过程】:
// 表格:
onMounted(() => {
    model.Refresh()
})

</script>

<style lang="less" scoped>
@import '@/assets/page.less';

.content-panel {
    height: calc(100% - 40px);
    display: grid;
    grid-template-columns: auto 1fr;

    .left-panel {
        width: 300px;
        margin-right: 15px;
        overflow: auto;
    }

    .right-panel {
        overflow: auto;
        background: var(--theme-input-background);
    }
}
</style>