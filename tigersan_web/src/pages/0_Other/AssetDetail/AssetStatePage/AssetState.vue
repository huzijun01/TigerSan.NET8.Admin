<template>
    <div class="state-panel">
        <!-- 基础详情： -->
        <div class="title">{{ Texts.BasicDetail.value }}</div>
        <KeyValue :isAutoHidden="true" :propName="Texts.AssetId.value" :propValue="asset?.assetId" :isLink="true"
            :click="ShowAssetDetail" />
        <KeyValue :isAutoHidden="true" :propName="Texts.Name.value" :propValue="asset?.name" />
        <KeyValue :isAutoHidden="true" :propName="Texts.Company.value" :propValue="asset?.companyName" />
        <KeyValue :isAutoHidden="true" :propName="Texts.Department.value" :propValue="asset?.departmentName" />
        <KeyValue :isAutoHidden="true" :propName="Texts.AllotMode.value" :propValue="IsAuto.ToString(asset?.isAuto)" />
        <KeyValue :isAutoHidden="true" :propName="Texts.IsFall.value"
            :propValue="IsFall.ToString(asset?.isFall ?? false)" />
        <KeyValue :isAutoHidden="true" :propName="Texts.AssetType.value" :propValue="asset?.typeName" />
        <KeyValue :isAutoHidden="true" :propName="Texts.ErrorType.value"
            :propValue="ErrorType.GetName(asset?.errorType)" />
        <KeyValue :isAutoHidden="true" :propName="Texts.Vehicle.value" :propValue="asset?.plate" />
        <!-- 标签详情： -->
        <div class="title" v-if="tag">{{ Texts.TagDetail.value }}</div>
        <KeyValue :isAutoHidden="true" :propName="Texts.TagId.value" :propValue="tag?.tagId" />
        <KeyValue :isAutoHidden="true" :propName="Texts.TagType.value" :propValue="tag?.typeName" />
        <KeyValue :isAutoHidden="true" :propName="Texts.OnlineState.value"
            :propValue="OnlineState.ToString(tag?.onlineState)" />
        <KeyValue :isAutoHidden="true" :propName="Texts.Battery.value" :propValue="tag?.battery" />
        <KeyValue :isAutoHidden="true" :propName="Texts.Site.value" :propValue="tag?.siteName" />
        <KeyValue :isAutoHidden="true" :propName="Texts.ReportTime.value"
            :propValue="ObjectHelper.GetDateString(tag?.reportTime)" />
        <!-- 基站详情： -->
        <div class="title" v-if="station">{{ Texts.StationDetail.value }}</div>
        <KeyValue :isAutoHidden="true" :propName="Texts.MacAddr.value" :propValue="station?.macAddr" :isLink="true"
            :click="ShowStationDetail" />
        <KeyValue :isAutoHidden="true" :propName="Texts.Name.value" :propValue="station?.name" />
        <KeyValue :isAutoHidden="true" :propName="Texts.StationType.value" :propValue="station?.typeName" />
        <KeyValue :isAutoHidden="true" :propName="Texts.InstallMode.value"
            :propValue="IsMobile.ToString(station?.isMobile)" />
        <KeyValue :isAutoHidden="true" :propName="Texts.OnlineState.value"
            :propValue="OnlineState.ToString(station?.onlineState)" />
        <KeyValue :isAutoHidden="true" :propName="Texts.ReportTime.value"
            :propValue="ObjectHelper.GetDateString(station?.reportTime)" />
    </div>

    <!-- 弹窗 -->
    <PopWindow :model="stationDetail.pop">
        <TabView :model="stationDetail.tabView" />
    </PopWindow>
</template>

<script lang="ts" setup>
import { type PropType } from 'vue'
import { Texts, KeyValue, IsFall, ObjectHelper, OnlineState, IsAuto, IsMobile, PopWindow, TabView } from '@/0_tigersan_ui/tigerui'
import { AssetDto, BaseStationDto, ErrorType, TagDto } from '@/models'
import { assetDetail, stationDetail } from '@/pages/Home/AssetLedgerPage/AssetLedgerTable'

// 【字段】:
const { asset, tag, station } = defineProps({
    asset: {
        type: Object as PropType<AssetDto | undefined>,
        default: undefined
    },
    tag: {
        type: Object as PropType<TagDto | undefined>,
        default: undefined
    },
    station: {
        type: Object as PropType<BaseStationDto | undefined>,
        default: undefined
    }
})

// 【方法】:
function ShowAssetDetail() {
    if (!asset) return
    assetDetail.Show(asset.id, asset.assetId)
}

function ShowStationDetail() {
    if (!station) return
    stationDetail.Show(station)
}
</script>

<style lang="less" scoped>
.state-panel {
    &>* {
        margin-bottom: 10px;
    }

    .title {
        margin: 15px 0;
        font-size: 18px;
        font-weight: bold;
    }
}
</style>