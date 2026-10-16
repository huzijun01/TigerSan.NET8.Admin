import { nanoid } from "nanoid"
import { computed, ref, shallowReactive, type Ref, type ComputedRef } from "vue"
import { Texts } from "../../texts"
import { LanguageBehavior } from "../../helpers"
import type { NumberAction, NumberActionAsync } from "../../types"

/** “饼图项目”配置 */
export type PieItemConfig = {
    /** 名称 */
    Name: string | ComputedRef<string>,
    /** 值 */
    Value?: Ref<number>,
    /** 颜色 */
    Color?: string,
    /** “值”获取方法 */
    getValue?: NumberAction,
    /** “值”获取方法（异步） */
    getValueAsync?: NumberActionAsync
}

/** “饼图项目”模型 */
export class PieItemModel {
    //#region 【Fields】
    readonly _id = nanoid()
    /** 所属“饼图” */
    readonly _pie: PieModel
    /** 配置 */
    readonly _config
    /** 颜色 */
    readonly _color
    //#endregion 【Fields】

    //#region 【Props】
    /** “名称”文本 */
    readonly Name
    /** 值 */
    readonly Value
    /** “名称”显示文本 */
    readonly ShowName
    /** 比例 */
    readonly Ratio = computed(() => this.Value.value / this._pie.Sum.value)
    /** 是否“激活” */
    readonly IsActive = computed(() => this._pie.ActiveId.value === this._id)
    /** 半径 */
    readonly Radius = computed(() => this.IsActive.value
        ? this._pie.Radius.value * (1 + this._pie._changeRatio)
        : this._pie.Radius.value)
    /** 线宽 */
    readonly StrokeWidth = computed(() => this.IsActive.value
        ? this._pie.StrokeWidth.value + this._pie.Radius.value * this._pie._changeRatio * 2
        : this._pie.StrokeWidth.value)
    // 中间变量：
    readonly Center = computed(() => this._pie.Size.value / 2)
    readonly CosVal = computed(() => Math.cos(this.MidAngle.value))
    readonly SinVal = computed(() => Math.sin(this.MidAngle.value))
    // “圆心”坐标：
    readonly OX = computed(() => this._pie.PieWidth.value / 2)
    readonly OY = computed(() => this._pie.PieHeight.value / 2)
    // “引导线”坐标：
    readonly X1 = computed(() => this.OX.value + this.Center.value * this.CosVal.value)
    readonly Y1 = computed(() => this.OY.value + this.Center.value * this.SinVal.value)
    readonly X2 = computed(() => this.OX.value + (this.Center.value + this._pie.GuideLength.value) * this.CosVal.value)
    readonly Y2 = computed(() => this.OY.value + (this.Center.value + this._pie.GuideLength.value) * this.SinVal.value)
    /** 锚点 */
    readonly Anchor = computed(() => {
        if (this.CosVal.value > 0) {
            return 'start'
        } else if (this.CosVal.value < 0) {
            return 'end'
        } else {
            return 'middle'
        }
    })
    /** 基线 */
    readonly Baseline = computed(() => {
        let angle = this.MidAngle.value

        // 确保角度在 0 ~ 2π 之间
        if (angle < 0) {
            angle += 2 * Math.PI
        }
        angle = angle % (2 * Math.PI)

        const range = Math.PI / 360
        if (Math.abs(angle - 0) < range || Math.abs(angle - Math.PI) < range) {
            return 'middle'
        } else if (angle > 0 && angle < Math.PI) {
            return 'text-before-edge'
        } else {
            return 'text-after-edge'
        }
    })
    /** “之前项目”的比例总和 */
    readonly PerRatioSum = computed(() => {
        let sum = 0
        for (let i = 0; i < this._pie.Items.value.length; i++) {
            const item = this._pie.Items.value[i] as PieItemModel
            if (item._id === this._id) break
            sum += item.Value.value / this._pie.Sum.value
        }
        return sum
    })
    /** 中心角度 */
    readonly MidAngle = computed(() => {
        const startAngle = this.PerRatioSum.value * 2 * Math.PI
        const endAngle = (this.PerRatioSum.value + this.Ratio.value) * 2 * Math.PI
        const minAngle = (startAngle + endAngle) / 2 - Math.PI / 2
        return isFinite(minAngle) ? minAngle : 0
    })
    /** “百分比”文本 */
    readonly PercentText = computed(() => `${Math.round(this.Ratio.value * 100)}%`)
    /** 类名 */
    readonly Class = computed(() => {
        return {
            'active': this.IsActive.value,
            'hidden': this.Value.value <= 0,
        }
    })
    /** 样式 */
    readonly Style = computed(() => {
        const circumference = 2 * Math.PI * this.Radius.value
        return {
            stroke: this._color,
            strokeDasharray: circumference,
            strokeDashoffset: circumference * (1 - this.Ratio.value),
            strokeWidth: `${this.StrokeWidth.value}px`,
            transform: `rotate(${this.PerRatioSum.value * 360 - 90}deg)`,
        }
    })
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        pie: PieModel,
        config: PieItemConfig,
        color: string) {
        this._pie = pie
        this._config = config
        this._color = color
        this.Value = config.Value ? config.Value : ref(0)

        const lbName = new LanguageBehavior(config.Name)
        this.Name = lbName.Text
        this.ShowName = lbName.ShowText
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** “激活”时 */
    readonly OnActive = () => {
        this._pie.ActiveId.value = this._id
    }

    /** “失活”时 */
    readonly OnUnactive = () => {
        this._pie.ActiveId.value = undefined
    }

    /** 更新“值” */
    readonly UpdateValue = async () => {
        if (this._config.getValueAsync) {
            this.Value.value = await this._config.getValueAsync()
        }
        else if (this._config.getValue) {
            this.Value.value = this._config.getValue()
        }
    }
    //#endregion 【Functions】
}

/** “饼图”模型 */
export class PieModel {
    //#region 【Fields】
    /** 变化率 */
    _changeRatio = 0.05
    /** 是否“自动初始化” */
    _isAutoInit = true
    /** 是否“显示百分比” */
    _isShowPercent = false
    /** “颜色”集合 */
    _colors: string[] = [
        '#5470C6', // 蓝
        '#91CC75', // 绿
        '#FAC858', // 黄
        '#EE6666', // 红
        '#73C0DE', // 浅蓝
        '#3BA272', // 深绿
        '#FC8452', // 橙
        '#9A60B4', // 紫
        '#EA7CCC', // 粉紫
        '#2F4554', // 深蓝灰
        '#61A0A8', // 青灰
        '#D48265'  // 棕
    ]
    //#endregion 【Fields】

    //#region 【Props】
    /** “标题”文本 */
    readonly Title
    /** “标题”显示文本 */
    readonly ShowTitle
    /** “标题”大小 */
    readonly TitleSize = ref(18)
    /** “字体”大小 */
    readonly FontSize = ref(15)
    /** “字体”颜色 */
    readonly Color = ref('var(--theme-color)')
    /** 宽度 */
    readonly Width = ref<number | undefined>()
    /** 高度 */
    readonly Height = ref<number>(200)
    /** 孔比例（0~1） */
    readonly HoleRatio = ref(0.5)
    /** 内边距 */
    readonly Padding = ref(0)
    /** 是否显示“标题” */
    readonly IsShowTitle = ref(true)
    /** 是否显示“示例” */
    readonly IsShowExample = ref(true)
    /** 是否显示“引导线” */
    readonly IsShowGuideLine = ref(true)
    /** “引导线”长度 */
    readonly GuideLength = ref(12)
    /** 激活项目ID */
    readonly ActiveId = ref<string | undefined>()

    //#region [computed]
    /** “中心”文本 */
    readonly CenterText = computed(() => {
        const active = this.Items.value.find(i => i._id === this.ActiveId.value)
        return active ? this._isShowPercent ? active.PercentText.value : active.Value.value.toString() : undefined
    })
    /** “饼图”高度 */
    readonly PieHeight = computed(() => {
        const h = this.Height.value ?? 200
        const titleH = this.IsShowTitle.value ? this.TitleSize.value + 10 : 0
        const exampleH = this.IsShowExample.value ? this.FontSize.value + 10 : 0
        return Math.max(0, h - titleH - exampleH)
    })
    /** “饼图”宽度 */
    readonly PieWidth = computed(() => {
        const w = this.Width.value
        const h = this.PieHeight.value
        return (w && w > 0) ? w : h
    })
    /** “根元素”样式 */
    readonly RootStyle = computed(() => {
        return {
            width: this.Width.value ? `${this.Width.value}px` : undefined,
            height: this.Height.value ? `${this.Height.value}px` : undefined,
        }
    })
    /** 使用的“内边距” */
    readonly UsedPadding = computed(() => this.IsShowGuideLine.value ? this.Padding.value + this.FontSize.value + this.GuideLength.value : this.Padding.value)
    /** 尺寸 */
    readonly Size = computed(() => Math.min(this.PieWidth.value, this.PieHeight.value) - this.UsedPadding.value * 2)
    /** 半径 */
    readonly Radius = computed(() => (this.Size.value * (1 + this.HoleRatio.value)) / 4)
    /** 描边宽度 */
    readonly StrokeWidth = computed(() => (this.Size.value * (1 - this.HoleRatio.value)) / 2)
    /** “配置”集合 */
    readonly Configs = shallowReactive<PieItemConfig[]>([])
    /** 总和 */
    readonly Sum = computed(() => this.Items.value.reduce((total, config) => total + config.Value.value, 0))
    /** “背景圆环”样式 */
    readonly styleBgCircle = computed(() => {
        return {
            strokeWidth: `${this.StrokeWidth.value}px`,
        }
    })
    /** “字体大小”样式 */
    readonly styleFontSize = computed(() => {
        return { fontSize: `${this.FontSize.value}px` }
    })
    /** “项目”集合 */
    readonly Items = computed(() => {
        const arr: PieItemModel[] = []
        this.Configs.forEach(config => {
            const color = config.Color ?? this.GetColor(this.Configs.indexOf(config))
            const circle = new PieItemModel(this, config, color)
            arr.push(circle)
        })
        return arr
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(configs?: PieItemConfig[]) {
        const lbTitle = new LanguageBehavior(Texts.Title)
        this.Title = lbTitle.Text
        this.ShowTitle = lbTitle.ShowText

        if (configs) this.SetConfigs(configs)
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 获取“颜色” */
    readonly GetColor = (index: number): string => {
        if (!this._colors || this._colors.length === 0) {
            return '#5470C6' // 兜底颜色
        }
        // 使用取模运算实现颜色循环
        return this._colors[index % this._colors.length] as string
    }

    /** 设置“配置”集合 */
    readonly SetConfigs = (configs: PieItemConfig[]) => {
        this.Configs.splice(0)
        this.Configs.push(...configs)
    }

    /** 初始化 */
    readonly Init = async () => {
        for (let i = 0; i < this.Items.value.length; i++) {
            const item = this.Items.value[i] as PieItemModel
            await item.UpdateValue()
        }
    }
    //#endregion 【Functions】
}