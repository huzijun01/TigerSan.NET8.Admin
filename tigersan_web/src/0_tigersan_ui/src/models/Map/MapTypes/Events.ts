/** 地图事件 */
export class MapEvents {
    static readonly add = 'add'
    static readonly resize = 'resize'
    static readonly error = 'error'
    static readonly complete = 'complete'
    static readonly click = 'click'
    static readonly dblclick = 'dblclick'
    static readonly mapmove = 'mapmove'
    static readonly hotspotclick = 'hotspotclick'
    static readonly hotspotover = 'hotspotover'
    static readonly hotspotout = 'hotspotout'
    static readonly movestart = 'movestart'
    static readonly moveend = 'moveend'
    static readonly zoomchange = 'zoomchange'
    static readonly zoomstart = 'zoomstart'
    static readonly zoomend = 'zoomend'
    static readonly rotatechange = 'rotatechange'
    static readonly rotatestart = 'rotatestart'
    static readonly rotateend = 'rotateend'
    static readonly mousemove = 'mousemove'
    static readonly mousewheel = 'mousewheel'
    static readonly mouseover = 'mouseover'
    static readonly mouseout = 'mouseout'
    static readonly mouseup = 'mouseup'
    static readonly mousedown = 'mousedown'
    static readonly rightclick = 'rightclick'
    static readonly dragstart = 'dragstart'
    static readonly dragging = 'dragging'
    static readonly dragend = 'dragend'
    static readonly touchstart = 'touchstart'
    static readonly touchmove = 'touchmove'
    static readonly touchend = 'touchend'
}

declare global {
    namespace AMap {
        // 事件:
        /** 事件基类 */
        class EventBase {
            /** 类型 */
            type: string
            /** 类名 */
            className: string

            // Function:
            /** 绑定回调 */
            on(
                type: string,
                callback: Function,
                context?: object,
                once?: boolean): void
            /** 解绑回调 */
            off(
                type: string,
                callback: Function,
                context?: object): void
            /** 是否已绑定回调 */
            hasEvents(
                type: string,
                callback: Function,
                context?: object): void
            /** 清除某一类型的全部回调 */
            clearEvents(type: string): void
            /** 触发事件 */
            emit(type: string, data?: object): void
        }

        /** “地图”回调参数 */
        type MapArgs = {
            /** 经纬度 */
            lnglat: LngLat
            /** 像素坐标 */
            pixel: Pixel
            /** 事件类型 */
            type: string
            /** 目标对象 */
            target: object
        }

        /** “地图”回调 */
        type MapCallback = {
            add?: (args: MapArgs) => any
            resize?: (args: MapArgs) => any
            complete?: (args: MapArgs) => any
            click?: (args: MapArgs) => any
            dblclick?: (args: MapArgs) => any
            mapmove?: (args: MapArgs) => any
            hotspotclick?: (args: MapArgs) => any
            hotspotover?: (args: MapArgs) => any
            hotspotout?: (args: MapArgs) => any
            movestart?: (args: MapArgs) => any
            moveend?: (args: MapArgs) => any
            zoomchange?: (args: MapArgs) => any
            zoomstart?: (args: MapArgs) => any
            zoomend?: (args: MapArgs) => any
            rotatechange?: (args: MapArgs) => any
            rotatestart?: (args: MapArgs) => any
            rotateend?: (args: MapArgs) => any
            mousemove?: (args: MapArgs) => any
            mousewheel?: (args: MapArgs) => any
            mouseover?: (args: MapArgs) => any
            mouseout?: (args: MapArgs) => any
            mouseup?: (args: MapArgs) => any
            mousedown?: (args: MapArgs) => any
            rightclick?: (args: MapArgs) => any
            dragstart?: (args: MapArgs) => any
            dragging?: (args: MapArgs) => any
            dragend?: (args: MapArgs) => any
            touchstart?: (args: MapArgs) => any
            touchmove?: (args: MapArgs) => any
            touchend?: (args: MapArgs) => any
        }
    }
}