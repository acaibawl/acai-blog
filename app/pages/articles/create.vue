<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ImageUploadModal from '~/components/ImageUploadModal.vue';

useHead({
  title: '記事投稿',
});

const title = ref('');
const body = ref('');
const errorMessage = ref('');
const showPreview = ref(false);
const showImageUploadModal = ref(false);
const router = useRouter();

// テキストエリアの参照を保持
const bodyTextarea = ref(null);

const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

const openImageUploadModal = () => {
  showImageUploadModal.value = true;
};

const closeImageUploadModal = () => {
  showImageUploadModal.value = false;
};

// 画像URLを受け取ってMarkdownの画像タグを挿入する
const handleImageUploaded = (imageUrl) => {
  // Markdownの画像タグを作成
  const imageMarkdown = `![画像](${imageUrl})`;
  
  // テキストエリアにフォーカスがある場合はカーソル位置に挿入
  if (bodyTextarea.value) {
    const textarea = bodyTextarea.value;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
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
  
  // モーダルを閉じる
  // closeImageUploadModal();
};

const handleSubmit = async () => {
  try {
    const authToken = useCookie('auth.token');
    if (!authToken.value) {
      errorMessage.value = 'ログインしてください。';
      throw new Error('ログインしてください。');
    }

    // 記事を投稿するAPIを呼び出す
    const { data, error } = await useFetch('/api/articles/create', {
      method: 'POST',
      body: { title: title.value, body: body.value },
      headers: {
        Authorization: `Bearer ${authToken.value}`
      }
    });
    
    if (error.value) {
      errorMessage.value = 'ログイン情報が不正です。';
      throw new Error('ログイン情報が不正です。');
    }
    
    router.push(`/articles/${data.value.id}`);
  } catch (error) {
    errorMessage.value = '記事の投稿に失敗しました。';
    console.error('記事の投稿に失敗しました:', error.message);
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
      <div class="form-group">
        <div class="form-header">
          <label for="body" class="form-label">内容</label>
          <div class="form-actions-top">
            <button type="button" class="image-upload-button" @click="openImageUploadModal">
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

.image-upload-button {
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

.image-upload-button:hover {
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
</style>
