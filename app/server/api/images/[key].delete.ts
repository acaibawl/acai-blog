import { defineEventHandler, createError } from 'h3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { verifyAuth } from '~/server/utils/auth';
import { initializeS3Client } from '~/server/utils/s3';

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    await verifyAuth(event);

    // URLからキーを取得
    const key = event.context.params?.key;
    if (!key) {
      throw createError({
        statusCode: 400,
        statusMessage: '画像キーが指定されていません',
      });
    }

    // S3クライアントと設定を初期化
    const { s3Client, minioConfig } = initializeS3Client();

    // 画像を削除
    const decodedKey = decodeURIComponent(key);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: minioConfig.bucket,
        Key: decodedKey,
      }),
    );

    return {
      success: true,
      message: '画像が削除されました',
      key: decodedKey,
    };
  } catch (error: any) {
    console.error('画像削除エラー:', error);

    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'サーバーエラーが発生しました',
    });
  }
});
