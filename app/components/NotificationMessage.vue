<script setup lang="ts">
// プロパティの定義
const props = defineProps<{
  message: string;
  show: boolean;
}>();

// 内部状態
const isFadingOut = ref(false);

// イベントの定義
const emit = defineEmits<{
  close: [];
}>();

// 通知を閉じる処理
const closeNotification = () => {
  isFadingOut.value = true;
  // フェードアウト完了後にイベント発火
  setTimeout(() => {
    emit('close');
  }, 300);
};

// showプロパティの変更を監視
watch(() => props.show, (newValue) => {
  if (newValue) {
    // 表示されたら3秒後に閉じる
    setTimeout(() => {
      closeNotification();
    }, 3000);
  }
});
</script>

<template>
  <div
    v-if="show"
    class="message-notification"
    :class="{ 'fade-out': isFadingOut }"
  >
    {{ message }}
  </div>
</template>

<style>
/* メッセージ通知のスタイル */
.message-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  z-index: 9999;
  animation: slide-in 0.3s ease-out;
}

.message-notification.fade-out {
  animation: fade-out 0.3s ease-out forwards;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
