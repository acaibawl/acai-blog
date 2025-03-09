import { S3Client } from '@aws-sdk/client-s3';
import { createError } from 'h3';

/**
 * MinIO/S3の設定インターフェース
 */
export interface MinioConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  imageUrlBase: string;
}

/**
 * 画像アイテムのインターフェース
 */
export interface ImageItem {
  key: string;
  url: string;
  size?: number;
  lastModified?: Date;
}

/**
 * ページネーション付きレスポンスのインターフェース
 */
export interface PaginatedResponse {
  images: ImageItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * ランタイム設定からMinIO設定を取得
 */
export const getMinioConfig = (): MinioConfig => {
  const config = useRuntimeConfig();
  
  return {
    endpoint: config.minioEndpoint || '',
    accessKey: config.minioAccessKey || '',
    secretKey: config.minioSecretKey || '',
    bucket: config.minioBucket || '',
    imageUrlBase: config.minioImageUrlBase || config.minioEndpoint || ''
  };
};

/**
 * MinIO設定を検証
 */
export const validateMinioConfig = (config: MinioConfig): void => {
  if (!config.endpoint) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MinIOエンドポイントが設定されていません',
    });
  }
  
  if (!config.accessKey || !config.secretKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MinIOアクセスキーまたはシークレットキーが設定されていません',
    });
  }
  
  if (!config.bucket) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MinIOバケット名が設定されていません',
    });
  }
};

/**
 * S3クライアントを作成
 */
export const createS3Client = (config?: MinioConfig): S3Client => {
  const minioConfig = config || getMinioConfig();
  
  return new S3Client({
    endpoint: minioConfig.endpoint,
    region: 'ap-northeast-1',
    credentials: {
      accessKeyId: minioConfig.accessKey,
      secretAccessKey: minioConfig.secretKey
    },
    forcePathStyle: true // MinIOではパススタイルのURLを使用
  });
};

/**
 * 画像ファイルをフィルタリング
 */
export const filterImageFiles = (contents: any[]): any[] => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return contents.filter(obj => {
    const key = obj.Key || '';
    return imageExtensions.some(ext => key.toLowerCase().endsWith(ext));
  });
};

/**
 * 画像のURLを生成
 */
export const generateImageUrl = (key: string, config: MinioConfig): string => {
  // URLベースの末尾のスラッシュを処理
  const baseUrl = config.imageUrlBase.endsWith('/')
    ? config.imageUrlBase
    : `${config.imageUrlBase}/`;
  
  // キーの先頭のスラッシュを処理
  const processedKey = key.startsWith('/') ? key.substring(1) : key;
  // 本番環境では、baseUrlにバケット名が含まれているので、そのまま返す（minIOとS3の違い）
  return process.env.NODE_ENV === 'production' ?  `${baseUrl}${processedKey}` : `${baseUrl}${config.bucket}/${processedKey}`;
};

/**
 * MinIO設定を取得し、検証して、S3クライアントを初期化する共通関数
 * @returns S3クライアントとMinIO設定
 */
export const initializeS3Client = (): { s3Client: any; minioConfig: MinioConfig } => {
  // MinIO設定を取得
  const minioConfig = getMinioConfig();
  
  // 設定を検証
  validateMinioConfig(minioConfig);
  
  // S3クライアントを作成
  const s3Client = createS3Client(minioConfig);
  
  return { s3Client, minioConfig };
}; 