<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
});

const renderedMarkdown = computed(() => {
  return marked(props.content || '');
});

useHead({
  link: [
    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/yakuhanjp@4.1.1/dist/css/yakuhanjp.css"}
  ],
});
</script>

<template>
  <div class="markdown-preview" v-html="renderedMarkdown"></div>
</template>

<style>

/* 記事の段落 */
.markdown-preview p {
    margin-bottom: 15px;
}

/* 見出しのデザイン */
.markdown-preview h3 {
    color: #3498db;
    border-left: 5px solid #3498db;
    padding-left: 10px;
    margin: 15px 0;
}

/* 引用のデザイン */
.markdown-preview blockquote {
    background: #eef5fb;
    padding: 10px;
    border-left: 5px solid #3498db;
    margin: 10px 0;
    font-style: italic;
}

.markdown-preview blockquote p {
  margin-bottom: 0;
}

/* リスト */
.markdown-preview ul {
    padding-left: 20px;
}

.markdown-preview ul li {
    margin-bottom: 5px;
}

.markdown-preview pre {
  background-color: #1d2020;   /* 薄いグレーの背景 */
  border: 1px solid #004195;   /* 薄い境界線 */
  border-radius: 6px;          /* 角を丸くする */
  padding: 16px;               /* 内側に十分な余白 */
  margin: 1em 0;               /* 上下にマージン */
  overflow-x: auto;            /* 横に長い場合はスクロール可能に */
}

.markdown-preview pre code {
  display: block;                              /* ブロック要素として表示 */
  font-family: YakuHanJP, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif;;
  font-size: 100%;                             /* 通常のフォントサイズ */
  color: #fff;                              /* テキストは濃いグレー */
  background: transparent;                     /* 親の背景を引き継ぐ */
  border: none;                                /* 内側の余計な枠線は不要 */
  line-height: 1.45;                           /* 読みやすい行間 */
}
</style>
