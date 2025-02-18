<template>
  <div class="parent">
    <n-card size="huge" embedded :bordered="false">

      <n-tabs
          size="large"
          :tabs-padding="20"
          pane-style="padding: 20px;"
      >
        <n-tab-pane name="录入需求">
          <div class="input-req">
            <div class="input-box">
              <n-input
                  v-model:value="detailRef"
                  type="textarea"
                  placeholder="请录入您的需求"
                  :autosize="{
        minRows: 3,
      }"
              />
            </div>
            <div class="input-button">
              <n-button size="large" color="#8a2be2" @click="goToGenerate">
                开始生成
              </n-button>
            </div>

          </div>
        </n-tab-pane>
        <n-tab-pane name="导入需求文档">
          ROCKLIFE
        </n-tab-pane>

        <n-tab-pane name="会议录音">
          ROCKLIFE
        </n-tab-pane>
      </n-tabs>


    </n-card>


  </div>

</template>

<script setup lang="ts">

import {ref} from 'vue'
import {useRouter} from "vue-router";

// let canGoToGenerate = ref<boolean>(true)
let detailRef = ref<String>()
const router = useRouter()
const goToGenerate = async () => {
  await window.electronAPI.writeUserFile("text-requirement.txt", detailRef.value)
  await router.push("/status")
}
</script>

<style scoped>
.parent {
  width: 80%;
  align-items: center;
  justify-content: center;
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
