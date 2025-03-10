<script setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateUnauthenticatedTo: '/login',
    navigateAuthenticatedTo: '/',
  },
});

useHead({
  title: 'ログイン',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
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
  <div>
    <h1>Login Page</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">Username:</label>
        <input id="username" v-model="username" type="text" placeholder="Username">
      </div>
      <div>
        <label for="password">Password:</label>
        <input id="password" v-model="password" type="password" placeholder="Password">
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
