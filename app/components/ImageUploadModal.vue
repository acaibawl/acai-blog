<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { ImageItem } from '~/server/utils/s3';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'image-uploaded']);

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>('');
const isUploading = ref<boolean>(false);
const uploadStatus = ref<string>('');
const uploadedImageUrl = ref<string>('');

// 画像一覧関連の状態
const images = ref<ImageItem[]>([]);
const isLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const totalPages = ref<number>(0);
const totalImages = ref<number>(0);
const itemsPerPage = ref<number>(10);

// 認証関連
const { status } = useAuth();
const authToken = useCookie('auth.token');

// 表示するページ番号の数
const maxPageButtons = 5;

// 表示するページ番号の配列を計算
const pageNumbers = computed(() => {
  if (totalPages.value <= 1) return [];
  
  // 表示するページ番号の範囲を計算
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages.value, startPage + maxPageButtons - 1);
  
  // 最大表示数に満たない場合、startPageを調整
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  // ページ番号の配列を生成
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
});

// 日付のフォーマット
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '日付なし';
  
  try {
    return new Date(date).toLocaleString();
  } catch (error) {
    return '無効な日付';
  }
};

// 認証状態の確認
const checkAuth = (): boolean => {
  if (status.value !== 'authenticated' || !authToken.value) {
    uploadStatus.value = 'エラー: ログインが必要です。';
    return false;
  }
  return true;
};

// 最初のページに移動
const goToFirstPage = (): void => {
  if (currentPage.value !== 1) {
    changePage(1);
  }
};

// 最後のページに移動
const goToLastPage = (): void => {
  if (currentPage.value !== totalPages.value) {
    changePage(totalPages.value);
  }
};

// 画像一覧を取得
const fetchImages = async (page = 1): Promise<void> => {
  if (!checkAuth()) return;
  
  isLoading.value = true;
  try {
    const response = await fetch(`/api/images?page=${page}&limit=${itemsPerPage.value}`, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.statusMessage || '画像一覧の取得に失敗しました');
    }
    
    const data = await response.json();
    
    images.value = data.images;
    totalImages.value = data.total;
    totalPages.value = data.totalPages;
    currentPage.value = data.page;
  } catch (error: unknown) {
    console.error('画像一覧取得エラー:', error);
    if (error instanceof Error) {
      uploadStatus.value = `エラー: ${error.message}`;
    } else {
      uploadStatus.value = 'エラー: 不明なエラーが発生しました';
    }
  } finally {
    isLoading.value = false;
  }
};

// 画像を削除
const deleteImage = async (image: ImageItem): Promise<void> => {
  if (!checkAuth()) return;
  
  if (!confirm(`「${image.key.split('/').pop()}」を削除してもよろしいですか？`)) {
    return;
  }
  
  try {
    // キーをエンコードしてURLに含める
    const encodedKey = encodeURIComponent(image.key);
    
    const response = await fetch(`/api/images/${encodedKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.statusMessage || '画像の削除に失敗しました');
    }
    
    // 削除成功
    uploadStatus.value = '画像を削除しました';
    
    // 画像一覧を更新
    await fetchImages(currentPage.value);
    
    // 3秒後にステータスメッセージをクリア
    setTimeout(() => {
      if (uploadStatus.value === '画像を削除しました') {
        uploadStatus.value = '';
      }
    }, 3000);
  } catch (error: unknown) {
    console.error('画像削除エラー:', error);
    if (error instanceof Error) {
      uploadStatus.value = `エラー: ${error.message}`;
    } else {
      uploadStatus.value = 'エラー: 不明なエラーが発生しました';
    }
  }
};

// ページを変更
const changePage = (page: number): void => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchImages(page);
};

// 前のページへ
const prevPage = (): void => {
  if (currentPage.value > 1) {
    changePage(currentPage.value - 1);
  }
};

// 次のページへ
const nextPage = (): void => {
  if (currentPage.value < totalPages.value) {
    changePage(currentPage.value + 1);
  }
};

// 画像をクリップボードにコピー
const copyImageUrl = (url: string): void => {
  navigator.clipboard.writeText(url)
    .then(() => {
      alert('画像URLをクリップボードにコピーしました');
    })
    .catch(err => {
      console.error('クリップボードへのコピーに失敗しました:', err);
    });
};

// 画像を選択して親コンポーネントに通知
const selectImage = (url: string): void => {
  emit('image-uploaded', url);
  closeModal();
};

const handleFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  
  selectedFile.value = file;
  
  // プレビュー用のURLを作成
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    if (e.target?.result) {
      previewUrl.value = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
};

const uploadImage = async (): Promise<void> => {
  if (!checkAuth()) return;
  
  if (!selectedFile.value) {
    uploadStatus.value = 'エラー: ファイルが選択されていません。';
    return;
  }

  isUploading.value = true;
  uploadStatus.value = 'アップロード中...';
  
  try {
    const formData = new FormData();
    formData.append('image', selectedFile.value);
    
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.statusMessage || 'アップロードに失敗しました。');
    }
    
    uploadStatus.value = 'アップロード成功！';
    uploadedImageUrl.value = result.url;
    
    // アップロード成功後に画像一覧を更新
    await fetchImages(1);
    
    // 親コンポーネントに通知
    emit('image-uploaded', result.url);
  } catch (error: unknown) {
    console.error('アップロードエラー:', error);
    if (error instanceof Error) {
      uploadStatus.value = `エラー: ${error.message}`;
    } else {
      uploadStatus.value = 'エラー: 不明なエラーが発生しました';
    }
  } finally {
    isUploading.value = false;
  }
};

const resetForm = (): void => {
  selectedFile.value = null;
  previewUrl.value = '';
  uploadStatus.value = '';
  uploadedImageUrl.value = '';
  
  // ファイル入力をリセット
  const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
  if (fileInput) fileInput.value = '';
};

const closeModal = (): void => {
  emit('close');
};

// コンポーネントがマウントされたときに画像一覧を取得
onMounted(() => {
  if (status.value === 'authenticated') {
    fetchImages();
  }
});
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">画像アップロード</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="status !== 'authenticated'" class="auth-message">
          <p>画像のアップロードと閲覧にはログインが必要です。</p>
        </div>
        
        <div v-else>
          <div class="upload-form">
            <div class="form-group">
              <label for="file-input" class="form-label">画像ファイルを選択</label>
              <div class="file-input-button">
                ファイルを選択
                <input 
                  type="file" 
                  id="file-input"
                  accept="image/*" 
                  @change="handleFileChange" 
                  class="file-input-hidden"
                />
              </div>
              <span v-if="selectedFile" class="selected-file-name">
                {{ selectedFile.name }}
              </span>
            </div>
            
            <div v-if="previewUrl" class="preview-container">
              <h3>プレビュー</h3>
              <img :src="previewUrl" alt="プレビュー" class="image-preview" />
            </div>
            
            <div class="form-actions">
              <button 
                @click="uploadImage" 
                class="upload-button" 
                :disabled="!selectedFile || isUploading"
              >
                {{ isUploading ? 'アップロード中...' : 'アップロード' }}
              </button>
              <button 
                @click="resetForm" 
                class="reset-button" 
                :disabled="isUploading"
              >
                リセット
              </button>
            </div>
            
            <div v-if="uploadStatus" :class="['status-message', { 'error': uploadStatus.includes('エラー') }]">
              {{ uploadStatus }}
            </div>
            
            <div v-if="uploadedImageUrl" class="uploaded-image-info">
              <h3>アップロード完了</h3>
              <p>画像URL: <a :href="uploadedImageUrl" target="_blank">{{ uploadedImageUrl }}</a></p>
              <button @click="selectImage(uploadedImageUrl)" class="select-image-button">
                この画像を選択
              </button>
              <img :src="uploadedImageUrl" alt="アップロードされた画像" class="uploaded-image-preview" />
            </div>
          </div>
          
          <!-- 画像一覧セクション -->
          <div class="image-gallery-section">
            <h3 class="section-title">アップロード済み画像一覧</h3>
            
            <div v-if="isLoading" class="loading-indicator">
              <p>読み込み中...</p>
            </div>
            
            <div v-else-if="images.length === 0" class="no-images-message">
              <p>アップロードされた画像はありません</p>
            </div>
            
            <div v-else class="image-gallery">
              <div v-for="image in images" :key="image.key" class="image-card">
                <div class="image-container">
                  <img :src="image.url" :alt="image.key" class="gallery-image" />
                </div>
                <div class="image-info">
                  <p class="image-name">{{ image.key.split('/').pop() }}</p>
                  <p class="image-date">{{ formatDate(image.lastModified) }}</p>
                  <div class="image-actions">
                    <button @click="copyImageUrl(image.url)" class="copy-url-button">
                      URLをコピー
                    </button>
                    <button @click="selectImage(image.url)" class="select-image-button">
                      選択
                    </button>
                    <button @click="deleteImage(image)" class="delete-image-button">
                      削除
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- ページネーション -->
            <div v-if="totalPages > 1" class="pagination">
              <!-- 最初のページへ -->
              <button 
                @click="goToFirstPage" 
                class="pagination-button pagination-nav"
                :disabled="currentPage <= 1"
                title="最初のページへ"
              >
                &laquo;
              </button>
              
              <!-- 前のページへ -->
              <button 
                @click="prevPage" 
                class="pagination-button pagination-nav"
                :disabled="currentPage <= 1"
                title="前のページへ"
              >
                &lsaquo;
              </button>
              
              <!-- ページ番号 -->
              <div class="pagination-numbers">
                <button 
                  v-for="page in pageNumbers" 
                  :key="page"
                  @click="changePage(page)"
                  :class="[
                    'pagination-button', 
                    'pagination-number', 
                    { 'active': page === currentPage }
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              
              <!-- 次のページへ -->
              <button 
                @click="nextPage" 
                class="pagination-button pagination-nav"
                :disabled="currentPage >= totalPages"
                title="次のページへ"
              >
                &rsaquo;
              </button>
              
              <!-- 最後のページへ -->
              <button 
                @click="goToLastPage" 
                class="pagination-button pagination-nav"
                :disabled="currentPage >= totalPages"
                title="最後のページへ"
              >
                &raquo;
              </button>
              
              <div class="pagination-info">
                (全{{ totalImages }}件)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 20px;
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.auth-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.upload-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.file-input-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  margin-right: 10px;
}

.file-input-button:hover {
  background-color: #e0e0e0;
}

.file-input-hidden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.selected-file-name {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.preview-container {
  margin: 20px 0;
  text-align: center;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.upload-button, .reset-button, .select-image-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button {
  background-color: #4a90e2;
  color: white;
}

.upload-button:hover:not(:disabled) {
  background-color: #3a7bc8;
}

.reset-button {
  background-color: #f5f5f5;
  color: #333;
}

.reset-button:hover:not(:disabled) {
  background-color: #e5e5e5;
}

.select-image-button {
  background-color: #4caf50;
  color: white;
  width: 100%;
  margin-top: 10px;
}

.select-image-button:hover {
  background-color: #3d8b40;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-message.error {
  background-color: #ffebee;
  color: #c62828;
}

.uploaded-image-info {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.uploaded-image-info h3 {
  margin-top: 0;
  color: #333;
}

.uploaded-image-info a {
  color: #4a90e2;
  word-break: break-all;
}

.uploaded-image-preview {
  max-width: 100%;
  max-height: 150px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 画像ギャラリーのスタイル */
.image-gallery-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
  text-align: center;
}

.loading-indicator, .no-images-message {
  text-align: center;
  padding: 15px;
  color: #666;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.image-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s;
  background-color: #f9f9f9;
}

.image-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.image-container {
  height: 100px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eee;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info {
  padding: 8px;
}

.image-name {
  margin: 0 0 3px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-date {
  margin: 0 0 5px;
  font-size: 10px;
  color: #666;
}

.image-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.copy-url-button, .select-image-button, .delete-image-button {
  width: 100%;
  padding: 5px 0;
  font-size: 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-url-button {
  background-color: #4a90e2;
  color: white;
}

.copy-url-button:hover {
  background-color: #3a7bc8;
}

.select-image-button {
  background-color: #4caf50;
  color: white;
}

.select-image-button:hover {
  background-color: #3d8b40;
}

.delete-image-button {
  background-color: #f44336;
  color: white;
  margin-top: 5px;
}

.delete-image-button:hover {
  background-color: #d32f2f;
}

/* ページネーション */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  flex-wrap: wrap;
  gap: 5px;
}

.pagination-button {
  padding: 6px 10px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 30px;
  text-align: center;
  font-size: 12px;
}

.pagination-nav {
  font-weight: bold;
}

.pagination-number.active {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.pagination-button:hover:not(:disabled):not(.active) {
  background-color: #e0e0e0;
  border-color: #ccc;
}

.pagination-button:disabled {
  background-color: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 5px;
}

.pagination-info {
  margin-left: 10px;
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .pagination {
    gap: 3px;
  }
  
  .pagination-button {
    padding: 5px 8px;
    min-width: 28px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
  }
  
  .pagination-info {
    width: 100%;
    text-align: center;
    margin-top: 5px;
    margin-left: 0;
  }
}
</style> 
