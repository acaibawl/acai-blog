import { defineEventHandler, createError, readMultipartFormData } from 'h3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { randomUUID } from 'crypto';
import { verifyAuth } from '~/server/utils/auth';
import {
  generateImageUrl,
  initializeS3Client,
} from '~/server/utils/s3';

// レスポンスの型定義
interface UploadResponse {
  success: boolean;
  url: string;
  fileName: string;
}

// 許可されているMIMEタイプ
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// ファイル名の生成
const generateFileName = (originalName: string = 'unknown.jpg'): string => {
  const fileExt = path.extname(originalName) || '.jpg';
  return `${randomUUID()}${fileExt}`;
};

// S3へのアップロード
const uploadToS3 = async (
  s3Client: any,
  bucketName: string,
  fileName: string,
  fileContent: Buffer,
  contentType: string,
): Promise<void> => {
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ContentType: contentType || 'application/octet-stream',
  });

  await s3Client.send(putCommand);
};

// メインハンドラー
export default defineEventHandler(async (event): Promise<UploadResponse> => {
  try {
    // 認証チェック
    await verifyAuth(event);

    // S3クライアントと設定を初期化
    const { s3Client, minioConfig } = initializeS3Client();

    // マルチパートフォームデータを読み込む
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ファイルが見つかりません。',
      });
    }

    // フォームデータから画像ファイルを取得
    const imageFile = formData.find(part => part.name === 'image');
    if (!imageFile || !imageFile.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ファイルが見つかりません。',
      });
    }

    // ファイルタイプの検証
    const mimeType = imageFile.type || '';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw createError({
        statusCode: 400,
        statusMessage: '許可されていないファイル形式です。JPEG、PNG、GIF、WEBPのみ許可されています。',
      });
    }

    // ファイル名の生成
    const fileName = generateFileName(imageFile.filename);

    // S3にアップロード
    await uploadToS3(s3Client, minioConfig.bucket, fileName, imageFile.data, mimeType);

    // 画像のURLを生成
    const imageUrl = generateImageUrl(fileName, minioConfig);

    return {
      success: true,
      url: imageUrl,
      fileName: fileName,
    };
  } catch (error: any) {
    console.error('画像アップロードエラー:', error);

    // 認証エラーはverifyAuth内で処理されるため、それ以外のエラーを処理
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        statusMessage: '画像のアップロード中にエラーが発生しました。',
      });
    }

    // 既に適切なエラーが生成されている場合はそのまま再スロー
    throw error;
  }
});
