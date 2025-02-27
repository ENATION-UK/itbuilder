<template>
  <div>
    <button @click="run">Run</button>
  </div>
</template>
<script setup lang="ts">

import { ApiSourceWriter } from '../tasks/api-source-writer'
import { main } from '../utils/ToolsTest'
import {ElectronAPI} from "../utils/electron-api";
const  apiDeveloper = new ApiSourceWriter();
const requirement: Requirement = {
  projectName: 'test',
  id: '3'
};


apiDeveloper.setRequirement(requirement)
const run = () => {
      apiDeveloper.execute().subscribe({
        next: output => console.log(output),
        complete: async () => {
          console.log('completed')
        },
        error: async err => {
          console.error(` failed:`, err);
        }
      })
    }


</script>