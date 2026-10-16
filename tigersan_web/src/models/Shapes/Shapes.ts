import { computed, ref, shallowReactive, type StyleValue, type ShallowReactive } from "vue"
import { nanoid } from "nanoid"
import { Colors } from "@/0_tigersan_ui/tigerui"

export type DominantBaseline = "alphabetic" | "auto" | "central" | "hanging" | "ideographic" | "mathematical" | "middle" | "text-bottom" | "text-top";

export class ShapeBase<TData, TModel> {
    readonly _id = nanoid()
    _data?: TData
    _onClick?: (model: TModel) => any
}

export class PointModel<TData> extends ShapeBase<TData, PointModel<TData>> {
    readonly X = ref(0)
    readonly Y = ref(0)
    readonly Text = ref('●')
    readonly Fill = ref(Colors.Brand)
    readonly Class = ref<string>()
    readonly FontSize = ref(16)
    readonly DominantBaseline = ref<DominantBaseline>('middle')
    readonly Style = computed((): StyleValue => {
        return {
            fontSize: this.FontSize.value + 'px',
            dominantBaseline: this.DominantBaseline.value,
        }
    })

    constructor(x: number = 0, y: number = 0) {
        super()
        this.X.value = x
        this.Y.value = y
    }

    readonly Log = () => {
        console.log('x', this.X.value, 'y', this.Y.value)
    }

    readonly OnClick = () => {
        this._onClick?.(this)
    }
}

export class LineModel<TData> extends ShapeBase<TData, LineModel<TData>> {
    readonly X1 = ref(0)
    readonly Y1 = ref(0)
    readonly X2 = ref(0)
    readonly Y2 = ref(0)
    readonly Stroke = ref('red')
    readonly StrokeWidth = ref('1px')

    constructor(x1: number = 0, y1: number = 0, x2: number = 0, y2: number = 0) {
        super()
        this.X1.value = x1
        this.Y1.value = y1
        this.X2.value = x2
        this.Y2.value = y2
    }

    readonly Log = () => {
        console.log('x1', this.X1.value, 'y1', this.Y1.value, 'x2', this.X2.value, 'y2', this.Y2.value)
    }

    readonly OnClick = () => {
        this._onClick?.(this)
    }
}

export class RectModel<TData> extends ShapeBase<TData, RectModel<TData>> {
    readonly X = ref(0)
    readonly Y = ref(0)
    readonly W = ref(0)
    readonly H = ref(0)
    readonly Stroke = ref('red')
    readonly StrokeWidth = ref('1px')
    readonly Fill = ref('transparent')

    constructor(x: number = 0, y: number = 0, w: number = 0, h: number = 0) {
        super()
        this.X.value = x
        this.Y.value = y
        this.W.value = w
        this.H.value = h
    }

    readonly Log = () => {
        console.log('x', this.X.value, 'y', this.Y.value, 'w', this.W.value, 'h', this.H.value)
    }

    readonly OnClick = () => {
        this._onClick?.(this)
    }
}

export class CircleModel<TData> extends ShapeBase<TData, CircleModel<TData>> {
    readonly X = ref(0)
    readonly Y = ref(0)
    readonly R = ref(0)
    readonly Stroke = ref('red')
    readonly StrokeWidth = ref('1px')
    readonly Fill = ref('transparent')

    constructor(x: number = 0, y: number = 0, r: number = 0) {
        super()
        this.X.value = x
        this.Y.value = y
        this.R.value = r
    }

    readonly Log = () => {
        console.log('x', this.X.value, 'y', this.Y.value)
    }

    readonly OnClick = () => {
        this._onClick?.(this)
    }
}

/** “CSV图层”配置 */
export type CsvLayerOpt<TLine, TPoint, TRect, TCircle> = {
    lines?: ShallowReactive<LineModel<TLine>[]>,
    points?: ShallowReactive<PointModel<TPoint>[]>,
    rects?: ShallowReactive<RectModel<TRect>[]>,
    circles?: ShallowReactive<CircleModel<TCircle>[]>,
}

/** “CSV”图层 */
export class CsvLayerModel<TLine, TPoint, TRect, TCircle> {
    readonly _id = nanoid()
    readonly Lines
    readonly Points
    readonly Rects
    readonly Circles

    constructor(opts?: CsvLayerOpt<TLine, TPoint, TRect, TCircle>) {
        this.Lines = opts?.lines ?? shallowReactive<LineModel<TLine>[]>([])
        this.Points = opts?.points ?? shallowReactive<PointModel<TPoint>[]>([])
        this.Rects = opts?.rects ?? shallowReactive<RectModel<TRect>[]>([])
        this.Circles = opts?.circles ?? shallowReactive<CircleModel<TCircle>[]>([])
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