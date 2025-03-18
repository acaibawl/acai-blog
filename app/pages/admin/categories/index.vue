<script setup>
// 認証チェック
const errorMessage = ref('');
const { authToken } = useAuthCheck(errorMessage);

// メッセージ状態
const notificationMessage = useNotificationMessage();

// 状態管理
const newCategory = ref('');
const editingId = ref(null);
const editingName = ref('');
const isSubmitting = ref(false);
const operationError = ref('');

// カテゴリー一覧取得（記事数も含む）
const { data: categories, pending, error, refresh } = await useFetch('/api/categories', {
  query: { include_count: 'true' },
});

// カテゴリー作成
async function createCategory() {
  if (!newCategory.value.trim()) return;

  operationError.value = '';
  isSubmitting.value = true;

  try {
    await $fetch('/api/categories/create', {
      method: 'POST',
      body: { name: newCategory.value.trim() },
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    newCategory.value = '';
    notificationMessage.value = 'カテゴリーを作成しました';
    refresh();
  } catch (err) {
    operationError.value = err.data?.statusMessage || 'カテゴリーの作成に失敗しました';
  } finally {
    isSubmitting.value = false;
  }
}

// 編集開始
function startEdit(category) {
  editingId.value = category.id;
  editingName.value = category.name;
  operationError.value = '';
}

// 編集キャンセル
function cancelEdit() {
  editingId.value = null;
  editingName.value = '';
}

// カテゴリー更新
async function updateCategory(id) {
  if (!editingName.value.trim()) return;

  operationError.value = '';
  isSubmitting.value = true;

  try {
    await $fetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: { name: editingName.value.trim() },
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    editingId.value = null;
    notificationMessage.value = 'カテゴリーを更新しました';
    refresh();
  } catch (err) {
    operationError.value = err.data?.statusMessage || 'カテゴリーの更新に失敗しました';
  } finally {
    isSubmitting.value = false;
  }
}

// カテゴリー削除
async function deleteCategory(category) {
  // 記事が紐づいている場合は削除できない
  if (category._count.articles > 0) {
    operationError.value = 'このカテゴリーに紐づく記事があるため削除できません';
    return;
  }

  if (!confirm(`カテゴリー「${category.name}」を削除してもよろしいですか？`)) return;

  operationError.value = '';

  try {
    await $fetch(`/api/categories/${category.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    notificationMessage.value = `カテゴリー「${category.name}」を削除しました`;
    refresh();
  } catch (err) {
    operationError.value = err.data?.statusMessage || 'カテゴリーの削除に失敗しました';
  }
}
</script>

<template>
  <div class="admin-container">
    <h1 class="page-title">カテゴリー管理</h1>

    <!-- カテゴリー作成フォーム -->
    <div class="create-form">
      <h2 class="section-title">新規カテゴリー作成</h2>

      <form @submit.prevent="createCategory">
        <div class="form-group">
          <label for="category-name" class="form-label">カテゴリー名</label>
          <input
            id="category-name"
            v-model="newCategory"
            type="text"
            class="form-input"
            placeholder="カテゴリー名を入力"
            required
          >
        </div>
        <div class="form-actions">
          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '作成中...' : '作成' }}
          </button>
        </div>
      </form>
    </div>

    <!-- カテゴリー一覧 -->
    <div class="list-container">
      <h2 class="section-title">カテゴリー一覧</h2>

      <div v-if="pending" class="loading-message">
        <p>読み込み中...</p>
      </div>

      <div v-else-if="error" class="error-message">
        <p>エラーが発生しました: {{ error.message }}</p>
      </div>

      <div v-else-if="categories && categories.length === 0" class="empty-message">
        <p>カテゴリーがありません</p>
      </div>

      <div v-else>
        <table class="categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>カテゴリー名</th>
              <th>記事数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id">
              <td>{{ category.id }}</td>
              <td>
                <div v-if="editingId === category.id" class="edit-field">
                  <input
                    v-model="editingName"
                    type="text"
                    class="form-input"
                  >
                </div>
                <div v-else>
                  <NuxtLink :to="`/page/1?category_id=${category.id}`" class="category-name">
                    {{ category.name }}
                  </NuxtLink>
                </div>
              </td>
              <td>{{ category._count.articles }}</td>
              <td>
                <div v-if="editingId === category.id" class="action-buttons">
                  <button
                    :disabled="isSubmitting"
                    class="save-button"
                    @click="updateCategory(category.id)"
                  >
                    保存
                  </button>
                  <button
                    :disabled="isSubmitting"
                    class="cancel-button"
                    @click="cancelEdit"
                  >
                    キャンセル
                  </button>
                </div>
                <div v-else class="action-buttons">
                  <button
                    class="edit-button"
                    @click="startEdit(category)"
                  >
                    編集
                  </button>
                  <button
                    class="delete-button"
                    :disabled="category._count.articles > 0"
                    :title="category._count.articles > 0 ? '記事が紐づいているため削除できません' : ''"
                    @click="deleteCategory(category)"
                  >
                    削除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="operationError" class="error-text operation-error">{{ operationError }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #444;
}

.create-form {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.submit-button {
  background: #4a90e2;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #357abd;
}

.submit-button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.list-container {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.categories-table th,
.categories-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.categories-table th {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.edit-button,
.save-button,
.cancel-button,
.delete-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button {
  background: #4a90e2;
  color: white;
}

.edit-button:hover {
  background: #357abd;
}

.save-button {
  background: #4caf50;
  color: white;
}

.save-button:hover:not(:disabled) {
  background: #3d8b40;
}

.cancel-button {
  background: #9e9e9e;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background: #757575;
}

.delete-button {
  background: #f44336;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background: #d32f2f;
}

.delete-button:disabled {
  background: #ffcdd2;
  cursor: not-allowed;
}

.error-text {
  color: #f44336;
}

.operation-error {
  margin-top: 1rem;
}

.loading-message,
.empty-message {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.edit-field {
  display: flex;
  gap: 0.5rem;
}

.category-name {
  font-weight: 500;
  color: #333;
  text-decoration: none;
  transition: color 0.2s;
}

.category-name:hover {
  color: #4a90e2;
}

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }

  .categories-table {
    display: block;
    overflow-x: auto;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
