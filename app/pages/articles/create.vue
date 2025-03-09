<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ImageUploadModal from '~/components/ImageUploadModal.vue';

useHead({
  title: '記事投稿',
});

const title = ref<string>('');
const body = ref<string>('');
const errorMessage = ref<string>('');
const showPreview = ref<boolean>(false);
const showImageUploadModal = ref<boolean>(false);
const thumbnailUrl = ref<string>(''); // サムネイル画像URL
const mainImageUrl = ref<string>(''); // メイン画像URL
const isForThumbnail = ref<boolean>(false); // サムネイル用の画像選択モード
const isForMainImage = ref<boolean>(false); // メイン画像用の画像選択モード
const router = useRouter();

// テキストエリアの参照を保持
const bodyTextarea = ref<HTMLTextAreaElement | null>(null);

const togglePreview = (): void => {
  showPreview.value = !showPreview.value;
};

const openImageUploadModal = (mode = 'content'): void => {
  isForThumbnail.value = mode === 'thumbnail';
  isForMainImage.value = mode === 'main';
  showImageUploadModal.value = true;
};

const closeImageUploadModal = (): void => {
  showImageUploadModal.value = false;
};

// 画像URLを受け取ってMarkdownの画像タグを挿入する
const handleImageUploaded = (imageUrl: string): void => {
  if (isForThumbnail.value) {
    // サムネイル画像として設定
    thumbnailUrl.value = imageUrl;
  } else if (isForMainImage.value) {
    // メイン画像として設定
    mainImageUrl.value = imageUrl;
  } else {
    // 本文に画像を挿入
    // Markdownの画像タグを作成
    const imageMarkdown = `![画像](${imageUrl})`;
    
    // テキストエリアにフォーカスがある場合はカーソル位置に挿入
    if (bodyTextarea.value) {
      const textarea = bodyTextarea.value;
      const startPos = textarea.selectionStart || 0;
      const endPos = textarea.selectionEnd || 0;
      
      // 現在のテキストを取得
      const currentText = body.value;
      
      // カーソル位置に画像タグを挿入
      body.value = currentText.substring(0, startPos) + imageMarkdown + currentText.substring(endPos);
      
      // カーソル位置を更新
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = startPos + imageMarkdown.length;
        textarea.selectionEnd = startPos + imageMarkdown.length;
      }, 0);
    } else {
      // フォーカスがない場合は末尾に追加
      body.value += (body.value ? '\n\n' : '') + imageMarkdown;
    }
  }
  
  // モーダルを閉じる
  closeImageUploadModal();
};

// サムネイル画像をクリア
const clearThumbnail = (): void => {
  thumbnailUrl.value = '';
};

// メイン画像をクリア
const clearMainImage = (): void => {
  mainImageUrl.value = '';
};

const handleSubmit = async (): Promise<void> => {
  try {
    const authToken = useCookie('auth.token');
    if (!authToken.value) {
      errorMessage.value = 'ログインしてください。';
      throw new Error('ログインしてください。');
    }

    // 記事を投稿するAPIを呼び出す
    const { data, error } = await useFetch('/api/articles/create', {
      method: 'POST',
      body: { 
        title: title.value, 
        body: body.value,
        thumbnail_url: thumbnailUrl.value || null,
        main_image_url: mainImageUrl.value || null
      },
      headers: {
        Authorization: `Bearer ${authToken.value}`
      }
    });
    
    if (error.value) {
      errorMessage.value = 'ログイン情報が不正です。';
      throw new Error('ログイン情報が不正です。');
    }
    
    if (data.value?.id) {
      router.push(`/articles/${data.value.id}`);
    } else {
      errorMessage.value = '記事の投稿に失敗しました。';
    }
  } catch (error: unknown) {
    errorMessage.value = '記事の投稿に失敗しました。';
    if (error instanceof Error) {
      console.error('記事の投稿に失敗しました:', error.message);
    }
  }
};
</script> 

<template>
  <div class="create-article-container">
    <h1 class="page-title">記事投稿</h1>
    <form @submit.prevent="handleSubmit" class="article-form">
      <div class="form-group">
        <label for="title" class="form-label">タイトル</label>
        <input type="text" id="title" v-model="title" required class="form-input" placeholder="記事のタイトルを入力してください" />
      </div>
      
      <!-- 画像設定セクション -->
      <div class="form-group">
        <h3 class="section-title">画像設定</h3>
        
        <!-- サムネイル画像設定 -->
        <div class="image-setting-row">
          <label class="form-label">サムネイル画像</label>
          <div class="thumbnail-container">
            <div v-if="thumbnailUrl" class="thumbnail-preview">
              <img :src="thumbnailUrl" alt="サムネイル" class="thumbnail-image" />
              <button type="button" class="thumbnail-clear-button" @click="clearThumbnail">
                ✕
              </button>
            </div>
            <button 
              type="button" 
              class="thumbnail-upload-button" 
              @click="openImageUploadModal('thumbnail')"
            >
              <span class="button-icon">📷</span> 
              {{ thumbnailUrl ? 'サムネイルを変更' : 'サムネイルを設定' }}
            </button>
            <div class="image-description">
              <small>記事一覧などで表示される小さな画像です</small>
            </div>
          </div>
        </div>
        
        <!-- メイン画像設定 -->
        <div class="image-setting-row">
          <label class="form-label">メイン画像</label>
          <div class="thumbnail-container">
            <div v-if="mainImageUrl" class="thumbnail-preview main-image-preview">
              <img :src="mainImageUrl" alt="メイン画像" class="thumbnail-image" />
              <button type="button" class="thumbnail-clear-button" @click="clearMainImage">
                ✕
              </button>
            </div>
            <button 
              type="button" 
              class="thumbnail-upload-button" 
              @click="openImageUploadModal('main')"
            >
              <span class="button-icon">📷</span> 
              {{ mainImageUrl ? 'メイン画像を変更' : 'メイン画像を設定' }}
            </button>
            <div class="image-description">
              <small>記事の先頭に大きく表示される画像です</small>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <div class="form-header">
          <label for="body" class="form-label">内容</label>
          <div class="form-actions-top">
            <button type="button" class="image-upload-button" @click="openImageUploadModal('content')">
              <span class="button-icon">📷</span> 画像を追加
            </button>
            <button type="button" class="preview-toggle" @click="togglePreview">
              {{ showPreview ? '編集に戻る' : 'プレビュー' }}
            </button>
          </div>
        </div>
        <textarea 
          v-if="!showPreview" 
          id="body" 
          ref="bodyTextarea"
          v-model="body" 
          required 
          class="form-textarea" 
          placeholder="記事の内容を入力してください（Markdown形式で入力可能）" 
          rows="10"
        ></textarea>
        <MarkdownPreview v-else :content="body" />
      </div>
      <div class="preview-info" v-if="!showPreview">
        <p>Markdown形式で入力できます。プレビューボタンで表示を確認できます。</p>
        <p class="markdown-hint">画像を挿入するには「画像を追加」ボタンをクリックするか、<code>![代替テキスト](画像URL)</code>と入力します。</p>
      </div>
      <div class="form-actions">
        <button type="button" class="cancel-button" @click="router.push('/')">キャンセル</button>
        <button type="submit" class="submit-button">投稿する</button>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
    
    <!-- 画像アップロードモーダル -->
    <ImageUploadModal 
      :is-open="showImageUploadModal" 
      @close="closeImageUploadModal"
      @image-uploaded="handleImageUploaded"
    />
  </div>
</template>

<style scoped>
.create-article-container {
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

.article-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.image-setting-row {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}

.image-setting-row:last-child {
  border-bottom: none;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus, .form-textarea:focus {
  border-color: #4a90e2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.form-actions-top {
  display: flex;
  gap: 10px;
}

.image-upload-button, .thumbnail-upload-button {
  display: flex;
  align-items: center;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.image-upload-button:hover, .thumbnail-upload-button:hover {
  background-color: #3d8b40;
}

.button-icon {
  margin-right: 5px;
}

.preview-toggle {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-toggle:hover {
  background-color: #e0e0e0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.submit-button, .cancel-button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button {
  background-color: #4a90e2;
  color: white;
}

.submit-button:hover {
  background-color: #3a7bc8;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #333;
}

.cancel-button:hover {
  background-color: #e5e5e5;
}

.error-message {
  color: #e53935;
  margin-top: 20px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  text-align: center;
}

.preview-info {
  font-size: 14px;
  color: #666;
  margin-top: -10px;
  margin-bottom: 20px;
  font-style: italic;
}

.markdown-hint {
  margin-top: 5px;
  font-style: normal;
}

.markdown-hint code {
  background-color: #f5f5f5;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

/* サムネイル関連のスタイル */
.thumbnail-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.thumbnail-preview {
  position: relative;
  width: 120px;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.main-image-preview {
  width: 180px;
  height: 100px;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-clear-button {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.thumbnail-clear-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.image-description {
  color: #666;
  font-size: 12px;
  margin-top: 5px;
}
</style>
