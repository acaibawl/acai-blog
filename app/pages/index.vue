<script setup lang="ts">
import ArticleList from '~/components/ArticleList.vue';
import NotificationMessage from '~/components/NotificationMessage.vue';

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
// 通知の表示状態を管理
const showNotification = ref(false);

// 通知を閉じる処理
const handleClose = () => {
  // 通知が閉じられたときの処理
  showNotification.value = false;
  notificationMessage.value = '';
};

// ページがロードされたらメッセージを表示
onMounted(() => {
  if (notificationMessage.value) {
    showNotification.value = true;
  }
});
</script>

<template>
  <div>
    <!-- 通知メッセージコンポーネント -->
    <NotificationMessage
      :message="notificationMessage"
      :show="showNotification"
      @close="handleClose"
    />
    <ArticleList :page="1"/>
  </div>
</template>
