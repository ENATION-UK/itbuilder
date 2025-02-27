<script setup lang="ts">

import {TaskScheduler} from '../types/task-scheduler'
import {Panel, VueFlow, useVueFlow} from "@vue-flow/core";
import {ref, nextTick, defineProps} from "vue";
import {useLayout} from '../utils/useLayout'

import Icon from './Icon.vue'
import TaskNodeView from './task-node.vue'

import type {TaskNode, TaskEdge, ITaskGraph} from "../types/ITaskGraph";
import {LogInst} from "naive-ui";
import { useRoute } from 'vue-router';

const tasks = import.meta.glob('../tasks/*.{ts,js}', {eager: true});

const nodes = ref<TaskNode[]>([]);
const edges = ref<TaskEdge>([]);
// 选中的日志数据
const logVisible = ref(false);
const {onNodeClick} = useVueFlow();
const logInstRef = ref<LogInst | null>(null)

const props = defineProps<{
  name: string;
  id: string; //需求id
}>();


function optimizeDependencies(taskMap: Map<string, ITask>): Map<string, string[]> {
  const optimizedMap = new Map<string, string[]>();

  // 遍历每个任务
  taskMap.forEach((task, taskName) => {
    const dependencies = task.dependencies();
    const optimizedDependencies = new Set<string>(dependencies);

    // 遍历每个依赖关系
    dependencies.forEach(dep => {
      // 获取依赖任务的依赖关系
      const depTask = taskMap.get(dep);
      if (depTask) {
        const depDependencies = depTask.dependencies();

        // 检查当前任务的依赖是否可以通过依赖任务的依赖关系间接满足
        depDependencies.forEach(depDep => {
          if (optimizedDependencies.has(depDep)) {
            optimizedDependencies.delete(depDep);
          }
        });
      }
    });

    // 将优化后的依赖关系存入新的 Map
    optimizedMap.set(taskName, Array.from(optimizedDependencies));
  });

  return optimizedMap;
}


function loadInternalPlugins() {
  const plugins: ITask[] = [];
  for (const path in tasks) {
    const module = tasks[path];
    const taskClass = Object.values(module)[0] as new () => ITask;
    plugins.push(new taskClass());
  }
  return plugins;
}

const loadedTasks = loadInternalPlugins();

function buildGraph() {

  const taskMap = new Map<string, ITask>();

  // 创建任务映射
  loadedTasks.forEach((task) => {
    taskMap.set(task.id(), task);
  });
  let taskDes: Map<string, string[]> = optimizeDependencies(taskMap)
  // 计算任务的层级
  const levels = new Map<string, number>();


  function getLevel(taskName: string): number {
    if (levels.has(taskName)) return levels.get(taskName)!;

    const task = taskMap.get(taskName);
    if (!task) return 0;

    if (task.dependencies().length === 0) {
      levels.set(taskName, 0);
      return 0;
    }

    const maxDepLevel = Math.max(...task.dependencies().map(getLevel));
    levels.set(taskName, maxDepLevel + 1);
    return maxDepLevel + 1;
  }

  loadedTasks.forEach(task => getLevel(task.id()));

  // 根据层级排序
  const sortedTasks = [...loadedTasks].sort((a, b) => getLevel(a.id()) - getLevel(b.id()));

  nodes.value = sortedTasks.map((task) => {
    return {
      id: task.id(),
      label: task.name(),
      position: {x: 0, y: 0},
      data: {label: task.name(), status: 'wait'},
      type: 'task',
      sourcePosition: "right",  // **右侧出线**
      targetPosition: "left",   // **左侧进线**
    };
  });

  // 生成边，去重
  const edgeSet = new Set<string>();

  edges.value = sortedTasks.flatMap((task) =>
      task.dependencies()
          .filter(dep => taskDes.get(task.id())?.includes(dep))
          .filter(dep => taskMap.has(dep))
          .map(dep => {
            const edgeId = `${dep}-${task.id()}`;
            if (edgeSet.has(edgeId)) return null;  // 避免重复边
            edgeSet.add(edgeId);
            return {
              id: `edge-${dep}-${task.id()}`,
              source: dep,
              target: task.id(),
              markerEnd: "arrowclosed", // 终点箭头
              // animated: true, // **流动效果（可选）**

            };
          })
  ).filter(edge => edge !== null);

}

const {layout} = useLayout()

const {fitView} = useVueFlow()

async function layoutGraph(direction) {
  nodes.value = layout(nodes.value, edges.value, direction)
  nextTick(() => {
    fitView()
  })
}

let isRunning = ref(false);
const stop = async () => {
  isRunning.value = false;

}


buildGraph();
let taskGraph: ITaskGraph = {
  nodes: nodes.value,
  edges: edges.value
}
const route = useRoute();
const requirement: Requirement = {
  projectName: props.name,
  id: props.id
};

const scheduler = new TaskScheduler(requirement,loadedTasks, taskGraph);
scheduler.loadTaskStatus()

const selectedLogs = ref<string>('');


const updateLog = ( output: string) => {
   selectedLogs.value += output;
  nextTick(() => {
    logInstRef.value?.scrollTo({position: 'bottom', silent: true})
  })
};

const run = () => {
  isRunning.value = true;
  logVisible.value=true;
  scheduler.run().then(observable => {
    observable.subscribe({
      next: ({ output}) => updateLog( output),
      complete: () => console.log("所有任务执行完成！"),
    });
  });

};


</script>


<template>
  <VueFlow v-model:nodes="nodes" v-model:edges="edges" class="flow-container" @nodes-initialized="layoutGraph('LR')">
    <template #node-task="props">
      <TaskNodeView v-bind="props"/>
    </template>

    <Panel class="process-panel" position="top-right">
      <div class="layout-panel">
        <button v-if="isRunning" class="stop-btn" title="stop" @click="stop">
          <Icon name="stop"/>
          <span class="spinner"/>
        </button>
        <button v-else title="start" @click="run()">
          <Icon name="play"/>
        </button>
        <button   title="log" @click="logVisible = true">
          <Icon name="log"/>
        </button>
        <button title="set horizontal layout" @click="layoutGraph('LR')">
          <Icon name="horizontal"/>
        </button>

        <button title="set vertical layout" @click="layoutGraph('TB')">
          <Icon name="vertical"/>
        </button>
      </div>


    </Panel>
  </VueFlow>

  <!-- 日志面板 -->
  <NDrawer v-model:show="logVisible" placement="bottom" height="500px">
    <NDrawerContent title="日志" style="width: 100%;height: 100%">
      <NLog :log="selectedLogs" style="width: 100%;;height: 100%" ref="logInstRef"/>
    </NDrawerContent>
  </NDrawer>

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