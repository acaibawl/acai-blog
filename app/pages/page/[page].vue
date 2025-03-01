<script setup lang="ts">
import ArticleList from '~/components/ArticleList.vue';

const route = useRoute();
const pageParam = route.params.page;
const pageNumber = parseInt(pageParam as string) || 1;
</script>

<template>
  <ArticleList :page="pageNumber"/>
</template>
