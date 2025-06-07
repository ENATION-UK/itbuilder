<template>
  <n-card>
    <n-space vertical>
      <n-input v-model:value="content" type="text" placeholder="基本的 Input" />
      <n-input
          v-model:value="embeddingValue"
          type="textarea"
          placeholder="Output"
          rows="20"
      />
      <n-button @click="testEmbedding">转换</n-button>
    </n-space>
  </n-card>
</template>
<script setup lang="ts">
  import {ref} from "vue";

  const content = ref<string>('你好World');
  const embeddingValue = ref('')

  async function testEmbedding() {
    if (!content.value) {
      return
    }
    embeddingValue.value = '';
    const result = await window.electronAPI.runEmbedding(content.value);
    console.log(result)
    embeddingValue.value = JSON.stringify(result, null, 2);
  }
</script>

<style scoped>

</style>
