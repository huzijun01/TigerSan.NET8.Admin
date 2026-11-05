import { computed, ref, shallowReactive, type StyleValue, type ShallowReactive } from "vue"
import { nanoid } from "nanoid"
import { Colors } from "../../base"

export type DominantBaseline = "alphabetic" | "auto" | "central" | "hanging" | "ideographic" | "mathematical" | "middle" | "text-bottom" | "text-top";

export class ShapeOpt<TModel, TData = undefined> {
    _data?: TData
    _onClick?: (model: TModel) => any
}

export class PointOpt<TData = undefined> extends ShapeOpt<PointModel<TData>, TData> {
    X?: number
    Y?: number
    Icon?: string
    Text?: string
    Class?: string
    IconSize?: number
    TextSize?: number
    IconFill?: string
    TextFill?: string
    DominantBaseline?: DominantBaseline
}

export class ShapeBase<TModel, TData = undefined> {
    readonly _id = nanoid()
    _data?: TData
    _onClick?: (model: TModel) => any

    constructor(opt?: ShapeOpt<TModel, TData>) {
        if (opt) {
            this._data = opt._data
            this._onClick = opt._onClick
        }
    }
}

export class PointModel<TData = undefined> extends ShapeBase<PointModel<TData>, TData> {
    readonly X = ref(0)
    readonly Y = ref(0)
    readonly Icon = ref('●')
    readonly Text = ref('')
    readonly Class = ref('')
    readonly IconSize = ref(16)
    readonly TextSize = ref(12)
    readonly IconFill = ref(Colors.Brand)
    readonly TextFill = ref(Colors.Brand)
    readonly DominantBaseline = ref<DominantBaseline>('middle')

    readonly Style = computed((): StyleValue => {
        return {
            fontSize: this.IconSize.value + 'px',
            dominantBaseline: this.DominantBaseline.value,
        }
    })

    readonly labelY = computed(() => Number(this.Y.value) + this.IconSize.value + 3)

    readonly labelStyle = computed((): StyleValue => {
        return {
            fontSize: this.TextSize.value + 'px',
        }
    })

    constructor(opt?: PointOpt<TData>) {
        super(opt)
        if (opt) {
            if (opt.X) this.X.value = opt.X
            if (opt.Y) this.Y.value = opt.Y
            if (opt.Icon) this.Icon.value = opt.Icon
            if (opt.Text) this.Text.value = opt.Text
            if (opt.Class) this.Class.value = opt.Class
            if (opt.IconSize) this.IconSize.value = opt.IconSize
            if (opt.TextSize) this.TextSize.value = opt.TextSize
            if (opt.IconFill) this.IconFill.value = opt.IconFill
            if (opt.TextFill) this.TextFill.value = opt.TextFill
            if (opt.DominantBaseline) this.DominantBaseline.value = opt.DominantBaseline
        }
    }

    readonly Log = () => {
        console.log('x', this.X.value, 'y', this.Y.value)
    }

    readonly OnClick = () => {
        this._onClick?.(this)
    }
}

export class LineOpt<TData = undefined> extends ShapeOpt<LineModel<TData>, TData> {
    X1?: number
    Y1?: number
    X2?: number
    Y2?: number
    Stroke?: string
    StrokeWidth?: string
}

export class LineModel<TData = undefined> extends ShapeBase<LineModel<TData>, TData> {
    readonly X1 = ref(0)
    readonly Y1 = ref(0)
    readonly X2 = ref(0)
    readonly Y2 = ref(0)
    readonly Stroke = ref('red')
    readonly StrokeWidth = ref('1px')

    constructor(opt?: LineOpt<TData>) {
        super(opt)
        if (opt) {
            if (opt.X1) this.X1.value = opt.X1
            if (opt.Y1) this.Y1.value = opt.Y1
            if (opt.X2) this.X2.value = opt.X2
            if (opt.Y2) this.Y2.value = opt.Y2
            if (opt.Stroke) this.Stroke.value = opt.Stroke
            if (opt.StrokeWidth) this.StrokeWidth.value = opt.StrokeWidth
        }
    }

    readonly Log = () => {
        console.log('x1', this.X1.value, 'y1', this.Y1.value, 'x2', this.X2.value, 'y2', this.Y2.value)
    }

    readonly OnClick = () => {
        this._onClick?.(this)
    }
}

export class RectOpt<TData = undefined> extends ShapeOpt<RectModel<TData>, TData> {
    X?: number
    Y?: number
    W?: number
    H?: number
    Stroke?: string
    StrokeWidth?: string
    Fill?: string
}

export class RectModel<TData = undefined> extends ShapeBase<RectModel<TData>, TData> {
    readonly X = ref(0)
    readonly Y = ref(0)
    readonly W = ref(0)
    readonly H = ref(0)
    readonly Stroke = ref('red')
    readonly StrokeWidth = ref('1px')
    readonly Fill = ref('transparent')

    constructor(opt?: RectOpt<TData>) {
        super(opt)
        if (opt) {
            if (opt.X) this.X.value = opt.X
            if (opt.Y) this.Y.value = opt.Y
            if (opt.W) this.W.value = opt.W
            if (opt.H) this.H.value = opt.H
            if (opt.Stroke) this.Stroke.value = opt.Stroke
            if (opt.StrokeWidth) this.StrokeWidth.value = opt.StrokeWidth
            if (opt.Fill) this.Fill.value = opt.Fill
        }
    }

    readonly Log = () => {
        console.log('x', this.X.value, 'y', this.Y.value, 'w', this.W.value, 'h', this.H.value)
    }

    readonly OnClick = () => {
        this._onClick?.(this)
    }
}

export class CircleOpt<TData = undefined> extends ShapeOpt<CircleModel<TData>, TData> {
    X?: number
    Y?: number
    R?: number
    Stroke?: string
    StrokeWidth?: string
    Fill?: string
}

export class CircleModel<TData = undefined> extends ShapeBase<CircleModel<TData>, TData> {
    readonly X = ref(0)
    readonly Y = ref(0)
    readonly R = ref(0)
    readonly Stroke = ref('red')
    readonly StrokeWidth = ref('1px')
    readonly Fill = ref('transparent')

    constructor(opt?: CircleOpt<TData>) {
        super(opt)
        if (opt) {
            if (opt.X) this.X.value = opt.X
            if (opt.Y) this.Y.value = opt.Y
            if (opt.R) this.R.value = opt.R
            if (opt.Stroke) this.Stroke.value = opt.Stroke
            if (opt.StrokeWidth) this.StrokeWidth.value = opt.StrokeWidth
            if (opt.Fill) this.Fill.value = opt.Fill
        }
    }

    readonly Log = () => {
        console.log('x', this.X.value, 'y', this.Y.value)
    }

    readonly OnClick = () => {
        this._onClick?.(this)
    }
}

/** “CSV图层”配置 */
export class CsvLayerOpt<TLine = any, TPoint = any, TRect = any, TCircle = any> {
    lines?: LineOpt<TLine>[]
    points?: PointOpt<TPoint>[]
    rects?: RectOpt<TRect>[]
    circles?: CircleOpt<TCircle>[]
    Lines?: ShallowReactive<LineModel<TLine>[]>
    Points?: ShallowReactive<PointModel<TPoint>[]>
    Rects?: ShallowReactive<RectModel<TRect>[]>
    Circles?: ShallowReactive<CircleModel<TCircle>[]>
}

/** “CSV”图层 */
export class CsvLayerModel<TLine = any, TPoint = any, TRect = any, TCircle = any> {
    readonly _id = nanoid()
    readonly Lines
    readonly Points
    readonly Rects
    readonly Circles

    constructor(opt?: CsvLayerOpt<TLine, TPoint, TRect, TCircle>) {
        this.Lines = opt?.Lines ?? shallowReactive<LineModel<TLine>[]>([])
        this.Points = opt?.Points ?? shallowReactive<PointModel<TPoint>[]>([])
        this.Rects = opt?.Rects ?? shallowReactive<RectModel<TRect>[]>([])
        this.Circles = opt?.Circles ?? shallowReactive<CircleModel<TCircle>[]>([])

        if (opt) {
            if (opt.lines) opt.lines.forEach(i => this.Lines.push(new LineModel<TLine>(i)))
            if (opt.points) opt.points.forEach(i => this.Points.push(new PointModel<TPoint>(i)))
            if (opt.rects) opt.rects.forEach(i => this.Rects.push(new RectModel<TRect>(i)))
            if (opt.circles) opt.circles.forEach(i => this.Circles.push(new CircleModel<TCircle>(i)))
        }
    }
}

/** “CSV”助手 */
export class SvgHelper {
    /** 获取点击位置 */
    static GetPoint(e: MouseEvent) {
        const svg = e.currentTarget as SVGSVGElement
        const pt = svg.createSVGPoint()
        pt.x = e.clientX
        pt.y = e.clientY
        return pt.matrixTransform(svg.getScreenCTM()?.inverse())
    }
}