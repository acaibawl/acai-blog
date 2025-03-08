<script setup>
import { ref, onMounted } from 'vue';

const selectedFile = ref(null);
const previewUrl = ref('');
const isUploading = ref(false);
const uploadStatus = ref('');
const uploadedImageUrl = ref('');

// 画像一覧関連の状態
const images = ref([]);
const isLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const totalImages = ref(0);
const itemsPerPage = ref(20);

// 画像一覧を取得
const fetchImages = async (page = 1) => {
  isLoading.value = true;
  try {
    const response = await fetch(`/api/images?page=${page}&limit=${itemsPerPage.value}`);
    
    if (!response.ok) {
      throw new Error('画像一覧の取得に失敗しました');
    }
    
    const data = await response.json();
    
    images.value = data.images;
    totalImages.value = data.total;
    totalPages.value = data.totalPages;
    currentPage.value = data.page;
  } catch (error) {
    console.error('画像一覧取得エラー:', error);
  } finally {
    isLoading.value = false;
  }
};

// ページを変更
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchImages(page);
};

// 前のページへ
const prevPage = () => {
  if (currentPage.value > 1) {
    changePage(currentPage.value - 1);
  }
};

// 次のページへ
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    changePage(currentPage.value + 1);
  }
};

// 画像をクリップボードにコピー
const copyImageUrl = (url) => {
  navigator.clipboard.writeText(url)
    .then(() => {
      alert('画像URLをクリップボードにコピーしました');
    })
    .catch(err => {
      console.error('クリップボードへのコピーに失敗しました:', err);
    });
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  selectedFile.value = file;
  
  // プレビュー用のURLを作成
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const uploadImage = async () => {
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
      body: formData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'アップロードに失敗しました。');
    }
    
    uploadStatus.value = 'アップロード成功！';
    uploadedImageUrl.value = result.url;
    
    // アップロード成功後に画像一覧を更新
    await fetchImages(1);
  } catch (error) {
    console.error('アップロードエラー:', error);
    uploadStatus.value = `エラー: ${error.message}`;
  } finally {
    isUploading.value = false;
  }
};

const resetForm = () => {
  selectedFile.value = null;
  previewUrl.value = '';
  uploadStatus.value = '';
  uploadedImageUrl.value = '';
  
  // ファイル入力をリセット
  const fileInput = document.getElementById('file-input');
  if (fileInput) fileInput.value = '';
};

// コンポーネントがマウントされたときに画像一覧を取得
onMounted(() => {
  fetchImages();
});
</script>

<template>
  <div class="image-upload-container">
    <h1 class="page-title">画像アップロード</h1>
    
    <div class="upload-form">
      <div class="form-group">
        <label for="file-input" class="form-label">画像ファイルを選択</label>
        <input 
          type="file" 
          id="file-input" 
          accept="image/*" 
          @change="handleFileChange" 
          class="file-input"
        />
        <div class="file-input-button">
          ファイルを選択
          <input 
            type="file" 
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
        <img :src="uploadedImageUrl" alt="アップロードされた画像" class="uploaded-image-preview" />
      </div>
    </div>
    
    <!-- 画像一覧セクション -->
    <div class="image-gallery-section">
      <h2 class="section-title">アップロード済み画像一覧</h2>
      
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
            <p class="image-date">{{ new Date(image.lastModified).toLocaleString() }}</p>
            <button @click="copyImageUrl(image.url)" class="copy-url-button">
              URLをコピー
            </button>
          </div>
        </div>
      </div>
      
      <!-- ページネーション -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="prevPage" 
          class="pagination-button" 
          :disabled="currentPage <= 1"
        >
          前へ
        </button>
        
        <div class="pagination-info">
          {{ currentPage }} / {{ totalPages }} ページ (全{{ totalImages }}件)
        </div>
        
        <button 
          @click="nextPage" 
          class="pagination-button" 
          :disabled="currentPage >= totalPages"
        >
          次へ
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.upload-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
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

.file-input {
  display: none;
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
  max-height: 300px;
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

.upload-button, .reset-button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
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
  margin-top: 30px;
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
  max-height: 200px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 画像ギャラリーのスタイル */
.image-gallery-section {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.loading-indicator, .no-images-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.image-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s;
  background-color: #f9f9f9;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.image-container {
  height: 150px;
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
  padding: 10px;
}

.image-name {
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-date {
  margin: 0 0 10px;
  font-size: 12px;
  color: #666;
}

.copy-url-button {
  width: 100%;
  padding: 6px 0;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-url-button:hover {
  background-color: #3a7bc8;
}

/* ページネーション */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-button {
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #3a7bc8;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  margin: 0 15px;
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 480px) {
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
