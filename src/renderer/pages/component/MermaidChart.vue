<template>
  <div :id="chartId" class="mermaid"></div>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import mermaid from 'mermaid'

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  idSuffix: {
    type: [String, Number],
    default: ''
  }
})

const chartId = `mermaid-chart-${props.idSuffix}`

const renderChart = async () => {
  try {
    await nextTick()
    const element = document.getElementById(chartId)
    if (!element) return

    // 清除容器内容
    element.innerHTML = ''

    // 生成唯一 ID 防止缓存冲突
    const tempId = `${chartId}-${Date.now()}`

    // 使用 render 方法生成 SVG
    const { svg } = await mermaid.render(tempId, props.code)
    element.innerHTML = svg

  } catch (err) {
    console.error('Mermaid 渲染错误:', err)
    element.innerHTML = '图表渲染失败'
  }
}

onMounted(renderChart)
watch(() => props.code, renderChart)
</script>