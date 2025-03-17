<script setup lang="ts">
import ArticleForm from '~/components/ArticleForm.vue';
import type { ArticleWithCategory } from '~/types/ArticleWithCategory';

// ルートパラメータから記事IDを取得
const route = useRoute();
const router = useRouter();

// 状態管理
const article = ref<ArticleWithCategory | null>(null);
const errorMessage = ref<string>('');
const isLoading = ref<boolean>(true);

// 認証関連
const { checkAuth, authToken } = useAuthCheck(errorMessage);

// 記事データを取得
const { data: articleData, error } = await useFetch<ArticleWithCategory>(`/api/articles/${route.params.id}`);

// カテゴリー一覧を取得
const { data: categories } = await useFetch('/api/categories');

if (error.value) {
  errorMessage.value = error.value.statusMessage || '記事の取得に失敗しました。';
  console.error('記事の取得に失敗しました:', error.value);
} else {
  article.value = articleData.value;
}

isLoading.value = false;

// 記事を更新
const handleSubmit = async (formData: any): Promise<void> => {
  try {
    // 認証チェック
    if (!checkAuth('記事を編集するにはログインが必要です。')) {
      return;
    }

    isLoading.value = true;
    // 記事を更新するAPIを呼び出す
    const { error: updateError } = await useFetch(`/api/articles/${route.params.id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    if (updateError.value) {
      errorMessage.value = updateError.value.statusMessage || 'ログイン情報が不正です。';
      throw new Error(errorMessage.value);
    }

    // 成功メッセージを設定
    const notificationMessage = useNotificationMessage();
    notificationMessage.value = '記事を更新しました。';

    // 記事詳細ページにリダイレクト
    router.push(`/articles/${route.params.id}`);
  } catch (error: unknown) {
    errorMessage.value = errorMessage.value || '記事の更新に失敗しました。';
    if (error instanceof Error) {
      console.error('記事の更新に失敗しました:', error.message);
    }
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = (): void => {
  router.push(`/articles/${route.params.id}`);
};

useHead({
  title: '記事編集',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});
</script>

<template>
  <div class="container">
    <h1 class="page-title">記事編集</h1>
    <div v-if="isLoading" class="loading">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>
    <ArticleForm
      v-else
      :initial-title="article?.title || ''"
      :initial-body="article?.body || ''"
      :initial-thumbnail-url="article?.thumbnail_url || ''"
      :initial-main-image-url="article?.main_image_url || ''"
      :initial-category-id="article?.category_id || null"
      :submit-button-text="'更新する'"
      :is-edit-mode="true"
      :categories="categories || []"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
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

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
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
