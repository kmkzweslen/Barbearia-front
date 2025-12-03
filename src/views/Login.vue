<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <h1 class="brand">💈 BARBEARIA</h1>
          <p class="tagline">Tradição & Estilo</p>
        </div>

        <div class="tabs">
          <button 
            :class="['tab', { active: isAdmin }]" 
            @click="isAdmin = true"
          >
            Administrador
          </button>
          <button 
            :class="['tab', { active: !isAdmin }]" 
            @click="isAdmin = false"
          >
            Cliente
          </button>
        </div>

        <!-- Login Admin -->
        <form v-if="isAdmin" @submit.prevent="loginAdmin" class="login-form">
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              type="text" 
              v-model="user" 
              placeholder="Usuário" 
              required 
            />
          </div>
          
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input 
              type="password" 
              v-model="password" 
              placeholder="Senha" 
              required 
            />
          </div>
          
          <button type="submit" class="btn-submit">
            Entrar como Admin
          </button>
        </form>

        <!-- Login Cliente -->
        <div v-else class="login-form">
          <div class="login-method-tabs">
            <button 
              :class="{ active: clienteLoginMethod === 'senha' }" 
              @click="clienteLoginMethod = 'senha'"
              type="button"
            >
              Com Senha
            </button>
            <button 
              :class="{ active: clienteLoginMethod === 'otp' }" 
              @click="clienteLoginMethod = 'otp'"
              type="button"
            >
              Com Código
            </button>
          </div>

          <!-- Login com Senha -->
          <form v-if="clienteLoginMethod === 'senha'" @submit.prevent="loginClienteSenha">
            <div class="input-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input 
                type="email" 
                v-model="emailCliente" 
                placeholder="E-mail" 
                required 
              />
            </div>
            
            <div class="input-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input 
                type="password" 
                v-model="senhaCliente" 
                placeholder="Senha" 
                required 
              />
            </div>
            
            <button type="submit" class="btn-submit">
              Entrar
            </button>
          </form>

          <!-- Login com OTP -->
          <form v-else @submit.prevent="clienteStep === 1 ? solicitarOtp() : validarOtp()">
            <div class="input-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input 
                type="email" 
                v-model="emailCliente" 
                placeholder="E-mail" 
                required 
                :disabled="clienteStep === 2"
              />
            </div>
            
            <div v-if="clienteStep === 2" class="input-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <input 
                type="text" 
                v-model="otp" 
                maxlength="6" 
                placeholder="Código OTP" 
                required 
              />
            </div>
            
            <button type="submit" class="btn-submit">
              {{ clienteStep === 1 ? 'Enviar Código' : 'Entrar' }}
            </button>
          </form>

          <div class="signup-link">
            Não tem conta? 
            <router-link to="/cadastro" class="link">Cadastre-se</router-link>
          </div>
        </div>

        <!-- Mensagens -->
        <transition name="fade">
          <div v-if="errorMessage" class="message error">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ errorMessage }}
          </div>
        </transition>
        
        <transition name="fade">
          <div v-if="successMessage" class="message success">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {{ successMessage }}
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/utils/api';
import { useAuth } from '@/composables/useAuth';

export default {
  name: 'Login',
  setup() {
    const auth = useAuth();
    return { auth };
  },
  data() {
    return {
      isAdmin: true,
      user: '',
      password: '',
      errorMessage: '',
      successMessage: '',
      clienteLoginMethod: 'senha',
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
          this.auth.loginAdmin(data.token);
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
        await api('/cliente/auth/gerarOtp', {
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
          this.auth.loginCliente(data.token, this.emailCliente);
          this.$router.push('/cliente');
        } else {
          this.errorMessage = 'Código inválido ou expirado.';
        }
      } catch (error) {
        this.errorMessage = 'Falha ao validar OTP.';
      }
    },
    async loginClienteSenha() {
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const data = await api('/cliente/auth/login-senha', {
          method: 'POST',
          body: {
            username: this.emailCliente,
            password: this.senhaCliente
          }
        });

        if (data && data.token) {
          this.auth.loginCliente(data.token, this.emailCliente);
          this.$router.push('/cliente');
        } else {
          this.errorMessage = 'Falha na autenticação.';
        }
      } catch (error) {
        this.errorMessage = 'Email ou senha inválidos.';
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(230, 57, 70, 0.1) 0%, transparent 70%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5),
              0 0 0 1px rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.brand {
  font-size: 2.5rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(230, 57, 70, 0.5);
}

.tagline {
  color: #e63946;
  font-size: 0.9rem;
  letter-spacing: 2px;
  margin-top: 5px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  background: #111;
  padding: 5px;
  border-radius: 12px;
}

.tab {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  color: #999;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}
.tab.active {
  background: linear-gradient(135deg, #e63946, #c1121f);
  color: #fff;
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.4);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-method-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.login-method-tabs button {
  flex: 1;
  padding: 8px 16px;
  background: #222;
  border: 1px solid #333;
  color: #999;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 500;
}

.login-method-tabs button.active {
  background: #e63946;
  border-color: #e63946;
  color: #fff;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: #222;
  border: 2px solid #333;
  border-radius: 10px;
  padding: 0 15px;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  border-color: #e63946;
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
}

.input-group svg {
  color: #666;
  margin-right: 12px;
  flex-shrink: 0;
}

.input-group:focus-within svg {
  color: #e63946;
}

.input-group input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px 0;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
}

.input-group input::placeholder {
  color: #666;
}

.input-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  background: linear-gradient(135deg, #e63946, #c1121f);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 10px;
}

.btn-submit:hover {
  background: linear-gradient(135deg, #c1121f, #9d0208);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(230, 57, 70, 0.4);
}

.signup-link {
  text-align: center;
  margin-top: 20px;
  color: #999;
  font-size: 0.9rem;
}

.link {
  color: #e63946;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link:hover {
  color: #ff6b6b;
  text-decoration: underline;
}

.message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 20px;
}

.message svg {
  flex-shrink: 0;
}

.message.error {
  background: rgba(230, 57, 70, 0.15);
  border: 1px solid rgba(230, 57, 70, 0.3);
  color: #ff6b6b;
}

.message.success {
  background: rgba(42, 157, 143, 0.15);
  border: 1px solid rgba(42, 157, 143, 0.3);
  color: #5ac95a;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .brand {
    font-size: 2rem;
  }
  
  .tab {
    font-size: 0.85rem;
    padding: 10px;
  }
}
</style>
