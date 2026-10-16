import { SelectModel, Texts } from "@/0_tigersan_ui/tigerui"

/** 设备类型 */
export enum EqpTypes {
    /** 标签 */
    Tag = 0,
    /** 定位器 */
    Locator = 1,
    /** 工牌 */
    WorkCard = 2,
}

export class EqpType {
    static GetName(state?: EqpTypes | null): string {
        if (state === undefined || state === null) return ''

        switch (state) {
            case EqpTypes.Tag:
                return Texts.Tag.value
            case EqpTypes.Locator:
                return Texts.Locator.value
            case EqpTypes.WorkCard:
                return Texts.WorkCard.value
            default:
                return Texts.Unknown.value
        }
    }

    /** 获取“筛选框模型” */
    static GetSelectModel(): SelectModel<EqpTypes> {
        const select = new SelectModel<EqpTypes>()
        select.Width.value = 120
        select.Placeholder.value = Texts.EqpType
        select.Items.push(...[0, 1, 2])
        select._converter = this.GetName
        return select
    }
}