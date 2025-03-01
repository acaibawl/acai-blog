<script setup lang="ts">
import ArticleList from '~/components/ArticleList.vue';

const route = useRoute();
const pageParam = route.params.page;
const pageNumber = parseInt(pageParam as string) || 1;

useHead({
  title: `記事一覧 - ${pageNumber}ページ`,
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: '記事一覧ページです。'
    }
  ]
})
</script>

<template>
  <ArticleList :page="pageNumber"/>
</template>
