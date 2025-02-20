<template>
  <div class="parent">
    <h1 class="title">项目构建</h1>

    <div class="step-wrapper">
      <n-steps>
        <n-step
            title="需求分析"
            :status="result?.analysis.status"
        >
          <n-progress type="circle" :percentage="result?.analysis.percentage"/>

        </n-step>
        <n-step
            title="架构"
            :status="result?.architecture.status"
        >
          <n-progress type="circle" :percentage="result?.architecture.percentage"/>

        </n-step>
        <n-step
            title="编码"
            :status="result?.code.status"
        >
          <n-progress type="circle" :percentage="result?.code.percentage"/>

        </n-step>
        <n-step
            title="文档书写"
            :status="result?.doc.status"

        >
          <n-progress type="circle" processing :percentage="result?.doc.percentage"/>

        </n-step>
      </n-steps>
    </div>
    <div class="log-wrapper">
      <n-card title="构建日志" size="huge">

        <n-log
            ref="logInstRef"
            :rows="5"
            :log="log"
        />
      </n-card>
    </div>

  </div>

</template>

<script setup lang="ts">
import type {ProjectResult} from "../types/TextRequirement.ts";
const logInstRef = ref<LogInst | null>(null)

import {onMounted, onUnmounted, ref,nextTick} from 'vue'
import type {LogInst} from "naive-ui";
import {TaskScheduler} from "../types/task-scheduler";
const tasks = import.meta.glob('../worker/*.{ts,js}', { eager: true });

// 创建响应式变量
const result = ref<ProjectResult | null>(null);
const log = ref<string>("");


function loadInternalPlugins() {
  const plugins: ITask[] = [];
  for (const path in tasks) {
    const module = tasks[path];
    const taskClass = Object.values(module)[0] as new () => ITask;
    plugins.push(new taskClass());
  }
  return plugins;
}

const plugins = loadInternalPlugins();

console.log(plugins)


const updateLog = (output: string) => {
  log.value = log.value + output; // 更新响应式数据

  nextTick(() => {
    logInstRef.value?.scrollTo({position: 'bottom', silent: true})
  })
};


// 组件挂载时初始化 SSE
onMounted(  () => {
  const scheduler = new TaskScheduler(plugins);
  scheduler.run().then(observable => {
    observable.subscribe({
      next: ({output }) =>updateLog(output) ,
      complete: () => updateLog("所有任务执行完成！"),
    });
  });

});

// 组件卸载时清理 SSE
onUnmounted(() => {

});


</script>

<style scoped>

.parent {
  width: 80%;
  align-items: center;
  justify-content: center;
}

.title {
  text-align: center;
}

.step-wrapper, .log-wrapper {
  margin-left: 160px;
}

.log-wrapper {
  margin-top: 50px;
  margin-right:160px
}

.input-box, .input-button {
  display: flex;
  justify-content: center; /* 横向居中 */
  align-items: center; /* 纵向居中 */
}

.input-button {
  margin-top: 30px;
}
</style>
