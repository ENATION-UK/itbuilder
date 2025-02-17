<script setup>
import { computed, toRef } from 'vue'
import {Handle} from "@vue-flow/core";


const props = defineProps({
  data: Object,
  id: String,
  sourcePosition: String,
  targetPosition: String
})
</script>
<template>
  <div class="custom-node">
    <div :class="data.status"></div>
    <div>{{ data.label }}</div>
    <Handle type="target" :position="targetPosition" />
    <Handle type="source" :position="sourcePosition" />
  </div>
</template>
<style scoped lang="scss">
/* 共同的样式 */
.spinner {
  border: 3px solid #f3f3f3;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  margin-top: 3px;
}

/* 等待状态的样式 */
.wait {
  /* 使用共同的样式 */
  @extend  .spinner;
}

/* 运行状态的样式 */
.running {
  /* 使用共同的样式 */
  @extend  .spinner;
  border-top: 3px solid #2563eb;
  animation: spin 1s linear infinite;
}

.completed {
  @extend  .spinner;
  border-color: green;
}

.failed{
  @extend  .spinner;
  border-color: darkred;
}
/* 定义旋转动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.custom-node {
  display: flex;  /* 让子元素横向排列 */
  gap: 5px; /* 控制间距 */

  padding: 10px;
  border: 0px solid black;
  background: #eceaea;
  text-align: center;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>