<template>
  <article>
        <h2>記事のタイトルが入ります</h2>
        <p class="meta">2025年2月28日 | カテゴリ: Webデザイン</p>
        <img src="https://picsum.photos/800/400" alt="記事のメイン画像">
        <p>この記事の本文です。記事ページです。</p>
        <h3>見出し1</h3>
        <p>ここに本文が入ります。フォントやレイアウトを調整して見やすいデザインにしています。</p>
        <h3>見出し2</h3>
        <p>適度な余白を入れることで、読みやすさを向上させています。</p>
        <blockquote>これは引用文です。<br>
          二行にできますか？
        </blockquote>
        <p>リストも使用できます。</p>
        <ul>
            <li>リスト項目1</li>
            <li>リスト項目2</li>
            <li>リスト項目3</li>
        </ul>
    </article>
</template>

<style scoped>
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

article img {
    width: 100%;
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

/* リスト */
ul {
    padding-left: 20px;
}

ul li {
    margin-bottom: 5px;
}
</style>