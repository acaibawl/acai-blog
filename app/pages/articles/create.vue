<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

useHead({
  title: '記事投稿',
});

const title = ref('');
const body = ref('');
const errorMessage = ref('');
const showPreview = ref(false);
const router = useRouter();

const togglePreview = () => {
  showPreview.value = !showPreview.value;
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
          <button type="button" class="preview-toggle" @click="togglePreview">
            {{ showPreview ? '編集に戻る' : 'プレビュー' }}
          </button>
        </div>
        <textarea v-if="!showPreview" id="body" v-model="body" required class="form-textarea" placeholder="記事の内容を入力してください（Markdown形式で入力可能）" rows="10"></textarea>
        <MarkdownPreview v-else :content="body" />
      </div>
      <div class="preview-info" v-if="!showPreview">
        <p>Markdown形式で入力できます。プレビューボタンで表示を確認できます。</p>
      </div>
      <div class="form-actions">
        <button type="button" class="cancel-button" @click="router.push('/')">キャンセル</button>
        <button type="submit" class="submit-button">投稿する</button>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
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

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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

.preview-info {
  font-size: 14px;
  color: #666;
  margin-top: -10px;
  margin-bottom: 20px;
  font-style: italic;
}
</style>
