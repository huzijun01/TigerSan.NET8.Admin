import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { computed, ref } from "vue"
import { ObjectHelper } from '../../helpers'
import type { Language } from "element-plus/lib/locales"

export enum DateType {
    year = 'year',
    month = 'month',
    date = 'date',
    dates = 'dates',
    datetime = 'datetime',
    week = 'week',
    datetimerange = 'datetimerange',
    daterange = 'daterange',
    monthrange = 'monthrange',
}

/** “日期选择器”模型 */
export class DatePickerModel {
    //#region 【Fields】
    _locale?: Language = zhCn
    _type: DateType = DateType.date
    _format = 'YYYY/MM/DD hh:mm:ss'
    _valueFormat = 'YYYY/MM/DD hh:mm:ss'
    _placeholder = '请选择时间'
    _startPlaceholder = '开始时间'
    _endPlaceholder = '结束时间'
    _onChange?: (value?: string | [string, string]) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** 宽度 */
    readonly Width = ref('')
    /** 是否显示“前缀” */
    readonly IsShowPrefix = ref(true)
    /** 日期 */
    readonly Date = ref<string | [string, string] | undefined>()

    //#region [computed]
    /** 根样式 */
    readonly RootStyle = computed(() => {
        return {
            '--width': this.Width.value,
            '--prefix-display': this.IsShowPrefix.value ? '' : 'none',
        }
    })

    /** 起始日期 */
    readonly Start = computed(() => {
        const date = this.Date.value
        return date && Array.isArray(date) && date.length > 0 ? date[0] : undefined
    })

    /** 结束日期 */
    readonly End = computed(() => {
        const date = this.Date.value
        return date && Array.isArray(date) && date.length > 1 ? date[1] : undefined
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Functions】
    readonly OnChange = () => {
        if (this._onChange) {
            this._onChange(this.Date.value)
        }
    }

    readonly InitWeekRange = () => {
        const weekRange = ObjectHelper.GetOneWeekAgoAndTodayString()
        this.Date.value = [weekRange.start, weekRange.end]
    }
    //#endregion 【Functions】
}