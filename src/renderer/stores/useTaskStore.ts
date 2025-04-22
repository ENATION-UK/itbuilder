// stores/useTaskStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskStore = defineStore('task', () => {
    const completedTasksSet = ref(new Set<string>())

    // 封装和 Set 类似的方法
    const add = (taskId: string) => completedTasksSet.value.add(taskId)
    const deleteTask = (taskId: string) => completedTasksSet.value.delete(taskId)
    const has = (taskId: string): boolean => completedTasksSet.value.has(taskId)
    const clear = () => completedTasksSet.value.clear()

    const size = computed(() => completedTasksSet.value.size)
    const values = computed(() => Array.from(completedTasksSet.value))

    return {
        // 原始数据
        completedTasksSet,

        // 类似 Set 的方法
        add,
        delete: deleteTask,
        has,
        clear,
        size,
        values
    }
})