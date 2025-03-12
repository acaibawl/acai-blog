<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';

const runtimeConfig = useRuntimeConfig();
const ogImage = `${runtimeConfig.public.baseUrl}/twitter-shelter.webp`;
useHead({
  meta: [
    { hid: 'description', name: 'description', content: 'Twitter避難所です。' },
    { hid: 'og:title', property: 'og:title', content: 'Twitter避難所' },
    { hid: 'og:description', property: 'og:description', content: 'Twitter避難所です。' },
    { hid: 'og:url', property: 'og:url', content: runtimeConfig.public.baseUrl },
    { hid: 'og:image', property: 'og:image', content: ogImage },
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { hid: 'twitter:title', name: 'twitter:title', content: `Twitter避難所` },
    { hid: 'twitter:description', name: 'twitter:description', content: 'Twitter避難所です。' },
    { hid: 'twitter:image', name: 'twitter:image', content: ogImage },
  ],
});
definePageMeta({
  auth: false,
});

// WebSocket の URL を動的に作成（HTTPSなら wss://、HTTPなら ws://）
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const socketUrl = `${protocol}://${window.location.host}/api/shelterSocket`;

// useWebSocket で WebSocket 接続を確立
const { status, data, send, open, close } = useWebSocket(socketUrl, {
  autoReconnect: {
    retries: 3,
    delay: 5000,
    onFailed() {
      alert('Failed to connect WebSocket after 3 retries');
    },
  },
  heartbeat: {
    message: JSON.stringify({ name: 'system', body: 'ping' }),
    interval: 1000,
    pongTimeout: 10000,
  },
  immediate: false,
  autoConnect: false,
});

// 利用者の名前を格納する変数
const userName = ref('');
const isLoggedIn = ref(false);

// 受信したメッセージをリアクティブな配列として管理
const messages: {
  name: string;
  body: string;
}[] = reactive([]);

watch(data, (newValue) => {
  const { name = 'system', body = '' } = JSON.parse(newValue);
  messages.push({ name, body });
});

// 新しいメッセージの入力内容
const newMessage = ref('');

// チャット参加時の処理：名前が入力されていればチャットに参加（実際の参加処理は不要）
const joinChat = () => {
  if (!userName.value.trim()) {
    alert('名前を入力してください。');
    return;
  }
  // 参加後は、名前入力フォームは非表示になり、チャット画面が表示されます
  isLoggedIn.value = true;
  open();
  send(JSON.stringify({ name: 'system', body: `${userName.value} さんが入室しました` }));
};

// メッセージ送信時の処理：利用者名とメッセージ内容を JSON 化して送信
const sendMessage = () => {
  if (!newMessage.value.trim() || status.value !== 'OPEN') return;
  const payload = JSON.stringify({
    name: userName.value,
    body: newMessage.value,
  });
  send(payload);
  newMessage.value = '';
};

onUnmounted(() => {
  close();
  alert('Twitter避難所を退出します');
});
</script>

<template>
  <div class="chat-container">
    <h1>Twitter避難所</h1>
    <!-- 未ログインの場合は、名前入力フォームを表示 -->
    <div v-if="!isLoggedIn">
      <form @submit.prevent="joinChat">
        <input v-model="userName" placeholder="あなたの名前を入力してください">
        <button type="submit">チャットに参加</button>
      </form>
    </div>

    <!-- ログインした場合は、チャット画面を表示 -->
    <div v-else>
      <p>ようこそ、{{ userName }} さん！Twitterが早く直るといいですね</p>
      <div class="chat-window">
        <div v-for="(msg, index) in messages" :key="index" class="message">
          <strong>{{ msg.name }}</strong>: {{ msg.body }}
        </div>
      </div>
      <form @submit.prevent="sendMessage">
        <input v-model="newMessage" placeholder="メッセージを入力...">
        <button type="submit">送信</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
.chat-window {
  border: 1px solid #ccc;
  padding: 1rem;
  height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}
.message {
  margin-bottom: 0.5rem;
}
form {
  display: flex;
  margin-bottom: 1rem;
}
input {
  flex: 1;
  padding: 0.5rem;
  margin-right: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>
