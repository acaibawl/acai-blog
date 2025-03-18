<script setup lang="ts">
import { marked } from 'marked';
import dayjs from 'dayjs';
import type { ArticleWithCategory } from '~/types/ArticleWithCategory';

console.error('articles/[id].vue loaded');

// ルートパラメータから記事IDを取得
const route = useRoute();
const router = useRouter();

// 認証状態を取得
const { status, authToken } = useAuthCheck();

// APIから記事詳細データを取得する
const { data, error } = await useFetch<ArticleWithCategory>(`/api/articles/${route.params.id}`);
if (error.value) {
  console.error(error.value);
  throw createError(error.value?.data);
}

const runtimeConfig = useRuntimeConfig();
const ogImage = data.value?.main_image_url || `${runtimeConfig.public.baseUrl}/no-image.png`;
const description = data.value?.body.slice(0, 30);
useHead({
  title: data.value?.title,
  meta: [
    { hid: 'description', name: 'description', content: description },
    { hid: 'og:title', property: 'og:title', content: data.value?.title },
    { hid: 'og:description', property: 'og:description', content: description },
    { hid: 'og:url', property: 'og:url', content: `${runtimeConfig.public.baseUrl}/articles/${route.params.id}` },
    { hid: 'og:image', property: 'og:image', content: ogImage },
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { hid: 'twitter:title', name: 'twitter:title', content: data.value?.title },
    { hid: 'twitter:description', name: 'twitter:description', content: description },
    { hid: 'twitter:image', name: 'twitter:image', content: ogImage },
  ],
});
definePageMeta({
  name: 'articles-id',
  path: '/articles/:id',
  auth: false,
});

const origin = useRequestURL().origin;
const mainImageUrl = data.value?.main_image_url || `${origin}/no-image.png`;
marked.setOptions({ breaks: true });

// 記事編集ページへ移動
const goToEditPage = () => {
  router.push(`/articles/${route.params.id}/edit`);
};

// 削除モーダル関連
const showDeleteModal = ref(false);
const deleteError = ref('');
const isDeleting = ref(false);

// メッセージ状態
const notificationMessage = useNotificationMessage();

// 削除モーダルを表示
const openDeleteModal = () => {
  showDeleteModal.value = true;
  deleteError.value = '';
};

// 削除モーダルを閉じる
const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

// 記事を削除
const deleteArticle = async () => {
  try {
    isDeleting.value = true;
    deleteError.value = '';

    await $fetch(`/api/articles/${route.params.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    // 削除成功メッセージを設定
    notificationMessage.value = `記事「${data.value?.title}」を削除しました`;

    // 削除成功後、記事一覧ページにリダイレクト
    router.push('/');
  } catch (error: any) {
    console.error('記事削除エラー:', error);
    deleteError.value = error.message || '記事の削除に失敗しました';
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <article>
    <div class="article-header">
      <h2>{{ data!.title }}</h2>
      <div v-if="status === 'authenticated'" class="article-actions">
        <button class="edit-button" @click="goToEditPage">
          <span class="edit-icon">✏️</span> 編集
        </button>
        <button class="delete-button" @click="openDeleteModal">
          <span class="delete-icon">🗑️</span> 削除
        </button>
      </div>
    </div>
    <!-- <p class="meta">{{ dayjs(data!.created_at).format('YYYY-MM-DD') }} | カテゴリ: {{ category }}</p> -->
    <p class="meta">
      {{ dayjs(data!.created_at).format('YYYY-MM-DD') }}
      <template v-if="data!.category">
        | カテゴリー:
        <NuxtLink :to="`/page/1?category_id=${data!.category.id}`" class="category-link">
          {{ data!.category.name }}
        </NuxtLink>
      </template>
    </p>
    <img class="mainImage" :src="mainImageUrl" alt="記事のメイン画像">
    <MarkdownPreview :content="data!.body" />

    <div class="share-buttons">
      <a
        :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${data!.title}｜浅井ブログ`)}&url=${encodeURIComponent(`${runtimeConfig.public.baseUrl}/articles/${route.params.id}`)}`"
        target="_blank"
        rel="nofollow noopener noreferrer"
        class="twitter-share-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" alt="Xでシェア">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>でシェア</span>
      </a>
      <a
        :href="`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`${runtimeConfig.public.baseUrl}/articles/${route.params.id}`)}`"
        target="_blank"
        rel="nofollow noopener noreferrer"
        class="line-share-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" alt="LINEでシェア">
          <path d="M19.365 9.89c.50 0 .907.41.907.91s-.407.91-.907.91H17.59v1.306h1.775c.5 0 .907.41.907.91s-.407.91-.907.91h-1.8v1.157h1.8c.5 0 .908.41.908.91s-.407.91-.908.91H5.59c-.5 0-.908-.41-.908-.91V9.89c0-.5.407-.91.908-.91h2.807c.5 0 .907.41.907.91s-.407.91-.907.91zM24 10.8c0-4.61-4.62-8.366-10.3-8.366S3.4 6.19 3.4 10.8c0 4.143 3.674 7.614 8.65 8.274.337.072.796.222.912.51.104.26.068.668.033.929l-.148.89c-.044.264-.21 1.032.896.562.55-.232 8.017-4.72 10.941-8.087.803-.818 1.316-1.65 1.316-3.078z"/>
        </svg>
        <span>LINEでシェア</span>
      </a>
    </div>

    <!-- 削除確認モーダル -->
    <DeleteArticleModal
      :show="showDeleteModal"
      :is-deleting="isDeleting"
      :error="deleteError"
      @close="closeDeleteModal"
      @delete="deleteArticle"
    />
  </article>
</template>

<style>
article {
    color: #333;
    line-height: 1.6;
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.article-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.article-header h2 {
    margin: 0;
    flex: 1;
}

.article-actions {
    display: flex;
    gap: 10px;
}

.edit-button, .delete-button {
    display: flex;
    align-items: center;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.edit-button {
    background-color: #f0f0f0;
    color: #333;
}

.edit-button:hover {
    background-color: #e0e0e0;
}

.delete-button {
    background-color: #ffebee;
    color: #e53935;
}

.delete-button:hover {
    background-color: #ffcdd2;
}

.edit-icon, .delete-icon {
    margin-right: 5px;
}

/* 記事の見出し */
article h2 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.meta {
    color: #666;
    margin-bottom: 20px;
}

.category-link {
    color: #3b82f6;
    text-decoration: none;
}

.category-link:hover {
    text-decoration: underline;
}

article .mainImage {
    width: 600px;
    border-radius: 5px;
    margin: 10px 0;
}

.share-buttons {
    margin-top: 30px;
    display: flex;
    justify-content: flex-start;
    gap: 10px;
}

.twitter-share-button,
.line-share-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.3s;
}

.twitter-share-button {
    background-color: #000;
    color: #fff;
}

.twitter-share-button:hover {
    background-color: #333;
}

.line-share-button {
    background-color: #06C755;
    color: #fff;
}

.line-share-button:hover {
    background-color: #05a648;
}

.twitter-share-button svg,
.line-share-button svg {
    width: 18px;
    height: 18px;
}

/* モーダル関連のスタイル */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
    margin-top: 0;
    color: #e53935;
}

.form-group {
    margin: 20px 0;
}

.delete-confirm-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.cancel-button, .confirm-delete-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
}

.cancel-button {
    background-color: #f0f0f0;
    color: #333;
}

.cancel-button:hover {
    background-color: #e0e0e0;
}

.confirm-delete-button {
    background-color: #e53935;
    color: white;
}

.confirm-delete-button:hover:not(:disabled) {
    background-color: #c62828;
}

.confirm-delete-button:disabled {
    background-color: #ffcdd2;
    cursor: not-allowed;
}

.error-message {
    color: #e53935;
    font-size: 14px;
    margin: 10px 0;
}
</style>
