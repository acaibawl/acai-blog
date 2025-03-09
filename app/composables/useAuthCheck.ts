import { ref } from 'vue';
import type { Ref } from 'vue';

/**
 * 認証状態をチェックするためのcomposable
 * @param {Ref<string>} errorMessageRef - エラーメッセージを格納するref
 * @returns {Object} 認証チェック関連の関数とステート
 */
export const useAuthCheck = (errorMessageRef?: Ref<string>) => {
  // 認証関連
  const { status } = useAuth();
  const authToken = useCookie('auth.token');
  const authError = ref<string>('');

  /**
   * 認証状態を確認する
   * @param {string} [customErrorMessage='ログインが必要です。'] - 認証エラー時のカスタムメッセージ
   * @returns {boolean} 認証されているかどうか
   */
  const checkAuth = (customErrorMessage: string = 'ログインが必要です。'): boolean => {
    if (status.value !== 'authenticated' || !authToken.value) {
      const errorMsg = `エラー: ${customErrorMessage}`;
      
      // 外部から提供されたエラーメッセージrefがある場合はそちらも更新
      if (errorMessageRef) {
        errorMessageRef.value = errorMsg;
      }
      
      // 内部のエラーメッセージも更新
      authError.value = errorMsg;
      return false;
    }
    return true;
  };

  /**
   * 認証トークンを取得する
   * @returns {string|null} 認証トークン
   */
  const getAuthToken = (): string | null => {
    return authToken.value || null;
  };

  /**
   * 認証ヘッダーを取得する
   * @returns {Object|null} Authorization ヘッダーを含むオブジェクト
   */
  const getAuthHeaders = (): Record<string, string> | null => {
    const token = getAuthToken();
    if (!token) return null;
    
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  return {
    status,
    authToken,
    authError,
    checkAuth,
    getAuthToken,
    getAuthHeaders
  };
}; 