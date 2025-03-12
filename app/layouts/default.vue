<script setup lang="ts">
import type { JwtPayload } from '~/types/JwtPayload';
import NotificationMessage from '~/components/NotificationMessage.vue';

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { charset: 'utf-8' },
  ],
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | 浅井ブログ` : '浅井ブログ';
  },
  htmlAttrs: {
    lang: 'ja',
  },
});
const { signOut, status, data } = useAuth();
const jwtPayload = computed<JwtPayload | null>(() => {
  return data.value ? (data.value as unknown as JwtPayload) : null;
});

// メッセージ通知関連
const notificationMessage = useNotificationMessage();
const showNotification = ref(false);

// 通知を閉じる処理
const handleClose = () => {
  showNotification.value = false;
  notificationMessage.value = '';
};

// メッセージが設定されたら表示する
watch(() => notificationMessage.value, (newValue) => {
  if (newValue) {
    showNotification.value = true;
  }
});

// 初期表示時にメッセージがあれば表示
onMounted(() => {
  if (notificationMessage.value) {
    showNotification.value = true;
  }
});
</script>

<template>
  <div>
    <header>
      <div class="header-container">
        <h1>
          <NuxtLink to="/">浅井ブログ</NuxtLink>
        </h1>
        <div v-if="status === 'authenticated'" class="admin-controls">
          <p class="admin-name">管理者：{{ jwtPayload?.name }}</p>
          <button class="logout-button" @click="signOut({ callbackUrl: '/' })">Logout</button>
        </div>
      </div>
    </header>
    <main>
      <div class="container">
        <slot />
      </div>
    </main>
    <footer>
      © Copyright 2025 浅井 All rights reserved.
    </footer>

    <!-- 通知メッセージコンポーネント -->
    <NotificationMessage
      :message="notificationMessage"
      :show="showNotification"
      @close="handleClose"
    />
  </div>
</template>

<style>
body {
  font-family: "Noto Sans JP", serif;
}

/* 全体のスタイル */
/* コンテナ */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

main {
  padding: 20px;
  background-color: #f0ebeb;
}

header {
  padding: 10px 20px;
  position: relative;
}

.header-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

header h1 {
  margin: 0;
}

header a {
  text-decoration: none;
  color: #333;
}

.admin-controls {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-name {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.logout-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.logout-button:hover {
  background-color: #d32f2f;
}

footer {
  text-align: center;
  margin-top: 20px;
  padding-bottom: 20px;
}
</style>
