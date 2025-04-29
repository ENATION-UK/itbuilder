<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'

// 🧩 定义 Props
const props = defineProps<{
  modelValue: string
  language?: string
  theme?: string
  options?: monaco.editor.IStandaloneEditorConstructionOptions
}>()

// 🧩 定义 Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorContainer = ref<HTMLDivElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 🧩 创建编辑器
onMounted(() => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language || 'plaintext',
      theme: props.theme || 'vs',
      automaticLayout: true,
      readOnly: props.options?.readOnly ?? false,
      fontSize: props.options?.fontSize ?? 14,
      ...props.options, // 把剩下的 options 合进去
    })

    // 📦 监听编辑器内容变化，更新 v-model
    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue() || ''
      emit('update:modelValue', value)
    })
  }
})

// 🧩 监听外部 v-model 更新内容
watch(
    () => props.modelValue,
    (newVal) => {
      if (editor && editor.getValue() !== newVal) {
        editor.setValue(newVal)
      }
    }
)

// 🧩 监听 language 变化
watch(
    () => props.language,
    (newLang) => {
      if (editor && newLang) {
        monaco.editor.setModelLanguage(editor.getModel()!, newLang)
      }
    }
)

// 🧩 监听 theme 变化
watch(
    () => props.theme,
    (newTheme) => {
      if (newTheme) {
        monaco.editor.setTheme(newTheme)
      }
    }
)

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
}
</style>