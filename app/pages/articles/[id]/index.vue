<script setup lang="ts">
import { marked } from 'marked';
import dayjs from 'dayjs';
import type { Article } from '@prisma/client';

console.error('articles/[id].vue loaded');

// ルートパラメータから記事IDを取得
const route = useRoute();
const router = useRouter();

// 認証状態を取得
const { status } = useAuthCheck();

// APIから記事詳細データを取得する
const { data, error } = await useFetch<Article>(`/api/articles/${route.params.id}`);
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
</script>
<template>
  <article>
    <div class="article-header">
      <h2>{{ data!.title }}</h2>
      <button v-if="status === 'authenticated'" class="edit-button" @click="goToEditPage">
        <span class="edit-icon">✏️</span> 編集
      </button>
    </div>
    <!-- <p class="meta">{{ dayjs(data!.created_at).format('YYYY-MM-DD') }} | カテゴリ: {{ category }}</p> -->
    <p class="meta">{{ dayjs(data!.created_at).format('YYYY-MM-DD') }}</p>
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
          <path d="M19.365 9.89c.50 0 .907.41.907.91s-.407.91-.907.91H17.59v1.306h1.775c.5 0 .907.41.907.91s-.407.91-.907.91H16.59c-.5 0-.908-.41-.908-.91V9.89c0-.5.407-.91.908-.91h2.775zm-5.443 0c.5 0 .908.41.908.91v4.046c0 .5-.41.91-.908.91s-.908-.41-.908-.91V10.8c0-.5.407-.91.908-.91zm-3.775 0c.5 0 .907.41.907.91v4.046c0 .5-.407.91-.907.91s-.907-.41-.907-.91V10.8c0-.5.407-.91.907-.91zm-2.75.82h-1.8v1.157h1.8c.5 0 .908.41.908.91s-.407.91-.908.91h-1.8v1.157h1.8c.5 0 .908.41.908.91s-.407.91-.908.91H5.59c-.5 0-.908-.41-.908-.91V9.89c0-.5.407-.91.908-.91h2.807c.5 0 .907.41.907.91s-.407.91-.907.91zM24 10.8c0-4.61-4.62-8.366-10.3-8.366S3.4 6.19 3.4 10.8c0 4.143 3.674 7.614 8.65 8.274.337.072.796.222.912.51.104.26.068.668.033.929l-.148.89c-.044.264-.21 1.032.896.562.55-.232 8.017-4.72 10.941-8.087.803-.818 1.316-1.65 1.316-3.078z"/>
        </svg>
        <span>LINEでシェア</span>
      </a>
    </div>
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

.edit-button {
    display: flex;
    align-items: center;
    background-color: #f0f0f0;
    color: #333;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-left: 15px;
}

.edit-button:hover {
    background-color: #e0e0e0;
}

.edit-icon {
    margin-right: 5px;
}

/* 記事の見出し */
article h2 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.meta {
    font-size: 14px;
    color: #888;
    margin-bottom: 10px;
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
</style>
