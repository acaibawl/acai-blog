import { createError } from 'h3';
import { randomUUID } from 'crypto';
import formidable from 'formidable';
import path from 'path';

/**
 * アップロードされたファイルのインターフェース
 */
export interface UploadedFile {
  filepath?: string;
  path?: string;
  mimetype?: string;
  type?: string;
  originalFilename?: string;
  originalname?: string;
  name?: string;
  [key: string]: any;
}

/**
 * ファイルのパース処理
 */
export const parseFile = async (req: any): Promise<{ fields: any; files: any }> => {
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

/**
 * ファイルタイプの検証
 */
export const validateFileType = (file: UploadedFile): string => {
  const mimeType = file.mimetype || file.type || '';
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(mimeType)) {
    throw createError({
      statusCode: 400,
      statusMessage: '許可されていないファイル形式です。JPEG、PNG、GIF、WEBPのみ許可されています。',
    });
  }

  return mimeType;
};

/**
 * ファイル名の生成
 */
export const generateFileName = (file: UploadedFile): string => {
  const originalFilename = file.originalFilename || file.originalname || file.name || 'unknown.jpg';
  const fileExt = path.extname(originalFilename);
  return `${randomUUID()}${fileExt}`;
};

/**
 * ファイルパスの取得
 */
export const getFilePath = (file: UploadedFile): string => {
  const filePath = file.filepath || file.path;
  if (!filePath) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ファイルパスが見つかりません。',
    });
  }
  return filePath;
};
