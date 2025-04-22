<template>
  <div class="menu">
    <!-- <div class="ib-logo"></div> -->

    <!-- 循环渲染图标 -->
    <n-icon
        v-for="(icon, index) in icons"
        :key="index"
        :size="35"
        :class="['item', { active: icon.active }]"
        @click="navigateTo(index)"
    >
      <component :is="icon.component" />
    </n-icon>
  </div>
</template>

<script setup lang="ts">
import {ref, shallowRef, watchEffect} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Code20Regular, Window16Regular, DocumentOnePage20Regular,Settings24Filled,Flow20Regular } from '@vicons/fluent'
import { ArrowBackCircle } from '@vicons/ionicons5'
import Ai from '../assets/AI.svg'

// 使用 ref 包裹 icons
const icons = shallowRef([
  { component: Ai, route: '/ai', active: false },
  { component: DocumentOnePage20Regular, route: '/play', active: false },
  { component: Code20Regular, route: '/about', active: false },
  { component: Flow20Regular, route: '/project/test4/generation/4', active: false },
  { component: Window16Regular, route: '/play/ui', active: false },
  { component: DocumentOnePage20Regular, route: '/play/doc', active: false },
  { component: Settings24Filled, route: '/settings', active: false },
  { component: ArrowBackCircle, route: '/', active: false },
])

// 路由管理
const router = useRouter()
const route = useRoute() // 获取当前路由信息

// 设置默认的 activeIndex
const activeIndex = ref(0)

// 路由跳转
const navigateTo = (index: number) => {


  activeIndex.value = index
  router.push(icons.value[index].route)
}

// 监听路由变化，更新 actived 状态
watchEffect(() => {
  const currentRoute = route.path // 获取当前的路由路径
  icons.value.forEach(icon => {
    icon.active = currentRoute === icon.route
  })
})
</script>
<style scoped lang="scss">
.menu {
  height: 800px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f3f4f6;
  .item {
    margin-top: 20px;
    border-radius: 50%;
    justify-content: center;
    //width: 45px;
    //height: 45px;
    padding: 5px;
    cursor: pointer;
    color: #9ea0ab;
    &:hover {
      background-color: #ffffff;
      color: #000000;
    }
    &:active,
    &.active {
      color: #000000;

      background-color: #ffffff;
    }
  }
}

.ib-logo {
  width: 40px;
  height: 40px;
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url('@/assets/logo.png');
}
.n-layout-header,
.n-layout-footer {
  background: rgba(128, 128, 128, 0.2);
  padding: 24px;
}

.n-layout-sider {
  background: rgba(128, 128, 128, 0.3);
}

.n-layout-content {
  background: rgba(128, 128, 128, 0.4);
}
</style>
