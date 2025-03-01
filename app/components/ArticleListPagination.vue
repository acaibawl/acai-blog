<script setup lang="ts">
const props = defineProps<{
  page: number;
  allArticlesCount: number;
}>();

const allPageCount = Math.floor(((props.allArticlesCount - 1) / 20) + 1);
</script>

<template>
  <div class="pagination">
    <NuxtLink v-if="props.page > 1" :to="`/page/${props.page - 1}`">
      &laquo;
    </NuxtLink>

    <NuxtLink :to="`/page/${n}`" v-for="n in allPageCount" :key="n" :class="{ active: n === props.page }">
      {{ n }}
    </NuxtLink>

    <NuxtLink v-if="allPageCount > props.page" :to="`/page/${props.page + 1}`">
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

.pagination a {
  color: black;
  float: left;
  padding: 8px 16px;
  text-decoration: none;
}

.pagination a.active {
  background-color: #f89174;
  color: white;
  border-radius: 30px;
}

.pagination a:hover:not(.active) {
  background-color: #ddd;
  border-radius: 30px;
}
</style>
