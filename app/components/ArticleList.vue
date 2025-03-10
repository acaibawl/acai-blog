<script setup lang="ts">
import dayjs from 'dayjs';
import type { ArticlesResponse } from '~/types/ArticlesResponse';

const props = defineProps<{
  page: number;
}>();

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

// useFetch を使って /api/articles?page=1 から記事データを取得
const { data, error } = await useFetch<ArticlesResponse>(`/api/articles?page=${props.page}`);
if (error.value || !data.value) {
  console.error(error.value);
  throw createError(error.value?.data);
}

const origin = useRequestURL().origin;
const thumbnailUrl = (url: string | null) => url ? url : `${origin}/no-image.png`;
</script>

<template>
  <div class="grid">
    <template v-for="article in data?.articles" :key="article.id">
      <a :href="`/articles/${article.id}`">
        <div class="card">
          <img :src="thumbnailUrl(article.thumbnail_url)" :alt="article.title">
          <div class="card-content">
            <div class="card-title">{{ article.title }}</div>
          </div>
          <time :datetime="dayjs(article.created_at).format('YYYY-MM-DD')">{{ new Date(article.created_at).toLocaleDateString("ja-JP")}}</time>
        </div>
      </a>
    </template>
  </div>
  <ArticleListPagination :page="props.page" :all-articles-count="data!.allArticlesCount" />
</template>

<style scoped>
/* タイトル */
h1 {
  text-align: center;
  margin-bottom: 20px;
}

/* グリッドレイアウト */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* カードデザイン */
.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 10px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

/* カードの画像 */
.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

/* カードの中身 */
.card-content {
  padding: 15px;
}

/* タイトル */
.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card time {
  display: block;
  text-align: right;
  color: #bfbfbf;;
}

a {
  text-decoration: none !important;
  color: #000000;
}
</style>
