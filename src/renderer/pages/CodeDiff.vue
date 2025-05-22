<template>
  <div class="code-diff-container">
    <h3>🛠 模型建议代码变更</h3>
    <div ref="diffEditorContainer" class="editor"></div>
    <button class="apply-btn" @click="applyChange">✅ 应用模型建议</button>
  </div>
</template>

<script setup>
import * as monaco from 'monaco-editor'
import { onMounted, ref, onBeforeUnmount } from 'vue'

const props = defineProps({
  originalCode: {
    type: String,
    required: true,
  },
  modifiedCode: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'javascript',
  },
})

const diffEditorContainer = ref(null)
let diffEditorInstance = null

onMounted(() => {
  diffEditorInstance = monaco.editor.createDiffEditor(diffEditorContainer.value, {
    theme: 'vs',
    automaticLayout: true,
    readOnly: true,
    originalEditable: false,
  })

  const originalModel = monaco.editor.createModel(props.originalCode, props.language)
  const modifiedModel = monaco.editor.createModel(props.modifiedCode, props.language)

  diffEditorInstance.setModel({
    original: originalModel,
    modified: modifiedModel,
  })
})

onBeforeUnmount(() => {
  if (diffEditorInstance) {
    diffEditorInstance.dispose()
  }
})

function applyChange() {
  alert('此处应触发代码替换逻辑，比如写回文件、更新副本等')
  // 你可以通过 emit 或 Vuex 将 modifiedCode 应用到实际工程
}
</script>

<style scoped>
.code-diff-container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.editor {
  height: 400px;
  border: 1px solid #444;
  margin-bottom: 1rem;
}

.apply-btn {
  padding: 0.6rem 1rem;
  font-size: 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>