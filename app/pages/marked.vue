<script setup lang="ts">
import { marked } from 'marked';

const title = "記事のタイトルが入ります";

useHead({
    title: title,
})

const date = "2025年2月28日";
const category = "Webデザイン";
const mainImageUrl = "https://picsum.photos/600/400";
marked.setOptions({ breaks: true });
const articleBody = marked.parse(`
### 見出し1
てすとてすとてすと

### 見出し2

tesutoだよー

> これは引用文です。
2行目です。

* リスト１
* リスト2
* リスト3

画像貼れるかな？
<img width=200 src="https://picsum.photos/id/1/300/200">

リンク貼れるかな？
https://picsum.photos/id/1/300/200

`);
</script>

<template>
  <article>
    <h2>{{ title }}</h2>
    <p class="meta">{{ date }} | カテゴリ: {{ category }}</p>
    <img class="mainImage" :src="mainImageUrl" alt="記事のメイン画像">
    <div class="markdown" v-html="articleBody"></div>
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
