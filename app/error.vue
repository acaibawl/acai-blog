<script setup lang="ts">
import { useError } from '#app'
const error = useError();
console.error(error);
</script>

<template>
  <NuxtLayout>
    <div class="error-container">
      <h1 v-if="error!.statusCode === 404">404 - ページが見つかりません</h1>
      <h1 v-else-if="error!.statusCode === 500">500 - サーバーエラーが発生しました</h1>
      <h1 v-else>{{ error!.statusCode }} - エラーが発生しました</h1>
      <NuxtLink to="/">ホームに戻る</NuxtLink>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.error-container {
  max-width: 600px;
  margin: 100px auto;
  text-align: center;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f8f8f8;
}

.error-container h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-container p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.error-container a {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #f89174;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
}

.error-container a:hover {
  background-color: #f66c46;
}
</style>
