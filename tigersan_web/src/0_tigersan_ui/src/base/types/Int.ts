import { type NumberFunc } from "../../types"

export class Int {
    // 字段:
    private _value = 0
    private _oldValue = 0
    _set?: NumberFunc

    // 引用:
    get value() {
        return this._value
    }
    set value(num) {
        if (isNaN(num)) return

        this._value = Math.floor(num)

        if (this._set && (this._value != this._oldValue)) {
            this._set(this._value)
            this._oldValue = this._value
        }
    }

    // Ctor:
    constructor(num?: number, set?: NumberFunc) {
        if (num != undefined) this.value = num
        this._set = set
    }

    // 方法:
    Add(int: Int) {
        this.value = this._value + int.value;
    }

    Sub(int: Int) {
        this.value = this._value - int.value;
    }

    Mul(int: Int) {
        this.value = this._value * int.value;
    }

    Div(int: Int) {
        // 防止除零错误
        if (int.value === 0) throw new Error("Division by zero")
        this.value = Math.floor(this._value / int.value)
    }

    Mod(int: Int) {
        if (int.value === 0) throw new Error("Division by zero")
        this.value = this._value % int.value;
    }

    static Div(a: Int, b: Int): number {
        // 防止除零错误
        if (b.value === 0) throw new Error("Division by zero")
        return Math.floor(a.value / b.value)
    }

    static Mod(a: Int, b: Int): number {
        if (b.value === 0) throw new Error("Division by zero")
        return Math.floor(a.value % b.value)
    }
}