<template>
  <div class="container">

    <div v-for="(flow, index) in flows" :key="flow.id" class="block">
      <h2 class="title">{{ flow.name }}</h2>
      <div class="text">{{ flow.description }}</div>
      <div class="diagram">
        <MermaidChart :code="flow.diagram" :idSuffix="flow.id"/>
      </div>
      <div class="btn-box">
        <ActionButton :action="flow.action" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick, computed, defineProps} from 'vue'

import MermaidChart from './MermaidChart.vue'
import type {TaskEdge, TaskNode} from "../types/ITaskGraph";
import {useTaskGraph} from "../utils/task-loader";
import { useRouter, useRoute } from 'vue-router'
import {actions} from "../types/actions";
import ActionButton from "./ActionButton.vue";
const router = useRouter()
const route = useRoute()


interface FlowData {
  id: number;
  name: string;
  diagram: string;
  description: string;
  action:Action
}

const flows = ref<FlowData[]>([])

// 这里是不同的任务组（可以继续扩展）
const taskGroups: { tasks: string[]; description: string, name: string,action:Action}[] = [
  {
    name: '从零开始',
    tasks: ['RequirementsAnalyst', 'ProjectInit', 'Architecture', 'DocWrite'],
    description: '从零开始创建一个项目',
    action: actions.TEXT_INPUT
  },
  {
    name: '导入项目',
    tasks: ['RequirementsAnalyst', 'Architecture', 'DocWrite'],
    description: '导入一个现有项目，以便后续使用',
    action: actions.DIR_SELECT

  },
  {
    name: '需求变更',
    tasks: ['RequirementsAnalyst', 'ProjectInit', 'Architecture'],
    description: '基于现有需求，针对新需求进行开发',
    action: actions.TEXT_INPUT

  }
]

// 构建 Mermaid 流程图
function buildMermaidGraph(nodes: TaskNode[], edges: TaskEdge[], graphId: string): string {
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

onMounted(async () => {
  const tempFlows: FlowData[] = []

  for (let i = 0; i < taskGroups.length; i++) {
    const group = taskGroups[i]
    const {nodes, edges, buildNodes} = useTaskGraph(group.tasks)
    buildNodes()
    await nextTick()

    const diagram = buildMermaidGraph(nodes.value, edges.value, `flow-${i}`)
    tempFlows.push({
      id: i,
      name: group.name,
      diagram,
      description: group.description,
      action: group.action
    })
  }

  flows.value = tempFlows

})
</script>


<style>

h2.title {
  font-size: 14px;

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