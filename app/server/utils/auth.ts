import type { H3Event } from 'h3';
import { createError, getRequestHeader } from 'h3';
import { verify } from 'jsonwebtoken';

/**
 * リクエストの認証を検証する
 * @param event H3Event
 * @returns デコードされたJWTペイロード
 * @throws 認証エラー
 */
export const verifyAuth = async (event: H3Event) => {
  // 認証ヘッダーの取得
  const authHeaderValue = getRequestHeader(event, 'authorization');
  if (!authHeaderValue) {
    throw createError({
      statusCode: 401,
      statusMessage: '認証が必要です',
    });
  }

  // トークンの検証
  try {
    const token = authHeaderValue.replace('Bearer ', '');
    const config = useRuntimeConfig(event);
    const decoded = verify(token, config.jwtSecret);
    return decoded;
  } catch (error) {
    console.error('認証に失敗しました:', error);
    throw createError({
      statusCode: 401,
      statusMessage: '認証に失敗しました',
    });
  }
};
