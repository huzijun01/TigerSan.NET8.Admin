import { defineStore } from 'pinia'
import { UserInfo } from '@/models'

/* 仓库 */
export const useUserInfo = defineStore('userInfo', () => {
    return new UserInfo()
})