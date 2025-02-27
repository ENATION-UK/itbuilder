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
                  style="height: 500px"
              />
            </div>
            <div class="input-button">
              <n-button size="large" color="#8a2be2" @click="goToGenerate" :disabled="!detailRef">
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
import { defineProps } from 'vue';

import {ref} from 'vue'
import {ElectronAPI} from '../utils/electron-api';
import { useRouter } from 'vue-router'
let detailRef = ref<string>()

const props = defineProps<{
  name: string;
}>();
const router = useRouter()
const goToGenerate = async () => {

  // const nextSeq = await getNextRequirementDir(); // 获取下一个需求目录
  // const filePath = await ElectronAPI.pathJoin(props.name,  nextSeq.toString(), 'text-requirement.txt'); // 获取需求文件路径
  // await ElectronAPI.writeUserFile(filePath, detailRef.value); // 保存需求内容


  await router.push(`/project/${props.name}/generation/3`)
}

// 获取下一个需求序号并创建对应的文件夹
const getNextRequirementDir = async () => {
  const folderList = await ElectronAPI.listUserFolder(props.name+"/generation");
  const sortedDirs = folderList
      .filter(file => file.type === 'directory') // 过滤出文件夹
      .map(file => parseInt(file.name)) // 获取文件夹名并转换为数字
      .sort((a, b) => a - b); // 按序号排序

  const nextSeq = sortedDirs.length > 0 ? sortedDirs[sortedDirs.length - 1] + 1 : 1; // 获取下一个序号
  // const nextReqDir = await ElectronAPI.pathJoin(rootDir, nextSeq.toString()); // 生成下一个需求目录路径
  // await ElectronAPI.writeUserFile(nextReqDir, ''); // 创建目录
  return   nextSeq;
};

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
