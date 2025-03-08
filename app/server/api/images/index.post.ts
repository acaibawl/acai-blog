import { createError } from 'h3';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// 型定義
interface UploadedFile {
  filepath?: string;
  path?: string;
  mimetype?: string;
  type?: string;
  originalFilename?: string;
  originalname?: string;
  name?: string;
  [key: string]: any;
}

interface UploadResponse {
  success: boolean;
  url: string;
  fileName: string;
}

// S3クライアントの初期化
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

// ファイルのパース処理
const parseFile = async (req: any): Promise<{ fields: any; files: any }> => {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB制限
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

// ファイルタイプの検証
const validateFileType = (file: UploadedFile) => {
  const mimeType = file.mimetype || file.type || '';
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(mimeType)) {
    throw createError({
      statusCode: 400,
      statusMessage: '許可されていないファイル形式です。JPEG、PNG、GIF、WEBPのみ許可されています。'
    });
  }
  
  return mimeType;
};

// ファイル名の生成
const generateFileName = (file: UploadedFile): string => {
  const originalFilename = file.originalFilename || file.originalname || file.name || 'unknown.jpg';
  const fileExt = path.extname(originalFilename);
  return `${randomUUID()}${fileExt}`;
};

// ファイルパスの取得
const getFilePath = (file: UploadedFile): string => {
  const filePath = file.filepath || file.path;
  if (!filePath) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ファイルパスが見つかりません。'
    });
  }
  return filePath;
};

// S3へのアップロード
const uploadToS3 = async (
  s3Client: S3Client, 
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
    const config = useRuntimeConfig();
    const s3Client = createS3Client();
    const bucketName = config.minioBucket;

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
    await uploadToS3(s3Client, bucketName, fileName, filePath, mimeType);

    // 画像のURLを生成
    const imageUrlBase = config.minioImageUrlBase || config.minioEndpoint;
    const imageUrl = `${imageUrlBase}/${bucketName}/${fileName}`;

    return {
      success: true,
      url: imageUrl,
      fileName: fileName
    };
  } catch (error: any) {
    console.error('画像アップロードエラー:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '画像のアップロード中にエラーが発生しました。'
    });
  }
}); 