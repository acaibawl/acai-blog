import { defineEventHandler, getQuery } from 'h3';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { verifyAuth } from '~/server/utils/auth';
import { 
  ImageItem, 
  PaginatedResponse, 
  filterImageFiles,
  generateImageUrl,
  initializeS3Client
} from '~/server/utils/s3';

// 画像一覧を取得するAPI
export default defineEventHandler(async (event): Promise<PaginatedResponse> => {
  try {
    // 認証チェック
    await verifyAuth(event);
    
    const query = getQuery(event);
    
    // ページネーションパラメータ
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    
    // S3クライアントと設定を初期化
    const { s3Client, minioConfig } = initializeS3Client();
    
    // S3からオブジェクト一覧を取得
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: minioConfig.bucket,
      MaxKeys: 1000 // 最大1000件取得
    });
    
    const response = await s3Client.send(listObjectsCommand);
    
    // 画像ファイルのみをフィルタリング
    const imageFiles = filterImageFiles(response.Contents || []);
    
    // 総件数
    const total = imageFiles.length;
    
    // 総ページ数
    const totalPages = Math.ceil(total / limit);
    
    // ページネーション処理
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    const paginatedFiles = imageFiles.slice(startIndex, endIndex);
    
    // 画像情報の整形
    const images: ImageItem[] = paginatedFiles.map(file => ({
      key: file.Key || '',
      url: generateImageUrl(file.Key || '', minioConfig),
      size: file.Size,
      lastModified: file.LastModified
    }));
    
    return {
      images,
      total,
      page,
      limit,
      totalPages
    };
  } catch (error: any) {
    console.error('画像一覧取得エラー:', error);
    throw error;
  }
});
