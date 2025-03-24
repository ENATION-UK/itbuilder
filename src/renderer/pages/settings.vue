<script setup lang="ts">
import {onMounted} from 'vue';
import {settings, loadSettings, saveSettings} from '../utils/settings';
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome= () => {
  router.push(`/`)
};

const supplierOptions = [
  {label: '阿里云通义千问', value: 'tongyi'},
  {label: 'DeepSeek', value: 'DeepSeek'},
  {label: 'OpenAI', value: 'OpenAI'}
];

const modelOptions = [
  {label: 'qwen-long', value: 'qwen-long'},
  {label: 'qwen-max', value: 'qwen-max'},
  {label: 'qwen-plus', value: 'qwen-plus'},
  {label: 'qwen-turbo', value: 'qwen-turbo'}
];
onMounted(() => {
  loadSettings();
});

</script>
<template>
  <n-card :title="$t('settings')" style="margin-bottom: 16px">
    <button @click="goHome">back</button>

    <n-tabs type="line" animated>
      <n-tab-pane name="model" tab="模型">
        <n-form>
          <n-form-item-row label="模型提供方:">
            <n-select v-model:value="settings.supplierSelected" :options="supplierOptions"/>
          </n-form-item-row>

          <n-form-item-row label="API秘钥">
            <n-row>
              <n-col span="24">
                <n-col span="24">
                  <n-dynamic-tags v-model:value="settings.apiKey"/>
                </n-col>
                <n-alert type="info" style="margin-top: 20px">
                  配置多个秘钥可以增加模型调用的并发数,注意需要不同账号下的秘钥才有效
                </n-alert>
              </n-col>

            </n-row>
          </n-form-item-row>

          <n-form-item-row label="API域名">
            <n-input v-model:value="settings.apiUrl" placeholder="API域名"/>
          </n-form-item-row>

          <n-form-item-row label="模型">
            <n-select v-model:value="settings.modelName" :options="modelOptions"/>
          </n-form-item-row>

          <n-form-item-row label="Max Token">
            <n-input v-model:value="settings.maxToken" placeholder="Max Token"/>
          </n-form-item-row>
        </n-form>

        <n-button type="primary" block secondary strong @click="saveSettings">
          保存
        </n-button>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>
<style scoped lang="scss">

</style>