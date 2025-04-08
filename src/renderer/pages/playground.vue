<template>
  <div>
    <button @click="reqFun">需求分析</button>
    <button @click="standardsFun">规范定义</button>
    <button @click="dbFun">数据库设计</button>
    <button @click="projectInitFun">项目初始化</button>
    <button @click="apiDesignFun">API Design</button>
    <button @click="codeWriteFun">Write Code</button>
    <button @click="codeReviewFun">Code Review</button>
    <button @click="projectReviewFun">ProjectReview</button>
    <button @click="goHome">back</button>
  </div>
</template>
<script setup lang="ts">

import {CodeWrite} from '../tasks/code-write'
import {DatabaseDesign} from '../tasks/database-design'
import {ProjectReview} from "../tasks/project-review";
import {CodeReview} from "../tasks/code-review";
import {ProjectInit} from "../tasks/project-init";
import {ApiDesign} from "../tasks/api-design";
import {DefiningStandards} from "../tasks/defining-standards";
import {RequirementsAnalyst} from "../tasks/requirements-analyst";
import {useRouter} from 'vue-router'


const router = useRouter()
const goHome = () => {
  router.push(`/`)
};


const execute = async(task: ITask) => {

  const requirement: Requirement = {
    projectName: 'test4',
    id: '2',
    module: '结算和财务管理',
  };


  task.setRequirement(requirement)

  task.execute().subscribe({
    next: output => console.log(output),
    complete: async () => {
      console.log('completed')
    },
    error: async err => {
      console.error(` failed:`, err);
    }
  })
}

const reqFun = async () => {

  let projectInit = new RequirementsAnalyst();
  await execute(projectInit)
}

const dbFun = async () => {

  let projectInit = new DatabaseDesign();
  await execute(projectInit)
}


const projectInitFun = async () => {

  let projectInit = new ProjectInit();
  await execute(projectInit)
}

const apiDesignFun = async () => {

  let projectInit = new ApiDesign();
  await execute(projectInit)
}

const standardsFun = async () => {

  let projectInit = new DefiningStandards();
  await execute(projectInit)
}


const codeWriteFun = async () => {

  let projectInit = new CodeWrite();
  await execute(projectInit)
}



const codeReviewFun = async () => {


  let projectInit = new CodeReview();

  await execute(projectInit)
}


const projectReviewFun = async () => {


  let projectReview = new ProjectReview();

  await execute(projectReview)
}


</script>

<style scoped>
button{ width: 100px;height:30px;margin: 20px}
</style>