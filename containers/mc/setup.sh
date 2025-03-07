#!/bin/sh

# MinIOサーバーが起動するまで待機
echo "MinIOサーバーの起動を待機中..."
sleep 5

# MinIOクライアントの設定
echo "MinIOクライアントを設定中..."
/usr/bin/mc config host add myminio http://minio:9000 minioadmin minioadmin

# バケットの作成
echo "バケットを作成中..."
/usr/bin/mc mb --ignore-existing myminio/acai-blog

# カスタムポリシーの適用
echo "読み取り専用ポリシーを適用中..."
/usr/bin/mc anonymous set download myminio/acai-blog

echo "セットアップ完了!"
