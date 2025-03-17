<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">カテゴリー管理</h1>
    
    <!-- カテゴリー作成フォーム -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">新規カテゴリー作成</h2>
      
      <form @submit.prevent="createCategory">
        <div class="mb-4">
          <label for="category-name" class="block text-sm font-medium text-gray-700 mb-1">カテゴリー名</label>
          <input
            id="category-name"
            v-model="newCategory"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="カテゴリー名を入力"
            required
          />
        </div>
        
        <div class="flex items-center">
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '作成中...' : '作成' }}
          </button>
          
          <p v-if="createError" class="ml-4 text-red-600">{{ createError }}</p>
          <p v-if="createSuccess" class="ml-4 text-green-600">{{ createSuccess }}</p>
        </div>
      </form>
    </div>
    
    <!-- カテゴリー一覧 -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">カテゴリー一覧</h2>
      
      <div v-if="pending" class="text-center py-4">
        <p>読み込み中...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>エラーが発生しました: {{ error.message }}</p>
      </div>
      
      <div v-else-if="categories && categories.length === 0" class="text-center py-4">
        <p>カテゴリーがありません</p>
      </div>
      
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリー名</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">記事数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="category in categories" :key="category.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ category.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="editingId === category.id" class="flex items-center">
                  <input
                    v-model="editingName"
                    type="text"
                    class="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div v-else class="text-sm font-medium text-gray-900">{{ category.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ category._count.articles }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div v-if="editingId === category.id" class="flex space-x-2">
                  <button
                    @click="updateCategory(category.id)"
                    class="text-blue-600 hover:text-blue-900"
                    :disabled="isSubmitting"
                  >
                    保存
                  </button>
                  <button
                    @click="cancelEdit"
                    class="text-gray-600 hover:text-gray-900"
                    :disabled="isSubmitting"
                  >
                    キャンセル
                  </button>
                </div>
                <div v-else class="flex space-x-2">
                  <button
                    @click="startEdit(category)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    編集
                  </button>
                  <button
                    @click="deleteCategory(category)"
                    class="text-red-600 hover:text-red-900"
                    :disabled="category._count.articles > 0"
                    :title="category._count.articles > 0 ? '記事が紐づいているため削除できません' : ''"
                  >
                    削除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <p v-if="operationError" class="mt-4 text-red-600">{{ operationError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 認証チェック
// 実際の実装では、ミドルウェアなどで認証チェックを行う

// 状態管理
const newCategory = ref('');
const editingId = ref(null);
const editingName = ref('');
const isSubmitting = ref(false);
const createError = ref('');
const createSuccess = ref('');
const operationError = ref('');

// カテゴリー一覧取得（記事数も含む）
const { data: categories, pending, error, refresh } = await useFetch('/api/categories', {
  query: { include_count: 'true' }
});

// カテゴリー作成
async function createCategory() {
  if (!newCategory.value.trim()) return;
  
  createError.value = '';
  createSuccess.value = '';
  isSubmitting.value = true;
  
  try {
    await $fetch('/api/categories/create', {
      method: 'POST',
      body: { name: newCategory.value.trim() }
    });
    
    newCategory.value = '';
    createSuccess.value = 'カテゴリーを作成しました';
    refresh();
    
    // 成功メッセージを3秒後に消す
    setTimeout(() => {
      createSuccess.value = '';
    }, 3000);
  } catch (err) {
    createError.value = err.data?.statusMessage || 'カテゴリーの作成に失敗しました';
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
      body: { name: editingName.value.trim() }
    });
    
    editingId.value = null;
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
      method: 'DELETE'
    });
    
    refresh();
  } catch (err) {
    operationError.value = err.data?.statusMessage || 'カテゴリーの削除に失敗しました';
  }
}
</script> 