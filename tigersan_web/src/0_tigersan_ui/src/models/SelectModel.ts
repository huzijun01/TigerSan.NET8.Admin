/** “ID-名称”对 */
export class IdName {
    id: bigint = 0n
    name = ''

    constructor(id?: bigint, name?: string) {
        if (id) this.id = id
        if (name) this.name = name
    }
}

/** “ID-名称-公司”对 */
export class IdNameCompany extends IdName {
    company?: bigint
    companyName?: string
}

/** “ID-值”对 */
export class IdValue {
    id: bigint = 0n
    value = ''

    constructor(id?: bigint, value?: string) {
        if (id) this.id = id
        if (value) this.value = value
    }
}