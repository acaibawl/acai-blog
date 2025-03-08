import { createError } from 'h3';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

// 型定義
interface ImageItem {
  key: string;
  url: string;
  size?: number;
  lastModified?: Date;
}

interface PaginatedResponse {
  images: ImageItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MinioConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  imageUrlBase: string;
}

// S3クライアントの初期化
const createS3Client = (config: MinioConfig): S3Client => {
  return new S3Client({
    endpoint: config.endpoint,
    region: 'ap-northeast-1',
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey
    },
    forcePathStyle: true
  });
};

// 設定の検証
const validateConfig = (config: MinioConfig): void => {
  if (!config.endpoint || !config.bucket) {
    console.error('MinIO設定が見つかりません:', {
      endpoint: config.endpoint,
      bucket: config.bucket
    });
    throw createError({
      statusCode: 500,
      statusMessage: 'ストレージの設定が正しくありません。'
    });
  }
};

// 画像ファイルのフィルタリング
const filterImageFiles = (contents: any[]): any[] => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return contents.filter(obj => {
    const key = obj.Key || '';
    return imageExtensions.some(ext => key.toLowerCase().endsWith(ext));
  });
};

// 画像一覧を取得するAPI
export default defineEventHandler(async (event): Promise<PaginatedResponse> => {
  try {
    const config = useRuntimeConfig();
    const query = getQuery(event);
    
    // ページネーションパラメータ
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;
    
    // MinIO設定
    const minioConfig: MinioConfig = {
      endpoint: config.minioEndpoint || '',
      accessKey: config.minioAccessKey || '',
      secretKey: config.minioSecretKey || '',
      bucket: config.minioBucket || '',
      imageUrlBase: config.minioImageUrlBase || config.minioEndpoint || ''
    };
    
    // 設定を検証
    validateConfig(minioConfig);
    
    // S3クライアントの初期化
    const s3Client = createS3Client(minioConfig);
    
    // 全オブジェクトを取得
    const listCommand = new ListObjectsV2Command({
      Bucket: minioConfig.bucket,
      MaxKeys: 1000 // 最大1000件まで取得
    });
    
    const response = await s3Client.send(listCommand);
    
    if (!response.Contents || response.Contents.length === 0) {
      return {
        images: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
    
    // 画像ファイルのみをフィルタリング
    const imageObjects = filterImageFiles(response.Contents);
    
    // 日付の新しい順にソート
    imageObjects.sort((a, b) => {
      const dateA = a.LastModified?.getTime() || 0;
      const dateB = b.LastModified?.getTime() || 0;
      return dateB - dateA;
    });
    
    // ページネーション
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedImages = imageObjects.slice(startIndex, endIndex);
    
    // 画像URLを生成
    const images: ImageItem[] = paginatedImages.map(obj => {
      const key = obj.Key || '';
      const urlBase = minioConfig.imageUrlBase || minioConfig.endpoint;
      return {
        key,
        url: `${urlBase}/${minioConfig.bucket}/${key}`,
        size: obj.Size,
        lastModified: obj.LastModified
      };
    });
    
    // レスポンスを返す
    return {
      images,
      total: imageObjects.length,
      page,
      limit,
      totalPages: Math.ceil(imageObjects.length / limit)
    };
    
  } catch (error: any) {
    console.error('画像一覧取得エラー:', error);
    
    // AWS S3エラーの詳細をログに出力
    if (error.code || error.$metadata) {
      console.error('AWS S3エラー詳細:', {
        code: error.code,
        message: error.message,
        metadata: error.$metadata
      });
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || '画像一覧の取得中にエラーが発生しました。'
    });
  }
}); 