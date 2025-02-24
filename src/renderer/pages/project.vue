<template>
  <div class="view">
    <div class="menu">
      <Menu />
    </div>
    <div class="body">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import Menu from '../components/menu.vue'
</script>

<style lang="scss" scoped>
.view {
  display: flex;
  width: 100vw;
  height: 100vh;
}
.menu {
  flex-shrink: 0;
  margin-right: 5px;
}
.body {
  flex: 1;
  display: flex;
  //align-items: center;
  //justify-content: center;
}
</style>
