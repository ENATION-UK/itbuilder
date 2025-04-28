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

const {action} = defineProps<{
  action: Action
}>()

const router = useRouter()


const startAction = () => {

  router.push({name: 'action', params: {type: action.type}})
}
</script>