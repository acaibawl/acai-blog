<script setup lang="ts">
import ArticleList from '~/components/ArticleList.vue';

const runtimeConfig = useRuntimeConfig();
const ogImage = `${runtimeConfig.public.baseUrl}/no-image.png`;
useHead({
  meta: [
    { hid: 'description', name: 'description', content: '記事一覧ページです。' },
    { hid: 'og:title', property: 'og:title', content: '浅井ブログ' },
    { hid: 'og:description', property: 'og:description', content: '記事一覧ページです。' },
    { hid: 'og:url', property: 'og:url', content: runtimeConfig.public.baseUrl },
    { hid: 'og:image', property: 'og:image', content: ogImage },
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { hid: 'twitter:title', name: 'twitter:title', content: `記事一覧ページです` },
    { hid: 'twitter:description', name: 'twitter:description', content: '記事一覧ページです。' },
    { hid: 'twitter:image', name: 'twitter:image', content: ogImage },
  ],
});
definePageMeta({
  auth: false,
});

// メッセージ状態を取得
const notificationMessage = useNotificationMessage();

// ページがロードされたらメッセージを表示して消去
// TODO: JSDOM操作をVueの仕組みに組み込んでいない
onMounted(() => {
  if (notificationMessage.value) {
    // メッセージを表示（3秒後に消える）
    const messageElement = document.createElement('div');
    messageElement.className = 'message-notification';
    messageElement.textContent = notificationMessage.value;
    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(messageElement);
        // メッセージをクリア
        notificationMessage.value = '';
      }, 300);
    }, 3000);
  }
});
</script>

<template>
  <ArticleList :page="1"/>
</template>

<style>
/* メッセージ通知のスタイル */
.message-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  z-index: 9999;
  animation: slide-in 0.3s ease-out;
}

.message-notification.fade-out {
  animation: fade-out 0.3s ease-out forwards;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
