<script setup lang="ts">
import dayjs from 'dayjs';
import type { Article } from '@prisma/client';

// useFetch を使って /api/articles?page=1 から記事データを取得
const { data, error } = await useFetch<Article[]>("/api/articles?page=1");

if (error.value) {
  console.error(error.value);
  throw createError(error.value);
}
</script>

<template>
  <div class="grid">
    <template v-for="article in data" :key="article.id">
      <a href="#">
        <div class="card">
          <img v-if="article.thumbnail_url" :src="article.thumbnail_url" :alt="article.title">
          <img v-else src="https://picsum.photos/id/1/300/200" :alt="article.title"><!-- デフォルトサムネ画像 -->
          <div class="card-content">
            <div class="card-title">{{ article.title }}</div>
          </div>
          <time :datetime="dayjs(article.created_at).format('YYYY-MM-DD')">{{ new Date(article.created_at).toLocaleDateString("ja-JP")}}</time>
        </div>
      </a>
    </template>
  </div>
</template>

<style scoped>
/* タイトル */
h1 {
  text-align: center;
  margin-bottom: 20px;
}

/* グリッドレイアウト */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* カードデザイン */
.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 10px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

/* カードの画像 */
.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

/* カードの中身 */
.card-content {
  padding: 15px;
}

/* タイトル */
.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card time {
  display: block;
  text-align: right;
  color: #bfbfbf;;
}

a {
  text-decoration: none !important;
  color: #000000;
}
</style>
