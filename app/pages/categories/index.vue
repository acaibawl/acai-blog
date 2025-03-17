<script setup>
// カテゴリー一覧を取得（記事数も含む）
const { data: categories, pending, error } = await useFetch('/api/categories', {
  query: { include_count: 'true' },
});

definePageMeta({
  auth: false,
});
</script>

<template>
  <div class="categories-container">
    <h1 class="page-title">カテゴリー一覧</h1>

    <div v-if="pending" class="loading-message">
      <p>読み込み中...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>エラーが発生しました: {{ error.message }}</p>
    </div>

    <div v-else-if="categories && categories.length === 0" class="empty-message">
      <p>カテゴリーがありません</p>
    </div>

    <div v-else class="categories-grid">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/?category_id=${category.id}`"
        class="category-card"
      >
        <h2 class="category-title">{{ category.name }}</h2>
        <p class="article-count">
          記事数: {{ category._count.articles }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.categories-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.loading-message,
.empty-message {
  text-align: center;
  padding: 2rem 0;
  color: #666;
  font-size: 1.1rem;
}

.error-message {
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  color: #c62828;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.category-card {
  display: block;
  background-color: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.article-count {
  color: #666;
  font-size: 0.95rem;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.75rem;
  }
}
</style>
