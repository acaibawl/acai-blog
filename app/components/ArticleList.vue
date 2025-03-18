<script setup lang="ts">
import type { Category } from '@prisma/client';
import dayjs from 'dayjs';
import type { ArticlesResponse } from '~/types/ArticlesResponse';

const props = defineProps<{
  page: number;
}>();

const route = useRoute();
const categoryId = route.query.category_id ? Number(route.query.category_id) : undefined;

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

// カテゴリーIDがある場合は、そのカテゴリー情報も取得
const currentCategory = ref<Category | null>(null);
if (categoryId) {
  const { data } = await useFetch<Category>(`/api/categories/${categoryId}`);
  currentCategory.value = data.value;
}

// useFetch を使って記事データを取得（カテゴリーIDがある場合はフィルター）
const { data, error } = await useFetch<ArticlesResponse>('/api/articles', {
  query: {
    page: props.page,
    category_id: categoryId,
  },
});

if (error.value || !data.value) {
  console.error(error.value);
  throw createError(error.value?.data);
}

const origin = useRequestURL().origin;
const thumbnailUrl = (url: string | null) => url ? url : `${origin}/no-image.png`;
</script>

<template>
  <div>
    <div v-if="currentCategory" class="category-header">
      <h1>カテゴリー: {{ currentCategory.name }}</h1>
      <NuxtLink to="/categories" class="category-link">すべてのカテゴリーを見る</NuxtLink>
    </div>

    <div class="grid">
      <template v-for="article in data?.articles" :key="article.id">
        <a :href="`/articles/${article.id}`">
          <div class="card">
            <div class="image-container">
              <img :src="thumbnailUrl(article.thumbnail_url)" :alt="article.title">
            </div>
            <div class="card-content">
              <div class="card-title">{{ article.title }}</div>
              <div class="card-category">
                <NuxtLink :to="`/page/1?category_id=${article.category.id}`">
                  {{ article.category.name }}
                </NuxtLink>
              </div>
            </div>
            <time :datetime="dayjs(article.created_at).format('YYYY-MM-DD')">{{ new Date(article.created_at).toLocaleDateString("ja-JP")}}</time>
          </div>
        </a>
      </template>
    </div>
    <ArticleListPagination :page="props.page" :all-articles-count="data!.allArticlesCount" />
  </div>
</template>

<style scoped>
/* タイトル */
h1 {
  text-align: center;
  margin-bottom: 20px;
}

/* カテゴリーヘッダー */
.category-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.category-link {
  color: #3b82f6;
  text-decoration: underline;
  margin-top: 5px;
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
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

/* カードの画像コンテナ */
.card .image-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 6px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* カードの画像 */
.card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f5f5f5;
  transition: transform 0.3s ease;
}

.card:hover img {
  transform: scale(1.05);
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

/* カテゴリー */
.card-category {
  display: inline-block;
  background-color: #f3f4f6;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 10px;
}

.card-category a {
  color: #4b5563;
}

.card time {
  display: block;
  text-align: right;
  color: #bfbfbf;
}

a {
  text-decoration: none !important;
  color: #000000;
}
</style>
