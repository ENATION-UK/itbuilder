<template>
  <div>
    <button @click="run">Run</button>
  </div>
</template>
<script setup lang="ts">

import { UISourceWriter } from '../tasks/ui-source-writer'
const  apiDeveloper = new UISourceWriter();

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