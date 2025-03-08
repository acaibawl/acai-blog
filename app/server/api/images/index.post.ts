import { defineEventHandler, createError } from 'h3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import { verifyAuth } from '~/server/utils/auth';
import { 
  createS3Client, 
  getMinioConfig, 
  validateMinioConfig,
  generateImageUrl
} from '~/server/utils/s3';
import {
  parseFile,
  validateFileType,
  generateFileName,
  getFilePath
} from '~/server/utils/fileUpload';

// レスポンスの型定義
interface UploadResponse {
  success: boolean;
  url: string;
  fileName: string;
}

// S3へのアップロード
const uploadToS3 = async (
  s3Client: any, 
  bucketName: string, 
  fileName: string, 
  filePath: string, 
  contentType: string
): Promise<void> => {
  const fileContent = fs.readFileSync(filePath);
  
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ContentType: contentType || 'application/octet-stream'
  });

  await s3Client.send(putCommand);
  
  // 一時ファイルを削除
  fs.unlinkSync(filePath);
};

// メインハンドラー
export default defineEventHandler(async (event): Promise<UploadResponse> => {
  try {
    // 認証チェック
    await verifyAuth(event);
    
    // MinIO設定を取得
    const minioConfig = getMinioConfig();
    
    // 設定を検証
    validateMinioConfig(minioConfig);
    
    // S3クライアントを作成
    const s3Client = createS3Client(minioConfig);

    // ファイルをパース
    const { files } = await parseFile(event.node.req);
    
    // ファイルが存在するか確認
    let imageFile = files.image;
    if (!imageFile) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ファイルが見つかりません。'
      });
    }

    // 配列の場合は最初の要素を使用
    if (Array.isArray(imageFile)) {
      imageFile = imageFile[0];
    }

    // ファイルタイプの検証
    const mimeType = validateFileType(imageFile);

    // ファイル名の生成
    const fileName = generateFileName(imageFile);

    // ファイルパスの取得
    const filePath = getFilePath(imageFile);

    // S3にアップロード
    await uploadToS3(s3Client, minioConfig.bucket, fileName, filePath, mimeType);

    // 画像のURLを生成
    const imageUrl = generateImageUrl(fileName, minioConfig);

    return {
      success: true,
      url: imageUrl,
      fileName: fileName
    };
  } catch (error: any) {
    console.error('画像アップロードエラー:', error);
    
    // 認証エラーはverifyAuth内で処理されるため、それ以外のエラーを処理
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        statusMessage: '画像のアップロード中にエラーが発生しました。'
      });
    }
    
    // 既に適切なエラーが生成されている場合はそのまま再スロー
    throw error;
  }
}); 