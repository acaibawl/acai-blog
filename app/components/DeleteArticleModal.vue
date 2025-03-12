<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  isDeleting: boolean;
  error: string;
}>();

const emit = defineEmits<{
  close: [];
  delete: [];
}>();

const deleteConfirmText = ref('');

// モーダルが再表示されたときに入力値をクリアするために監視
watch(() => props.show, (newVal) => {
  if (newVal) {
    deleteConfirmText.value = '';
  }
});
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h3>記事の削除</h3>
      <p>この記事を削除しますか？この操作は取り消せません。</p>
      <p>削除を確認するには、テキストボックスに「delete」と入力してください。</p>
      <div class="form-group">
        <input
          v-model="deleteConfirmText"
          type="text"
          placeholder="delete と入力"
          class="delete-confirm-input"
          :disabled="isDeleting"
        >
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
      <div class="modal-actions">
        <button
          :disabled="isDeleting"
          class="cancel-button"
          @click="emit('close')"
        >
          キャンセル
        </button>
        <button
          :disabled="deleteConfirmText !== 'delete' || isDeleting"
          class="confirm-delete-button"
          @click="emit('delete')"
        >
          {{ isDeleting ? '削除中...' : '削除する' }}
        </button>
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
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  color: #e53935;
}

.form-group {
  margin: 20px 0;
}

.delete-confirm-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button, .confirm-delete-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.cancel-button {
  background-color: #f0f0f0;
  color: #333;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.confirm-delete-button {
  background-color: #e53935;
  color: white;
}

.confirm-delete-button:hover:not(:disabled) {
  background-color: #c62828;
}

.confirm-delete-button:disabled {
  background-color: #ffcdd2;
  cursor: not-allowed;
}

.error-message {
  color: #e53935;
  font-size: 14px;
  margin: 10px 0;
}
</style>
