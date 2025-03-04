<script setup lang="ts">
import { marked } from 'marked';
import dayjs from 'dayjs';

// ルートパラメータから記事IDを取得
const route = useRoute()

// APIから記事詳細データを取得する
const { data, error } = await useFetch(`/api/articles/${route.params.id}`);
if (error.value) {
    console.error(error.value);
    throw createError(error.value?.data);
}

const runtimeConfig = useRuntimeConfig();
const ogImage = data.value?.main_image_url || `${runtimeConfig.public.baseUrl}/no-image.png`;
const description = data.value?.body.slice(0, 30);
useHead({
  title: data.value?.title,
  meta: [
    { hid: 'description', name: 'description', content: description },
    { hid: 'og:title', property: 'og:title', content: data.value?.title },
    { hid: 'og:description', property: 'og:description', content: description },
    { hid: 'og:url', property: 'og:url', content: `${runtimeConfig.public.baseUrl}/articles/${route.params.id}` },
    { hid: 'og:image', property: 'og:image', content: ogImage },
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { hid: 'twitter:title', name: 'twitter:title', content: data.value?.title },
    { hid: 'twitter:description', name: 'twitter:description', content: description },
    { hid: 'twitter:image', name: 'twitter:image', content:  ogImage}
  ],
})

const origin = useRequestURL().origin;
const mainImageUrl = data.value?.main_image_url || `${origin}/no-image.png`;
marked.setOptions({ breaks: true });
</script>

<template>
  <article>
    <h2>{{ data!.title }}</h2>
    <!-- <p class="meta">{{ dayjs(data!.created_at).format('YYYY-MM-DD') }} | カテゴリ: {{ category }}</p> -->
    <p class="meta">{{ dayjs(data!.created_at).format('YYYY-MM-DD') }}</p>
    <img class="mainImage" :src="mainImageUrl" alt="記事のメイン画像">
    <div class="markdown" v-html="marked.parse(data!.body)"></div>
    </article>
</template>

<style>
article {
    color: #333;
    line-height: 1.6;
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 記事の見出し */
article h2 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.meta {
    font-size: 14px;
    color: #888;
    margin-bottom: 10px;
}

article .mainImage {
    width: 600px;
    border-radius: 5px;
    margin: 10px 0;
}

/* 記事の段落 */
article p {
    margin-bottom: 15px;
}

/* 見出しのデザイン */
article h3 {
    color: #3498db;
    border-left: 5px solid #3498db;
    padding-left: 10px;
    margin: 15px 0;
}

/* 引用のデザイン */
blockquote {
    background: #eef5fb;
    padding: 10px;
    border-left: 5px solid #3498db;
    margin: 10px 0;
    font-style: italic;
}

blockquote p {
  margin-bottom: 0;
}

/* リスト */
ul {
    padding-left: 20px;
}

ul li {
    margin-bottom: 5px;
}
</style>
