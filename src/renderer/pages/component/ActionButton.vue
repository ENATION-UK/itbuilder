<template>
  <n-button
      round
      size="small"
      color="#ff69b4"
      @click="startAction"
  >
    {{ action.name }}
  </n-button>
</template>

<script setup lang="ts">
import {useRouter} from 'vue-router'
import {useFlowStore} from '../../stores/useFlowStore'
const props= defineProps<{
  action: Action,
  flowId: string
}>()

const router = useRouter()
const flowStore = useFlowStore()

const startAction = () => {
  flowStore.setFlowId(props.flowId)
  router.push({name: 'action', params: {type: props.action.type}})
}
</script>