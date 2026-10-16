/** 二维点 */
export class Point2 {
    x = 0
    y = 0

    constructor(x?: number, y?: number) {
        if (x) this.x = x
        if (y) this.y = y
    }
}

export class MathHelper {
    /** 获取"二维点"集合 */
    static GetPoint2s(strPath: string | undefined): Point2[] | undefined {
        if (strPath === undefined) return undefined

        const points: Point2[] = []
        const strPoints = strPath.split(';')

        for (const strPoint of strPoints) {
            const values = strPoint.split(',')

            if (values.length !== 2) {
                console.warn(`The length of the values is not equal to 2!`)
                return undefined
            }

            const x = MathHelper.ParseFloat(values[0])
            const y = MathHelper.ParseFloat(values[1])

            if (x === undefined && y === undefined) {
                console.warn('Cannot parse the string to a number!')
                return
            }

            points.push(new Point2(x, y))
        }

        return points
    }

    /** 获取"路径"字符串 */
    static GetPathString(points: Point2[]): string | undefined {
        if (!points || points.length === 0) return undefined

        const strPoints = points.map(i => `${i.x},${i.y}`)
        return strPoints.join(';')
    }

    /** 获取"路径"字符串 */
    static ParseFloat(str?: string): number | undefined {
        if (str === undefined || str === null || str.trim() === '') return

        const trimmed = str.trim()
        const num = parseFloat(trimmed)

        return isNaN(num) ? undefined : num
    }
}
