<script setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateUnauthenticatedTo: '/login',
    navigateAuthenticatedTo: '/',
  }
});

const { signIn, status } = useAuth();
const errorMessage = ref('');

// コールバックURLなしで（直接ログイン画面にアクセスして）ログイン成功した場合はトップにリダイレクトする
watch(status, (newStatus) => {
  if (newStatus === 'authenticated') {
    navigateTo('/');
  } 
});

const username = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    errorMessage.value = ''; // エラーメッセージをリセット
    await signIn({ username: username.value, password: password.value }, { redirect: true });
  } catch (error) {
    console.error('ログイン失敗:', error);
    errorMessage.value = 'ログインに失敗しました。ユーザー名とパスワードを確認してください。';
  }
};
</script>

<template>
  <h1>Login Page</h1>
  <form @submit.prevent="handleLogin">
    <div>
      <label for="username">Username:</label>
      <input type="text" v-model="username" id="username" placeholder="Username" />
    </div>
    <div>
      <label for="password">Password:</label>
      <input type="password" v-model="password" id="password" placeholder="Password" />
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <button type="submit">Login</button>
  </form>
</template>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
