<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">カテゴリー一覧</h1>
    
    <div v-if="pending" class="text-center py-8">
      <p>読み込み中...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>エラーが発生しました: {{ error.message }}</p>
    </div>
    
    <div v-else-if="categories && categories.length === 0" class="text-center py-8">
      <p>カテゴリーがありません</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/?category_id=${category.id}`"
        class="block bg-white shadow-md hover:shadow-lg rounded-lg p-6 transition duration-300"
      >
        <h2 class="text-xl font-semibold mb-2">{{ category.name }}</h2>
        <p class="text-gray-600">
          記事数: {{ category._count.articles }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// カテゴリー一覧を取得（記事数も含む）
const { data: categories, pending, error } = await useFetch('/api/categories', {
  query: { include_count: 'true' }
});
</script>