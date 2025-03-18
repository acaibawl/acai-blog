<script setup lang="ts">
const props = defineProps<{
  page: number;
  allArticlesCount: number;
}>();

const route = useRoute();
const categoryId = route.query.category_id;

const allPageCount = Math.floor(((props.allArticlesCount - 1) / 20) + 1);

// カテゴリーIDがある場合はクエリパラメータを付与
const getPageLink = (pageNumber: number) => {
  if (categoryId) {
    return `/page/${pageNumber}?category_id=${categoryId}`;
  }
  return `/page/${pageNumber}`;
};
</script>

<template>
  <div class="pagination">
    <NuxtLink v-if="props.page > 1" :to="getPageLink(props.page - 1)">
      &laquo;
    </NuxtLink>

    <template v-for="n in allPageCount" :key="n">
      <NuxtLink v-if="n !== props.page" :to="getPageLink(n)">
        {{ n }}
      </NuxtLink>
      <span v-else class="active">{{ n }}</span>
    </template>

    <NuxtLink v-if="allPageCount > props.page" :to="getPageLink(props.page + 1)">
      &raquo;
    </NuxtLink>
  </div>
</template>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.pagination a,
.pagination span {
  color: black;
  float: left;
  padding: 8px 16px;
  text-decoration: none;
}

.pagination span {
  background-color: #f89174;
  color: white;
  border-radius: 30px;
}

.pagination a:hover:not(.active) {
  background-color: #ddd;
  border-radius: 30px;
}
</style>
