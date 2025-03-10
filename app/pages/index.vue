<script setup lang="ts">
import ArticleList from '~/components/ArticleList.vue';

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
definePageMeta({
  auth: false,
});
</script>

<template>
  <ArticleList :page="1"/>
</template>
