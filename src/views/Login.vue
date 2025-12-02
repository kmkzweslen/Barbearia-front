<template>
  <section class="login">
    <h1>Login</h1>
    <div class="tabs">
      <button :class="{active: isAdmin}" @click="isAdmin = true">Administrador</button>
      <button :class="{active: !isAdmin}" @click="isAdmin = false">Cliente</button>
    </div>
    <form v-if="isAdmin" @submit.prevent="loginAdmin">
      <input type="text" v-model="user" placeholder="Usuário" required />
      <input type="password" v-model="password" placeholder="Senha" required />
      <button type="submit" class="btn">Entrar</button>
    </form>
    <div v-else>
      <div class="login-method-tabs">
        <button :class="{active: clienteLoginMethod === 'senha'}" @click="clienteLoginMethod = 'senha'">
          Com Senha
        </button>
        <button :class="{active: clienteLoginMethod === 'otp'}" @click="clienteLoginMethod = 'otp'">
          Com Código OTP
        </button>
      </div>

      <form v-if="clienteLoginMethod === 'senha'" @submit.prevent="loginClienteSenha">
        <input type="email" v-model="emailCliente" placeholder="E-mail" required />
        <input type="password" v-model="senhaCliente" placeholder="Senha" required />
        <button type="submit" class="btn">Entrar</button>
      </form>

      <form v-else @submit.prevent="clienteStep === 1 ? solicitarOtp() : validarOtp()">
        <input v-if="clienteStep === 1" type="email" v-model="emailCliente" placeholder="E-mail" required />
        <div v-else>
          <input type="email" v-model="emailCliente" placeholder="E-mail" required disabled />
          <input type="text" v-model="otp" maxlength="6" placeholder="Código OTP" required />
        </div>
        <button type="submit" class="btn">
          {{ clienteStep === 1 ? 'Enviar Código' : 'Entrar como Cliente' }}
        </button>
      </form>
    </div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
  </section>
</template>

<script>
import { api } from '@/utils/api';
import { useApiClientes } from '@/composables/useApiClientes';

export default {
  name: 'Login',
  setup() {
    const { loginComSenha } = useApiClientes();
    return { loginComSenha };
  },
  data() {
    return {
      isAdmin: true,
      user: '',
      password: '',
      errorMessage: '',
      successMessage: '',
      // Para escolha do método de login do cliente
      clienteLoginMethod: 'senha', // 'senha' ou 'otp'
      // Para login cliente
      emailCliente: '',
      senhaCliente: '',
      otp: '',
      clienteStep: 1
    };
  },
  methods: {
    async loginAdmin() {
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
    },
    async solicitarOtp() {
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const data = await api('/cliente/auth/gerarOtp', {
          method: 'POST',
          body: { email: this.emailCliente }
        });
        this.successMessage = 'Código OTP enviado para seu e-mail.';
        this.clienteStep = 2;
      } catch (error) {
        this.errorMessage = 'Falha ao enviar código. Verifique seu e-mail.';
      }
    },
    async validarOtp() {
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const data = await api('/cliente/auth/validarOtp', {
          method: 'POST',
          body: {
            email: this.emailCliente,
            otp: this.otp
          }
        });
        if (data && data.token) {
          localStorage.setItem('tokenCliente', data.token);
          this.$router.push('/cliente');
        } else {
          this.errorMessage = 'Código inválido ou expirado.';
        }
      } catch (error) {
        this.errorMessage = 'Falha ao validar OTP.';
      }
    },
    // faz o login do cliente com senha   
    async loginClienteSenha() {
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const { data, error } = await this.loginComSenha(
          this.emailCliente,
          this.senhaCliente
        );

        if (error) {
          this.errorMessage = 'Email ou senha inválidos.';
          return;
        }

        if (data && data.token) {
          localStorage.setItem('tokenCliente', data.token);
          this.$router.push('/cliente');
        } else {
          this.errorMessage = 'Falha na autenticação.';
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

.tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}
.tabs button {
  padding: 8px 20px;
  background: #222;
  color: #eee;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
}
.tabs .active {
  border-bottom: 3px solid #f90;
}
.success {
  color: #5ac95a;
  margin-top: 10px;
  font-weight: bold;
}

.login-method-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
  margin-top: 16px;
}

.login-method-tabs button {
  padding: 6px 16px;
  background: #333;
  color: #bbb;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.login-method-tabs .active {
  background: #f90;
  color: #222;
  font-weight: bold;
}
</style>

