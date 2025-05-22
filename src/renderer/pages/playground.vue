<template>
  <div class="user-manager">
    <h2>用户管理</h2>

    <form @submit.prevent="addUser">
      <input v-model="form.name" placeholder="姓名" required />
      <input v-model="form.email" placeholder="邮箱" required />
      <button type="submit">添加用户</button>
    </form>

    <hr />

    <div v-if="users.length">
      <h3>用户列表</h3>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.name }} - {{ user.email }}
        </li>
      </ul>
    </div>
    <div v-else>
      暂无用户
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElectronAPI } from '../utils/electron-api';

const users = ref<Array<{ id: number; name: string; email: string }>>([]);
const form = ref({ name: '', email: '' });

async function loadUsers() {
  const result = await ElectronAPI.fetchAll('SELECT * FROM users ORDER BY id DESC');
  if (Array.isArray(result)) {
    users.value = result;
  } else {
    console.error('查询失败:', result?.error || result);
  }
}

async function addUser() {
  const { name, email } = form.value;
  if (!name || !email) return;

  const result = await ElectronAPI.runQuery(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
  );

  if (result?.lastInsertRowid) {
    console.log('插入成功:', result);
    form.value.name = '';
    form.value.email = '';
    await loadUsers();
  } else {
    console.error('插入失败:', result?.error || result);
    alert('插入失败：' + (result?.error || '未知错误'));
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-manager {
  max-width: 500px;
  margin: auto;
  padding: 16px;
}
input {
  margin-right: 8px;
}
button {
  padding: 4px 12px;
}
</style>