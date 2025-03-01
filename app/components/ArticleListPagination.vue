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

    <template v-for="n in allPageCount" :key="n">
      <NuxtLink v-if="n !== props.page" :to="`/page/${n}`">
        {{ n }}
      </NuxtLink>
      <span v-else class="active">{{ n }}</span>
    </template>

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
