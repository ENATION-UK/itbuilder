<script setup lang="ts">

import {Panel, VueFlow, useVueFlow} from "@vue-flow/core";
import {ref, nextTick, defineProps} from "vue";

import Icon from './Icon.vue'
import TaskNodeView from './task-node.vue'


import {useTaskGraph} from '../utils/taskLoader'
const props = defineProps<{
  name: string;
  id: string;
}>();
const {
  nodes,
  edges,
  logInstRef,
  selectedLogs,
  buildGraph,
  layoutGraph,
  updateLog,
  isRunning,
  stop,
} = useTaskGraph(props.name, props.id);

// 构建任务图并自动布局
buildGraph();
console.log(nodes.value);
</script>


<template>

  <VueFlow v-model:nodes="nodes" v-model:edges="edges" class="flow-container" @nodes-initialized="layoutGraph('RIGHT')"   fit-view-on-init elevate-edges-on-select  >
    <template #node-task="props">
      <TaskNodeView v-bind="props"/>
    </template>

<!--        <Panel class="process-panel" position="top-right">-->
<!--          <div class="layout-panel">-->
<!--            <button v-if="isRunning" class="stop-btn" title="stop" @click="stop">-->
<!--              <Icon name="stop"/>-->
<!--              <span class="spinner"/>-->
<!--            </button>-->
<!--            <button v-else title="start" @click="run()">-->
<!--              <Icon name="play"/>-->
<!--            </button>-->
<!--            <button title="log" @click="logVisible = true">-->
<!--              <Icon name="log"/>-->
<!--            </button>-->
<!--            <button title="set horizontal layout" @click="layoutGraph('RIGHT')">-->
<!--              <Icon name="horizontal"/>-->
<!--            </button>-->

<!--            <button title="set vertical layout" @click="layoutGraph('DOWN')">-->
<!--              <Icon name="vertical"/>-->
<!--            </button>-->
<!--          </div>-->

<!--        </Panel>-->
  </VueFlow>

  <!-- 日志面板 -->
<!--  <NDrawer v-model:show="logVisible" placement="bottom" height="500px">-->
<!--    <NDrawerContent title="日志" style="width: 100%;height: 100%">-->
<!--      <NLog :log="selectedLogs" style="width: 100%;;height: 100%" ref="logInstRef"/>-->
<!--    </NDrawerContent>-->
<!--  </NDrawer>-->

</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.flow-container {
  height: 100vh;
  width: 100%;
}


.layout-flow {
  background-color: #1a192b;
  height: 100%;
  width: 100%;
}

.process-panel,
.layout-panel {
  display: flex;
  gap: 10px;
}

.process-panel {
  background-color: #2d3748;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.process-panel button {
  border: none;
  cursor: pointer;
  background-color: #4a5568;
  border-radius: 8px;
  color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.process-panel button {
  font-size: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-panel {
  display: flex;
  align-items: center;
  gap: 10px;
}

.process-panel button:hover,
.layout-panel button:hover {
  background-color: #2563eb;
  transition: background-color 0.2s;
}

.process-panel label {
  color: white;
  font-size: 12px;
}

.stop-btn svg {
  display: none;
}

.stop-btn:hover svg {
  display: block;
}

.stop-btn:hover .spinner {
  display: none;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>