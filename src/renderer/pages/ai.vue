<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue'
import MermaidChart from './component/MermaidChart.vue'
import {useTaskGraph} from "../utils/task-loader";
import ActionButton from "./component/ActionButton.vue"
import type {TaskEdge, TaskNode} from "../types/ITaskGraph";
import {flows} from '../ai-flow'
// 如果需要响应式（比如要在页面上动态修改 flows）
const flowsRef = ref(flows)

// 构建 Mermaid 流程图
function buildMermaidGraph(nodes: TaskNode[], edges: TaskEdge[]): string {
  const nodeMap = new Map<string, TaskNode>()
  nodes.forEach(node => nodeMap.set(node.id, node))

  const lines: string[] = []
  lines.push(`graph LR`)

  const parentMap = new Map<string, TaskNode[]>()

  nodes.forEach(node => {
    if (node.parentNode) {
      const list = parentMap.get(node.parentNode) || []
      list.push(node)
      parentMap.set(node.parentNode, list)
    }
  })

  nodes.forEach(node => {
    if (node.data?.isParent) {
      lines.push(`subgraph ${node.id}["${node.label}"]`)
      const children = parentMap.get(node.id) || []
      children.forEach(child => {
        lines.push(`${child.id}["${child.label}"]`)
      })
      lines.push(`end`)
    } else if (!node.parentNode) {
      lines.push(`${node.id}["${node.label}"]`)
    }
  })

  edges.forEach(edge => {
    lines.push(`${edge.source} --> ${edge.target}`)
  })

  return lines.join('\n')
}

// 初始化，生成各组 diagram
onMounted(async () => {
  for (let group of flowsRef.value) {
    const {nodes, edges, buildNodes} = useTaskGraph(group.tasks)
    buildNodes()
    await nextTick()

    group.diagram = buildMermaidGraph(nodes.value, edges.value)
  }
})
</script>

<template>
  <div class="container">
    <div v-for="flow in flowsRef" :key="flow.id" class="block">
      <h2 class="title">{{ flow.name }}</h2>
      <div class="text">{{ flow.description }}</div>
      <div class="diagram">
        <MermaidChart v-if="flow.diagram" :code="flow.diagram" :idSuffix="flow.id.toString()"/>
      </div>
      <div class="btn-box">
        <ActionButton :action="flow.action"  :flow-id="flow.id"/>
      </div>
    </div>
  </div>
</template>

<style>

h2.title {
  font-size: 16px;

}

.container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.container .text {
  font-size: 12px
}

.block {
  width: 500px;
  height: 500px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.diagram {
  margin-top: 20px;
  width: 450px;
}

.btn-box {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}
</style>