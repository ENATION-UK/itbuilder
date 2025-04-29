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
import { ref, shallowRef,watchEffect,watch} from 'vue'
import { useRoute,useRouter } from 'vue-router'
import {  Window16Regular, DocumentOnePage20Regular,Settings24Filled,Flow20Regular,Code20Filled } from '@vicons/fluent'
import { ArrowBackCircle } from '@vicons/ionicons5'
import Ai from '../../assets/AI.svg'
import { useMenuStore } from '../../stores/useMenuStore'
const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()

const name = route.params.name as string | undefined
const id = route.params.id as string | undefined


// 使用 ref 包裹 icons
const icons = shallowRef([
  { component: Ai, route: `/project/${name}/ai`, active: false },
  { component: Flow20Regular, route: `/project/${name}/generation/${id}`, active: false },
  { component: Code20Filled, route: `/project/${name}/code`, active: false },
  { component: DocumentOnePage20Regular, route: `/project/${name}/doc`, active: false },
  { component: Settings24Filled, route: '/settings', active: false },
  { component: ArrowBackCircle, route: '/', active: false },
])



// 设置默认的 activeIndex
const activeIndex = ref(0)

// 路由跳转
const navigateTo = (index: number) => {
  activeIndex.value = index
  menuStore.setForcedActiveIndex(index) // 顺便同步一下

  router.push(icons.value[index].route)
}

// 监听 forcedActiveIndex
watch(() => menuStore.forcedActiveIndex, (newVal) => {
  if (newVal !== null) {
    activeIndex.value = newVal
  }
})

// 监听路由变化，更新 actived 状态
watchEffect(() => {
  const currentPath = route.path

  icons.value = icons.value.map((icon, index) => {
    const resolved = router.resolve(icon.route)

    if (menuStore.forcedActiveIndex !== null) {
      return {
        ...icon,
        active: index === menuStore.forcedActiveIndex,
      }
    } else {
      return {
        ...icon,
        active: currentPath === resolved.path,
      }
    }
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
