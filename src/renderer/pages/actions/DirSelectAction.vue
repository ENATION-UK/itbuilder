<template>
  <button @click="selectFolder">选择文件夹</button>
</template>

<script setup lang="ts">

import {defineProps, onMounted} from 'vue';

import {ref} from 'vue'
import {ElectronAPI} from '../../utils/electron-api';
import { useRouter } from 'vue-router'
import { useMenuStore } from '../../stores/useMenuStore'
const menuStore = useMenuStore()

let detailRef = ref<string>()
const emit = defineEmits(['submit', 'cancel'])
const props = defineProps<{
  name: string;
}>();
const selectFolder = async () => {
  const folderPath = await window.electronAPI.selectFolder();
  if (folderPath) {
    emit('submit',  folderPath)
  }
};


</script>

<style scoped>
.parent {
  width: 100%;
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
