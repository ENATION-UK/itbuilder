<template>
  <div class="code-viewer">
    <!-- 左侧目录树 -->
    <n-tree
        v-if="treeData.length"
        :data="treeData"
        :block-line="true"
        :expand-on-click="true"
        :render-prefix="renderPrefix"
        @update:selected-keys="handleSelect"
    />

    <!-- 右侧代码编辑器 -->
    <div class="editor-container">
      <MonacoEditor
          v-if="currentCode !== null"
          v-model="currentCode"
          :language="currentLanguage"
          :theme="'vs'"
          :options="{ readOnly: true, fontSize: 14 }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, defineProps} from 'vue'
import { NTree } from 'naive-ui'
import MonacoEditor from './component/MonacoEditor.vue'
import {ElectronAPI} from "../utils/electron-api";
const props = defineProps<{
  name: string;
  id: string;
}>();



interface TreeNode {
  label: string
  key: string
  isLeaf: boolean
  children?: TreeNode[]
}

const treeData = ref<TreeNode[]>([])
const currentCode = ref<string | null>(null)
const currentLanguage = ref<string>('plaintext')

/**
 * 加载目录树
 */
async function loadFolder(folderPath: string): Promise<TreeNode[]> {
  const items = await ElectronAPI.listFolder(folderPath)
  const nodes: TreeNode[] = await Promise.all(
      items.map(async (item) => {
        if (item.type === 'directory') {
          return {
            label: item.name,
            key: item.path,
            isLeaf: false,
            children: await loadFolder(item.path) // 递归子目录
          }
        } else {
          return {
            label: item.name,
            key: item.path,
            isLeaf: true
          }
        }
      })
  )
  return nodes
}

/**
 * 选中文件
 */
async function handleSelect(keys: string[]) {
  const path = keys[0]
  if (!path) return

  const node = findNodeByKey(treeData.value, path)
  if (node?.isLeaf) {
    const content = await ElectronAPI.readFile(path)
    currentCode.value = content
    currentLanguage.value = detectLanguage(path)
  }
}

/**
 * 渲染文件/文件夹图标
 */
function renderPrefix({ option }: { option: TreeNode }) {
  if (option.isLeaf) {
    return '📄'
  } else {
    return '📁'
  }
}

/**
 * 查找节点
 */
function findNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
  for (const node of nodes) {
    if (node.key === key) {
      return node
    }
    if (node.children) {
      const found = findNodeByKey(node.children, key)
      if (found) return found
    }
  }
  return null
}

/**
 * 根据文件扩展名识别语言
 */
function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'js':
      return 'javascript'
    case 'ts':
      return 'typescript'
    case 'vue':
      return 'vue'
    case 'json':
      return 'json'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'scss':
      return 'scss'
    case 'md':
      return 'markdown'
    case 'py':
      return 'python'
    case 'go':
      return 'go'
    case 'java':
      return 'java'
    case 'c':
      return 'c'
    case 'cpp':
      return 'cpp'
    case 'sh':
      return 'shell'
    default:
      return 'plaintext'
  }
}

// 🚀 挂载时加载根目录
onMounted(async () => {
  ElectronAPI.pathJoin(props.name)
  const moduleFolderPath=await ElectronAPI.pathJoin(props.name,"project")

  treeData.value = await loadFolder('/Users/wangfeng/Library/Application Support/itBuilder/Projects/test4/project')
})
</script>

<style scoped>
.code-viewer {
  display: flex;
  height: 100%;
}
.n-tree {
  width: 280px;
  border-right: 2px solid #f3f4f6;
  overflow-y: auto;
}
.editor-container {
  flex: 1;
  padding: 8px;
  overflow: hidden;
}
</style>