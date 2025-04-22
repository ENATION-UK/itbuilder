<script setup  lang="ts">

import { ProjectReview } from '../tasks/code/project-review'

const requirement: Requirement = {
  projectName:"test4",
  id:"4",
  module:"内容创作及发布模块"
};

const task = new ProjectReview();
task.setRequirement(requirement)

const run = async () => {
  await task.execute().subscribe((data) => {
    console.log(data);
  });
};



</script>

<template>
 <button @click="run">run</button>
</template>
<style>


</style>