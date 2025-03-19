<script setup lang="ts">
import type { Category } from '@prisma/client';
import dayjs from 'dayjs';
import type { ArticlesResponse } from '~/types/ArticlesResponse';

const props = defineProps<{
  page: number;
}>();

const route = useRoute();
const router = useRouter();

// リアクティブな状態
const searchInput = ref('');
const currentCategory = ref<Category | null>(null);
const articleData = ref<ArticlesResponse | null>(null);
const isLoading = ref(true); // ページ読み込み時は最初からローディング状態に
const fetchError = ref<Error | null>(null);

// URLから検索パラメータを取得
const categoryId = computed(() => route.query.category_id ? Number(route.query.category_id) : undefined);
const searchKeyword = computed(() => route.query.keyword as string || '');

// 検索フォームの初期化
watchEffect(() => {
  searchInput.value = searchKeyword.value;
});

// 検索実行関数
const handleSearch = () => {
  const query: { [key: string]: string | number } = {};

  if (searchInput.value && searchInput.value.trim() !== '') {
    query.keyword = searchInput.value.trim();
  }

  if (categoryId.value) {
    query.category_id = categoryId.value;
  }

  // 検索結果の1ページ目に遷移
  router.push({ path: '/page/1', query });
};

// カテゴリー情報の取得
const fetchCategoryInfo = async () => {
  if (categoryId.value) {
    try {
      const data = await $fetch<Category>(`/api/categories/${categoryId.value}`);
      currentCategory.value = data;
    } catch (error) {
      console.error('カテゴリー取得エラー:', error);
      // カテゴリー取得エラーは致命的ではないので、メインのエラー表示はしない
    }
  } else {
    currentCategory.value = null;
  }
};

// 記事データのフェッチ
const fetchArticleData = async () => {
  isLoading.value = true;
  fetchError.value = null;

  try {
    const query = {
      page: props.page,
      category_id: categoryId.value,
      keyword: searchKeyword.value,
    };

    const data = await $fetch<ArticlesResponse>('/api/articles', {
      method: 'GET',
      params: query,
    });
    articleData.value = data;
  } catch (error) {
    fetchError.value = error as Error;
    console.error('記事データ取得エラー:', error);
  } finally {
    isLoading.value = false;
  }
};

// データ取得関数を統合
const fetchAllData = async () => {
  isLoading.value = true;
  fetchError.value = null;

  try {
    // カテゴリー情報の取得（エラーがあっても続行）
    await fetchCategoryInfo().catch(err => console.error('カテゴリー取得エラー:', err));

    // 記事データの取得
    await fetchArticleData();
  } catch (error) {
    console.error('データ取得中のエラー:', error);
    fetchError.value = error as Error;
  } finally {
    isLoading.value = false;
  }
};

// ルートクエリパラメータの変更を監視して再フェッチ
watch(() => [route.query.page, route.query.category_id, route.query.keyword], () => {
  fetchAllData();
}, { immediate: true });

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

const origin = useRequestURL().origin;
const thumbnailUrl = (url: string | null) => url ? url : `${origin}/no-image.png`;
</script>

<template>
  <div>
    <!-- 検索フォーム -->
    <div class="search-container">
      <form class="search-form" @submit.prevent="handleSearch">
        <input
          v-model="searchInput"
          type="text"
          placeholder="記事を検索..."
          class="search-input"
        >
        <button type="submit" class="search-button">検索</button>
      </form>
    </div>

    <!-- 現在の検索状態を表示 -->
    <div v-if="searchKeyword" class="search-info">
      <p>「{{ searchKeyword }}」の検索結果: {{ articleData?.allArticlesCount || 0 }}件</p>
      <button class="clear-search" @click="() => router.push({ path: route.path, query: { category_id: categoryId } })">
        検索をクリア
      </button>
    </div>

    <!-- カテゴリー情報 -->
    <div v-if="currentCategory" class="category-header">
      <h1>カテゴリー: {{ currentCategory.name }}</h1>
      <NuxtLink to="/categories" class="category-link">すべてのカテゴリーを見る</NuxtLink>
    </div>

    <!-- ローディング表示 -->
    <div v-if="isLoading" class="loading">
      <p>読み込み中...</p>
    </div>

    <!-- エラー表示 -->
    <div v-else-if="fetchError" class="error-message">
      <p>エラーが発生しました。再読み込みしてください。</p>
    </div>

    <!-- 記事がない場合のメッセージ -->
    <div v-else-if="!articleData || articleData.articles.length === 0" class="no-results">
      <p>該当する記事が見つかりませんでした。</p>
    </div>

    <!-- 記事一覧 -->
    <div v-else class="grid">
      <template v-for="article in articleData.articles" :key="article.id">
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
    <ArticleListPagination
      v-if="articleData"
      :page="props.page"
      :all-articles-count="articleData.allArticlesCount"
    />
  </div>
</template>

<style scoped>
/* ローディング表示 */
.loading {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

/* エラーメッセージ */
.error-message {
  text-align: center;
  padding: 20px;
  background-color: #fff0f0;
  color: #e53e3e;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* 検索フォーム */
.search-container {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.search-button {
  background: #f89174;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.search-button:hover {
  background: #e57a5c;
}

/* 検索結果情報 */
.search-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  color: #666;
}

.clear-search {
  background: #f1f1f1;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.clear-search:hover {
  background: #e1e1e1;
}

/* 検索結果なしの表示 */
.no-results {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

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

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    gap: 10px;
  }

  .search-input, .search-button {
    width: 100%;
    border-radius: 4px;
  }

  .search-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
