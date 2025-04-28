<template>
  <div>
    <h2>文本录入</h2>
    <input v-model="text" placeholder="请输入文本..." />
    <button @click="submit">提交</button>
    <button @click="$emit('cancel')">取消</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const text = ref('')

const submit = () => {
  emit('submit', { text: text.value })
}
</script>