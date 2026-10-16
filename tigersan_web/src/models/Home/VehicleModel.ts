import { IdName, SelectModel, Texts } from "@/0_tigersan_ui/tigerui"
import { axiosHelper, IdHelper, IdEntityBase } from "@/helpers"

/** “车辆”实体 */
export class VehicleEntity extends IdEntityBase {
    company: bigint = 0n
    plate = ''
    logistics?: string
    driver?: string
    phone?: string
}

export class VehicleHelper extends IdHelper<VehicleEntity> {
    constructor() {
        super('Vehicle')
    }

    /** 获取“筛选框模型” */
    GetIdPlateSelectModel(): SelectModel<IdName> {
        const select = new SelectModel<IdName>()
        select.Width.value = 208
        select.Placeholder.value = Texts.Plate
        select._getItemsAsync = async () => await this.GetIdPlatesByCompany()
        select._converter = data => data.name
        return select
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: {
        company?: bigint,
        plate?: string,
    }) => await axiosHelper.GetCount(this._action, {
        filter: {
            filters: [
                { propName: 'Company', value: param.company },
                { propName: 'Plate', value: param.plate === '' ? undefined : param.plate },
            ]
        }
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        company?: bigint,
        plate?: string,
    }) => await axiosHelper.GetList<VehicleEntity>(this._action, {
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        filter: {
            filters: [
                { propName: 'Company', value: param.company },
                { propName: 'Plate', value: param.plate === '' ? undefined : param.plate },
            ]
        }
    })

    /** 根据“公司”获取“ID名称对”集合 */
    readonly GetIdPlatesByCompany = async (company?: bigint) => {
        if (!company) return []
        const res = await axiosHelper.Post<IdName[]>(`${this._action}/SelectIdPlate`, undefined, {
            filters: [{ propName: 'Company', value: company }]
        })
        if (!res.data) {
            console.error(res.message)
            return []
        }
        return res.data
    }
}

export const vehicleHelper = new VehicleHelper()