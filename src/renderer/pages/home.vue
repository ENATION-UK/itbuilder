<template>
  <div class="body">
    <n-space>
      <!-- 项目列表 -->
      <n-card v-for="(project, index) in projects" :key="index" :title="project.name" :hoverable="true" @click="goDetail(project)"
              style="width: 300px;">
        <template #header-extra>
          <n-space justify="space-between" align="center">
            <n-button @click="handleEditProject(project)">编辑</n-button>
          </n-space>
        </template>
        <n-space vertical>
          <p>{{ project.requirement }}</p>
          <p>{{ project.framework.join(', ') }}</p>
        </n-space>
      </n-card>

      <!-- 创建项目按钮 -->
      <n-button @click="openCreateProjectDialog">创建项目</n-button>
      <n-button @click="goPlay">play</n-button>
      <n-button @click="goPlay1">play1</n-button>

      <!-- 创建项目对话框 -->
      <n-modal v-model:show="createProjectDialogVisible" title="创建项目">
        <n-card style="width: 500px">
          <n-space vertical>

            <n-input v-model:value="newProjectName" placeholder="项目名称"/>

            <n-input
                type="textarea"
                v-model:value="newProjectRequirement" placeholder="项目需求"
            />
            <n-input v-model:value="newProjectFramework" placeholder="框架"/>
            <n-button @click="createProject">创建</n-button>
          </n-space>
        </n-card>
      </n-modal>
    </n-space>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {NCard, NButton, NDialog, NInput, NSpace} from 'naive-ui';
import {ElectronAPI} from '../utils/electron-api';
import { useRouter } from 'vue-router'
import {loadSettings} from "../utils/settings";
const projects = ref([]);
const createProjectDialogVisible = ref(false);
const newProjectName = ref('');
const newProjectRequirement = ref('');
const newProjectFramework = ref('');

const fetchProjects = async () => {
  try {
    const files = await ElectronAPI.listUserFolder('');
    const projectList = [];

    for (const file of files) {
      if (file.type === 'directory') {
        const detailFilePath = `${file.name}/detail.json`;
        if (!await ElectronAPI.userFileExists(detailFilePath)) {
          continue;
        }
        const projectDetail = await ElectronAPI.readUserFile(detailFilePath);
        const project = JSON.parse(projectDetail);

        projectList.push({
          name: file.name,
          requirement: project.requirement || '无需求',
          framework: project.framework || ['未指定框架'],
        });

      }
    }

    projects.value = projectList;
  } catch (error) {
    console.error('读取项目文件失败:', error);
  }
};
const router = useRouter()
const goDetail= (project) => {
   router.push(`/project/${project.name}/ai`)
};

const goPlay= () => {
  router.push(`/play`)
};

const goPlay1= () => {
  router.push(`/play1`)
};


const handleEditProject= (project) => {
  // 打开编辑对话框，并预填项目信息
  // ...
};
const openCreateProjectDialog = () => {
  createProjectDialogVisible.value = true;
};

const createProject = async () => {
  if (!newProjectName.value || !newProjectRequirement.value || !newProjectFramework.value) {
    return;
  }

  const newProjectPath = `${newProjectName.value}`;
  const detail = {
    name: newProjectName.value,
    requirement: newProjectRequirement.value,
    framework: newProjectFramework.value.split(',').map(framework => framework.trim()),
  };

  try {
    // 创建detail.json
    await ElectronAPI.writeUserFile(`${newProjectPath}/detail.json`, JSON.stringify(detail));

    // 创建生成目录
    await ElectronAPI.createUserFolder(`${newProjectPath}/generation`);


    // 创建工作区文件夹
    await ElectronAPI.createUserFolder(`${newProjectPath}/workspace`);
    await ElectronAPI.createUserFolder(`${newProjectPath}/workspace/docs`);
    await ElectronAPI.createUserFolder(`${newProjectPath}/workspace/cods`);
    // 刷新项目列表
    await fetchProjects();
    createProjectDialogVisible.value = false;
  } catch (error) {
    console.error('创建项目失败:', error);
  }
};

onMounted(async () => {
  await loadSettings(); // 确保 settings 加载完成

  // 初始化项目列表
  await fetchProjects();
});

</script>

<style scoped>
.body {
  padding: 20px;
}
</style>