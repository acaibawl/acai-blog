<script setup lang="ts">
import ArticleForm from '~/components/ArticleForm.vue';

useHead({
  title: '記事投稿',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

const router = useRouter();
const errorMessage = ref<string>('');
const { authToken } = useAuthCheck(errorMessage);
const notificationMessage = useNotificationMessage();

// カテゴリー一覧を取得
const { data: categories } = await useFetch('/api/categories');

const handleSubmit = async (formData: any): Promise<void> => {
  try {
    // 記事を投稿するAPIを呼び出す
    const { data, error } = await useFetch('/api/articles/create', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    if (error.value) {
      errorMessage.value = error.value.statusMessage || 'ログイン情報が不正です。';
      throw new Error(errorMessage.value);
    }

    if (data.value?.id) {
      // 成功メッセージを設定
      notificationMessage.value = '記事を投稿しました。';
      router.push(`/articles/${data.value.id}`);
    } else {
      errorMessage.value = '記事の投稿に失敗しました。';
    }
  } catch (error: unknown) {
    errorMessage.value = errorMessage.value || '記事の投稿に失敗しました。';
    if (error instanceof Error) {
      console.error('記事の投稿に失敗しました:', error.message);
    }
  }
};

const handleCancel = (): void => {
  router.push('/');
};
</script>

<template>
  <div class="container">
    <h1 class="page-title">記事投稿</h1>
    <ArticleForm
      :submit-button-text="'投稿する'"
      :categories="categories || []"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.error-message {
  color: #e53935;
  margin-top: 20px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  text-align: center;
}
</style>
