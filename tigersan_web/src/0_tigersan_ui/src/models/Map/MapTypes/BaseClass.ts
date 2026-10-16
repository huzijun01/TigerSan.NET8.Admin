export { }
declare global {
    namespace AMap {
        // 基础类:
        /** 向量 */
        type Vector2 = [number, number]

        /** 经纬度坐标 */
        class LngLat {
            // Field:
            /** 经度 */
            lng: number
            /** 纬度 */
            lat: number
            /** 位置 */
            pos: Vector2

            // Ctor:
            constructor(lng: number, lat: number, noWrap?: Boolean)

            // Function:
            /** 设置“经度” */
            setLng(lng: number): void
            /** 获取“经度” */
            getLng(): number

            /** 设置“纬度” */
            setLat(lat: number): void
            /** 获取“纬度” */
            getLat(): number

            /** 相等 */
            equals(another: LngLat): boolean
            /** 加 */
            add(another: LngLat, noWrap: boolean): boolean
            /** 减 */
            subtract(another: LngLat, noWrap: boolean): boolean
            /** 偏移 */
            offset(E: number, N: number): void
            /** 转为“字符串” */
            toString(): string
            /** 转为“数组” */
            toArray(): number[]
            /** 距离 */
            distance(another: LngLat): number
        }

        /** 经纬度坐标或数组 */
        export type LngLatLike = LngLat | Vector2

        /** 经纬度矩形范围 */
        class Bounds {
            // Ctor:
            /** 经纬度矩形范围
             * @param southWest - 西南
             * @param southWest - 东北 */
            constructor(southWest: LngLat, northEast: LngLat)

            // Function:
            /** 获取“西南角”坐标 */
            getSouthWest(): LngLat
            /** 获取“东北角”坐标 */
            getNorthEast(): LngLat
            /** 获取“西北角”坐标 */
            getNorthWest(): LngLat
            /** 获取“东南角”坐标 */
            getSouthEast(): LngLat
            /** 指定“点坐标”是否在“矩形范围”内 */
            contains(lngLat: LngLat): boolean
            /** 获取“中心点” */
            getCenter(): LngLat
            /** 转为“字符串” */
            toString(): string
        }

        /** 像素坐标 */
        class Pixel {
            // Ctor:
            constructor(x: number, y: number)

            // Function:
            /** 获取横坐标 */
            getX(): number
            /** 获取纵坐标 */
            getY(): number
            /** 转为字符串 */
            toString(): string
            /** 相等 */
            equals(point: Pixel): number
        }

        /** 像素尺寸 */
        class Size {
            // Ctor:
            constructor(width: number, height: number)

            // Function:
            /** 获取宽度 */
            getWidth(): number
            /** 获取高度 */
            getHeight(): number
            /** 转为字符串 */
            toString(): string
        }
    }
}