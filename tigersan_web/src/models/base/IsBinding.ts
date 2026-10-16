import { Texts, ObjectHelper, SelectModel, TableItemModel, Colors } from "@/0_tigersan_ui/tigerui"

export class IsBinding {
    static ToString(value: boolean) {
        return value ? Texts.Enable.value : Texts.Disable.value
    }

    static GetString(obj: object, propName: string = 'isBinding'): string {
        return ObjectHelper.DefaultTGetter(obj, propName, false) ? Texts.Binding.value : Texts.Unbind.value
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.IsBinding
        select.Items.push(...[true, false])
        select._converter = IsBinding.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isBinding') {
        if (itemModel._headerModel._propName === propName) {
            if (itemModel.GetSource()) {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            } else {
                itemModel.Color.value = Colors.Danger
                itemModel.Background.value = Colors.Danger10
            }
        }
    }
}