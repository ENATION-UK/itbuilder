<template>
    <component   :is="actionComponent"  @cancel="handleCancel"   @submit="handleSubmit"></component>
</template>

<script setup lang="ts">
import { shallowRef, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAction } from '../types/actions'

const route = useRoute()
const router = useRouter()

const type = route.params.type as string
const name = route.params.name as string
const actionConfig = getAction(type)

const actionComponent = shallowRef()
if (actionConfig) {
  // 动态导入对应 action 的组件
  actionConfig.component().then((mod) => {
    actionComponent.value = mod.default
  })
} else {
  console.error('无效的 action 类型', type)
}

// 提交后的处理
const handleSubmit = (nextSeq: string) => {
  router.push(`/project/${name}/generation/${nextSeq}`)
}

const handleCancel = () => {
  router.push({ name: 'home' })
}
</script>