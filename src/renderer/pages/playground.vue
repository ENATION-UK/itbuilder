<script setup>
import {ref, onMounted, nextTick} from 'vue'
import { VueFlow,useVueFlow } from '@vue-flow/core'
import { useLayout } from '../utils/useLayout'
import TaskNodeView from "./task-node.vue";
import {layoutWithElk} from "../utils/elkLayout";
import {ElkNode} from "elkjs/lib/elk.bundled"; // 刚才那段 useLayout 函数


const nodes = ref([
  {
    "id": "RequirementsAnalyst",
    "label": "需求分析",
    "position": {
      "x": 0,
      "y": 0
    },
    "data": {
      "label": "需求分析",
      "status": "wait"
    },
    "type": "task",
    "sourcePosition": "right",
    "targetPosition": "left"
  },
  {
    "id": "DefiningStandards",
    "label": "数据库设计",
    "position": {
      "x": 0,
      "y": 0
    },
    "data": {
      "label": "数据库设计",
      "status": "wait"
    },
    "type": "task",
    "sourcePosition": "right",
    "targetPosition": "left"
  },

  {
    "id": "ApiDeveloper",
    "label": "Api代码编写",
    "position": {
      "x": 0,
      "y": 0
    },
    "data": {
      "label": "Api代码编写",
      "status": "wait",
      "isParent": true
    },
    "type":"group",
    "sourcePosition": "right",
    "targetPosition": "left",
    style: { backgroundColor: 'rgba(16, 185, 129, 0.5)' },
  },
  {
    "id": "CodeWrite",
    "label": "编写代码",
    "position": {
      "x": 0,
      "y": 0
    },
    "data": {
      "label": "编写代码",
      "status": "wait"
    },
    "type": "task",
    "sourcePosition": "right",
    "targetPosition": "left",
    "parentNode": "ApiDeveloper"
  },
  {
    "id": "CodeReview",
    "label": "代码审查",
    "position": {
      "x": 0,
      "y": 0
    },
    "data": {
      "label": "代码审查",
      "status": "wait"
    },
    "type": "task",
    "sourcePosition": "right",
    "targetPosition": "left",
    "parentNode": "ApiDeveloper"
  },
])

const edges = ref([

  {
    "id": "edge-RequirementsAnalyst-DefiningStandards",
    "source": "RequirementsAnalyst",
    "target": "DefiningStandards",
    "markerEnd": "arrowclosed"
  },

  {
    "id": "edge-DefiningStandards-ApiDeveloper",
    "source": "DefiningStandards",
    "target": "ApiDeveloper",
    "markerEnd": "arrowclosed"
  },
  {
    "id": "edge-CodeWrite-CodeReview",
    "source": "CodeWrite",
    "target": "CodeReview",
    "markerEnd": "arrowclosed",

  }
])

const layoutedNodes = ref([])
const layoutedEdges = ref([])

// onMounted(async () => {
//   const result = await layoutWithElk(nodes.value, edges.value)
//   layoutedNodes.value = result.nodes
//   layoutedEdges.value = result.edges
// })
const {fitView,findNode} = useVueFlow();
const { getNodes, getEdges, updateNodePositions } = useVueFlow()

async function layoutGraph(direction) {

  const result = await layoutWithElk(nodes.value, edges.value, findNode)
  nodes.value = result.nodes
  edges.value = result.edges
  nextTick(() => fitView());
}
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges" class="flow-container"   @nodes-initialized="layoutGraph"  fit-view-on-init elevate-edges-on-select   >
    <template #node-task="props">
      <TaskNodeView v-bind="props"/>
    </template>
  </VueFlow>
</template>
<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.flow-container {
  height: 100vh;
  width: 100%;
}

</style>