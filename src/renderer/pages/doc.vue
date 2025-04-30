<template>
  <div>
    <div v-for="module in modules" :key="module" class="module-card">
      <h2>{{ module }}</h2>
      <div :id="`mermaid-container-${module}`" class="mermaid-container">
        <div v-if="errors[module]" class="error-message">
          <p>渲染失败：{{ errors[module] }}</p>
          <a href="#" @click.prevent="editMermaid(module)">✏️ 编辑 Mermaid 源码</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup  lang="ts">
import {onMounted, nextTick, ref, defineProps} from 'vue'
import mermaid from 'mermaid'
import { extractCode } from '../utils/TaskUtil'
import { ElectronAPI } from '../utils/electron-api'
import {getProjectPath} from "../utils/project";
const props = defineProps<{
  name: string
}>();

const modules = ref([])
const errors = ref({})


async function  getModules()   {
  const projectFolderPath=await getProjectPath(props.name);
  const moduleFolderPath=await ElectronAPI.pathJoin(projectFolderPath, "modules")
  const folders = await ElectronAPI.listFolder(moduleFolderPath);

  return folders.filter((folder) => folder.type === 'directory').map((folder) => folder.name)
}

// 点击“编辑”按钮
function editMermaid(moduleName) {
  const filePath = `${props.name}/modules/${moduleName}/flow.txt`
  ElectronAPI.openUserFile(filePath)
}

onMounted(async () => {
  // 获取模块列表
  modules.value = await getModules()
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose'
  })

  await nextTick()

  for (const moduleName of modules.value) {
    const filePath = `${props.name}/modules/${moduleName}/flow.txt`
    const containerId = `mermaid-container-${moduleName}`
    const container = document.getElementById(containerId)

    try {
      let mermaidCode = await ElectronAPI.readUserFile(filePath)
      mermaidCode = extractCode(mermaidCode)

      if (container) {
        const { svg } = await mermaid.render(`graph-${moduleName}`, mermaidCode)
        container.innerHTML = svg
      }
    } catch (err) {
      console.error(`模块 [${moduleName}] 渲染失败：`, err)
      errors.value[moduleName] = err.message || String(err)
    }
  }
})
</script>

<style scoped>
.module-card {
  display: inline-block;
  vertical-align: top;
  margin: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 容器用于横向排列所有模块 */
div > .module-card {
  width: fit-content;
  max-width: 100%;
}

/* 父容器使用flex排版 */
div {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;
}

/* Mermaid 渲染图容器样式 */
.mermaid-container svg {
  width: 100% !important; /* Mermaid 渲染有时未自动设定宽度，这里强制宽度 */
  height: auto;
  max-width: 100%;
  display: block;
}

/* 错误信息样式 */
.error-message {
  width: 200px;
  color: red;
  font-size: 0.9rem;
  background-color: #fff0f0;
  border: 1px solid #ffcccc;
  border-radius: 6px;
  padding: 0.5rem;
  margin-top: 0.5rem;
}
</style>