import { Icons } from '../../base'
import { NavBarModel } from './NavBarModel'

let testNavBarModel = new NavBarModel({
    Folders: [
        {
            Title: "一级目录 1",
            Folders: [
                {
                    Title: "二级目录 1",
                    Folders: [
                        {
                            Title: "三级目录 2",
                            Buttons: [
                                {
                                    Title: "按钮 1",
                                },
                                {
                                    Title: "按钮 2",
                                }
                            ]
                        },
                    ],
                    Buttons: [
                        {
                            Title: "按钮 3",
                        },
                        {
                            Title: "按钮 4",
                        }
                    ]
                },
            ],
            Buttons: [
                {
                    Title: "按钮 5",
                },
                {
                    Title: "按钮 6",
                }
            ]
        }
    ],
    Buttons: [
        {
            Icon: Icons.Covert,
            Title: "按钮 7",
        },
        {
            Icon: Icons.Add_PIC,
            Title: "按钮 8",
        }
    ]
})

export default testNavBarModel