import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMenuStore = defineStore('menu', () => {
    const forcedActiveIndex = ref<number | null>(null)

    // 设置强制激活的菜单项
    const setForcedActiveIndex = (index: number | null) => {
        forcedActiveIndex.value = index
    }

    return {
        forcedActiveIndex,
        setForcedActiveIndex,
    }
})