import { defineStore } from 'pinia'

export const useFlowStore = defineStore('flow', {
    state: () => ({
        currentFlowId: null as string | null,
    }),
    actions: {
        setFlowId(id: string) {
            this.currentFlowId = id
        },
        clearFlowId() {
            this.currentFlowId = null
        }
    },
})