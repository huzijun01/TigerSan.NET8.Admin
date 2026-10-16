export enum RectPosition {
    Top,
    Bottom
}

export class GetWithinWindowRectResult {
    Position: RectPosition = RectPosition.Bottom
    Rect: DOMRect

    constructor(rect: DOMRect) {
        this.Rect = rect
    }
}

export class RectHelper {
    static IsWithin(parent: DOMRect, child: DOMRect, tolerance = 0.1): boolean {
        return (child.left - tolerance >= parent.left)
            && (child.top - tolerance >= parent.top)
            && (child.right + tolerance <= parent.right)
            && (child.bottom + tolerance <= parent.bottom);
    }

    static GetRectByTop(
        width: number,
        height: number,
        left: number,
        top: number): DOMRect {
        return new DOMRect(left, top, width, height)
    }

    static GetRectByBottom(
        width: number,
        height: number,
        left: number,
        bottom: number): DOMRect {
        return new DOMRect(left, bottom - height, width, height)
    }

    static GetWindowRect(): DOMRect {
        return new DOMRect(0, 0, window.innerWidth, window.innerHeight)
    }

    /** 获取在窗口范围的矩形 */
    static GetWithinWindowRect(standard: DOMRect, width: number, height: number): GetWithinWindowRectResult {
        // 基准矩形:
        let rectWindow = this.GetWindowRect()

        // 底部菜单:
        let rectBottomMenu = this.GetRectByTop(width, height, standard.left, standard.bottom)
        let rectMenu = rectBottomMenu

        // 顶部菜单:
        if (!this.IsWithin(rectWindow, rectBottomMenu)) {
            let rectTopMenu = this.GetRectByTop(width, height, standard.left, standard.top - height)
            if (this.IsWithin(rectWindow, rectTopMenu)) {
                rectMenu = rectTopMenu
            }
        }

        let res = new GetWithinWindowRectResult(rectMenu)
        res.Position = rectMenu == rectBottomMenu ? RectPosition.Bottom : RectPosition.Top
        return res
    }
}