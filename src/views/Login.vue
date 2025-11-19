<template>
  <section class="login">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input type="text" v-model="user" placeholder="Usuário" required />
      <input type="password" v-model="password" placeholder="Senha" required />
      <button type="submit" class="btn">Entrar</button>
    </form>
  </section>
</template>

<script>
import { api } from '@/utils/api';

export default {
  name: 'Login',
  data() {
    return {
      user: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    async login() {
      this.errorMessage = '';
      try {
        const data = await api('/admin/auth/login', {
          method: 'POST',
          body: {
            username: this.user,
            password: this.password
          }
        });
        if (data && data.token) {
          localStorage.setItem('tokenAdmin', data.token);
          this.$router.push('/admin');
        } else {
          this.errorMessage = 'Usuário ou senha inválidos.';
        }
      } catch (error) {
        this.errorMessage = 'Erro ao autenticar. Verifique os dados.';
      }
    }
  }
};
</script>

<style scoped>
.login {
  padding: 20px;
  background-color: #111;
  color: #eee;
  text-align: center;
  font-family: Arial, sans-serif;
}

input {
  display: block;
  margin: 10px auto;
  padding: 10px;
  width: 250px;
  border-radius: 5px;
  border: 1px solid #444;
  background-color: #222;
  color: white;
  font-size: 16px;
}

.btn {
  background-color: #f90;
  color: #222;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
}

.btn:hover {
  background-color: #e68a00;
}

.error {
  margin-top: 10px;
  color: #ff4444;
  font-weight: bold;
}
</style>
