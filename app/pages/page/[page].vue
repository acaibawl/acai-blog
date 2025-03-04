<script setup lang="ts">
import ArticleList from '~/components/ArticleList.vue';

const route = useRoute();
const pageParam = route.params.page;
const pageNumber = parseInt(pageParam as string) || 1;

useHead({
  title: `記事一覧 - ${pageNumber}ページ`,
  meta: [
    { hid: 'description', name: 'description', content: '記事一覧ページです。' },
    { hid: 'og:title', property: 'og:title', content: `記事一覧 - ${pageNumber}ページ` },
    { hid: 'og:description', property: 'og:description', content: '記事一覧ページです。' },
    { hid: 'og:url', property: 'og:url', content: `https://example.com/page/${pageNumber}` },
    { hid: 'og:image', property: 'og:image', content: 'https://acai-blog.com/no-image.png' },
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { hid: 'twitter:title', name: 'twitter:title', content: `記事一覧 - ${pageNumber}ページ` },
    { hid: 'twitter:description', name: 'twitter:description', content: '記事一覧ページです。' },
    { hid: 'twitter:image', name: 'twitter:image', content: 'https://acai-blog.com/no-image.png' }
  ]
})
</script>

<template>
  <ArticleList :page="pageNumber"/>
</template>
