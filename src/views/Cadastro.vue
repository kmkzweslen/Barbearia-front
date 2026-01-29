<template>
  <div class="cadastro-page">
    <div class="cadastro-container">
      <div class="cadastro-card">
        <div class="logo-section">
          <h1 class="brand">💈 BARBEARIA</h1>
          <p class="tagline">Criar Conta</p>
        </div>

        <p class="subtitle">Cadastre-se para agendar serviços</p>
        
        <form @submit.prevent="handleCadastro" class="cadastro-form">
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              type="text" 
              v-model="form.nome" 
              placeholder="Nome completo" 
              required 
            />
          </div>

          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input 
              type="email" 
              v-model="form.email" 
              placeholder="E-mail" 
              required 
            />
          </div>

          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <input 
              type="tel" 
              v-model="form.telefone" 
              placeholder="Telefone" 
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
              v-model="form.senha" 
              placeholder="Senha" 
              required 
              minlength="6"
            />
          </div>

          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input 
              type="password" 
              v-model="confirmarSenha" 
              placeholder="Confirmar senha" 
              required 
              minlength="6"
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading">Cadastrando...</span>
            <span v-else>Criar Conta</span>
          </button>
        </form>

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

        <div class="login-link">
          Já tem conta? 
          <router-link to="/login" class="link">Fazer Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useApiClientes } from '@/composables/useApiClientes';

export default {
  name: 'Cadastro',
  setup() {
    const { criarCliente } = useApiClientes();
    return { criarCliente };
  },
  data() {
    return {
      form: {
        nome: '',
        email: '',
        telefone: '',
        senha: ''
      },
      confirmarSenha: '',
      errorMessage: '',
      successMessage: '',
      loading: false
    };
  },
  methods: {
    validarFormulario() {
      if (!this.form.nome || !this.form.email || !this.form.telefone || !this.form.senha) {
        this.errorMessage = 'Todos os campos são obrigatórios.';
        return false;
      }

      if (this.form.senha.length < 6) {
        this.errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
        return false;
      }

      if (this.form.senha !== this.confirmarSenha) {
        this.errorMessage = 'As senhas não coincidem.';
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.email)) {
        this.errorMessage = 'Por favor, insira um e-mail válido.';
        return false;
      }

      return true;
    },

    async handleCadastro() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.validarFormulario()) {
        return;
      }

      this.loading = true;

      try {
        const { data, error } = await this.criarCliente(this.form);

        if (error) {
          this.errorMessage = 'Erro ao criar conta. O e-mail pode já estar cadastrado.';
          return;
        }

        this.successMessage = 'Conta criada com sucesso! Redirecionando para login...';
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);

      } catch (error) {
        this.errorMessage = 'Erro ao criar conta. Tente novamente.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.cadastro-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.cadastro-page::before {
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

.cadastro-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
}

.cadastro-card {
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
  margin-bottom: 10px;
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

.subtitle {
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 25px;
}

.cadastro-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #c1121f, #9d0208);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(230, 57, 70, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.login-link {
  text-align: center;
  margin-top: 24px;
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

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .cadastro-card {
    padding: 30px 20px;
  }
  
  .brand {
    font-size: 2rem;
  }
}
</style>
