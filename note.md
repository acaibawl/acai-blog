# 記事に必要なもの

* title
* mainImage
* thumbnail
* body
* createdAt

mainImageとthumbnailはURLをDBに持って、本体はS3にある。
mainImageとthumbnailがない記事は、サーバに配置されているデフォルトの画像を表示する。
titleとbodyは必須。

## 今後の流れ

### seedの登録

`npx tsx prisma/seeds/dev/connection_test_seed.ts`

### テーブル作成

### ダミーデータを直接投入

### 記事一覧画面と記事詳細画面をDBからデータ取得するように修正

mainImageとThumbnalのデフォルト画像を用意

### DBにデータを登録する画面とAPIの用意
