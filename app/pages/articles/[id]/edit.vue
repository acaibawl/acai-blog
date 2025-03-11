<script setup lang="ts">
import ArticleForm from '~/components/ArticleForm.vue';
import type { Article } from '@prisma/client';

// ルートパラメータから記事IDを取得
const route = useRoute();
const router = useRouter();
const errorMessage = ref<string>('');
const isLoading = ref<boolean>(true);
const article = ref<Article | null>(null);

// 認証関連
const { authToken, checkAuth } = useAuthCheck(errorMessage);

useHead({
  title: '記事編集',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

// 記事データを取得
const fetchArticle = async (): Promise<void> => {
  if (!checkAuth('記事を編集するにはログインが必要です。')) {
    router.push('/');
    return;
  }

  isLoading.value = true;
  try {
    // 通常の記事取得APIを使用する
    const response = await $fetch<Article>(`/api/articles/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    if (!response) {
      errorMessage.value = '記事データが見つかりませんでした。';
      throw new Error(errorMessage.value);
    }

    // 深いコピーを作成して新しいオブジェクトとして代入
    article.value = JSON.parse(JSON.stringify(response));
  } catch (error: unknown) {
    errorMessage.value = errorMessage.value || '記事の取得に失敗しました。';
    if (error instanceof Error) {
      console.error('記事の取得に失敗しました:', error.message);
    }
  } finally {
    isLoading.value = false;
  }
};

// 記事を更新
const handleSubmit = async (formData: any): Promise<void> => {
  try {
    if (!checkAuth('記事を更新するにはログインが必要です。')) {
      return;
    }

    // 記事を更新するAPIを呼び出す - 通常の更新APIを使用
    const response = await $fetch<Article>(`/api/articles/${route.params.id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    if (response) {
      router.push(`/articles/${route.params.id}`);
    } else {
      errorMessage.value = '記事の更新に失敗しました。';
    }
  } catch (error: unknown) {
    errorMessage.value = errorMessage.value || '記事の更新に失敗しました。';
    if (error instanceof Error) {
      console.error('記事の更新に失敗しました:', error.message);
    }
  }
};

const handleCancel = (): void => {
  router.push(`/articles/${route.params.id}`);
};

// ページが準備できたときに記事データを取得
onBeforeMount(() => {
  fetchArticle();
});
</script>

<template>
  <div class="edit-article-container">
    <h1 class="page-title">記事編集</h1>

    <div v-if="isLoading" class="loading">
      <p>読み込み中...</p>
    </div>

    <div v-else-if="article">
      <ArticleForm
        :initial-title="article.title"
        :initial-body="article.body"
        :initial-thumbnail-url="article.thumbnail_url || ''"
        :initial-main-image-url="article.main_image_url || ''"
        submit-button-text="更新する"
        :is-edit-mode="true"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>

    <div v-else class="error-container">
      <p>記事データを取得できませんでした。</p>
      <button class="retry-button" @click="fetchArticle">再試行</button>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.edit-article-container {
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

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error-container {
  text-align: center;
  padding: 40px;
  background-color: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 20px;
}

.retry-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-button:hover {
  background-color: #3a7bc8;
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
