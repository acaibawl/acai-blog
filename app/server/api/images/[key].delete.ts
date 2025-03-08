import { defineEventHandler, createError } from 'h3';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { verifyAuth } from '~/server/utils/auth';

// S3クライアントの作成
const createS3Client = () => {
  const config = useRuntimeConfig();
  return new S3Client({
    endpoint: config.minioEndpoint,
    region: 'ap-northeast-1',
    credentials: {
      accessKeyId: config.minioAccessKey,
      secretAccessKey: config.minioSecretKey
    },
    forcePathStyle: true // MinIOではパススタイルのURLを使用
  });
};

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

    // S3バケット名を取得
    const config = useRuntimeConfig();
    const bucketName = config.minioBucket;
    if (!bucketName) {
      throw createError({
        statusCode: 500,
        statusMessage: 'S3バケット名が設定されていません',
      });
    }

    // S3クライアントを作成
    const s3Client = createS3Client();

    // 画像を削除
    const decodedKey = decodeURIComponent(key);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: decodedKey,
      })
    );

    return {
      success: true,
      message: '画像が削除されました',
      key: decodedKey,
    };
  } catch (error: any) {
    console.error('画像削除エラー:', error);
    
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        statusMessage: 'サーバーエラーが発生しました',
      });
    }
    
    throw error;
  }
}); 