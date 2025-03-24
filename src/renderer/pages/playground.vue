<template>
  <div>
    <button @click="run">Run</button>
    <button @click="goHome">back</button>
  </div>
</template>
<script setup lang="ts">

import {ApiSourceWriter} from '../tasks/api-source-writer'
import {ProjectInit} from "../tasks/project-init";
import {BugFix} from "../tasks/bug-fix";
import {useRouter} from 'vue-router'
import {loadSettings} from "../utils/settings";
import {main} from "../utils/ToolsTest";
import {onMounted} from "vue";

const router = useRouter()
const goHome = () => {
  router.push(`/`)
};


const run = async () => {

  // await loadSettings();
  let apiDeveloper = new BugFix();
  console.log(apiDeveloper.name())
  // const requirement: Requirement = {
  //   projectName: 'test4',
  //   id: '2'
  // };
  //
  //
  // apiDeveloper.setRequirement(requirement)
  // apiDeveloper.execute().subscribe({
  //   next: output => console.log(output),
  //   complete: async () => {
  //     console.log('completed')
  //   },
  //   error: async err => {
  //     console.error(` failed:`, err);
  //   }
  // })
}


</script>