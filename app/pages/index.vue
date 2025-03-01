<template>
      <div class="grid">
        <a href="#">
          <div class="card">
            <img src="https://picsum.photos/id/1/300/200" alt="記事1">
            <div class="card-content">
              <div class="card-title">記事タイトル1</div>
            </div>
          </div>
        </a>

        <a href="#">
          <div class="card">
            <img src="https://picsum.photos/id/45/300/200" alt="記事2">
            <div class="card-content">
              <div class="card-title">記事タイトル2</div>
            </div>
          </div>
        </a>

        <a href="#">
          <div class="card">
            <img src="https://picsum.photos/id/237/300/200" alt="記事3">
            <div class="card-content">
              <div class="card-title">記事タイトル3</div>
            </div>
          </div>
        </a>
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

a {
  text-decoration: none !important;
  color: #000000;
}


</style>