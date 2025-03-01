<script setup lang="ts">
useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { charset: "utf-8" }
  ],
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | 浅井ブログ` : '浅井ブログ';
  },
  htmlAttrs: {
    lang: "ja"
  }
});
</script>

<template>
  <header>
    <h1>浅井ブログ</h1>
  </header>
  <main>
    <div class="container">
      <NuxtPage />
    </div>
  </main>
  <footer>
    © Copyright 2025 浅井 All rights reserved.
  </footer>
</template>

<style>
/* 全体のスタイル */
/* コンテナ */
.container {
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

header {
  text-align: center;
  padding: 10px 0px;
}

main {
  padding: 20px;
  background-color: #f0ebeb;
}

footer {
  text-align: center;
  margin-top: 20px;
}
</style>