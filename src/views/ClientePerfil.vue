<template>
  <div class="perfil-cliente">
    <div class="perfil-container">
      <h2>Perfil do Cliente</h2>
      
      <!-- Dados do Cliente -->
      <div class="dados-section">
        <h3>Meus Dados</h3>
        <div v-if="clienteData" class="dados-card">
          <div class="dado-item">
            <span class="label">Nome:</span>
            <span class="value">{{ clienteData.nome }}</span>
          </div>
          <div class="dado-item">
            <span class="label">Email:</span>
            <span class="value">{{ clienteData.email }}</span>
          </div>
          <div class="dado-item">
            <span class="label">Telefone:</span>
            <span class="value">{{ clienteData.telefone }}</span>
          </div>
        </div>
        <div v-else class="loading">
          <p>Carregando dados...</p>
        </div>
      </div>

      <!-- Histórico de Atendimentos - Só mostra quando tiver o email -->
      <div class="historico-section">
        <AgendamentosList 
          v-if="clienteEmail" 
          role="CLIENTE" 
          :email="clienteEmail" 
          :key="clienteEmail"
        />
        <div v-else class="loading">
          <p>Carregando agendamentos...</p>
        </div>
      </div>

      <!-- Botão Sair -->
      <div class="actions">
        <button @click="handleLogout" class="btn-logout">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Sair
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useApiClientes } from '@/composables/useApiClientes';
import AgendamentosList from '@/components/AgendamentosList.vue';

export default {
  name: 'ClientePerfil',
  components: {
    AgendamentosList
  },
  setup() {
    const router = useRouter();
    const { logout, getCurrentUser, initAuth } = useAuth();
    const { buscarCliente } = useApiClientes();
    
    const clienteData = ref(null);
    
    // Email do cliente - pega do localStorage diretamente para garantir
    const clienteEmail = computed(() => {
      // Primeiro tenta do clienteData carregado
      if (clienteData.value && clienteData.value.email) {
        return clienteData.value.email;
      }
      // Fallback: pega direto do localStorage
      return localStorage.getItem('emailCliente') || '';
    });
    
    const handleLogout = () => {
      if (confirm('Deseja realmente sair?')) {
        logout();
      }
    };
    
    const loadClienteData = async () => {
      // Reinicializa auth para garantir que pegou os dados do localStorage
      initAuth();
      
      // Tenta pegar email do getCurrentUser ou do localStorage
      const user = getCurrentUser();
      const email = user?.email || localStorage.getItem('emailCliente');
      
      if (email) {
        const { data, error } = await buscarCliente(email);
        if (data && !error) {
          clienteData.value = data;
        }
      }
    };
    
    onMounted(() => {
      const tokenCliente = localStorage.getItem('tokenCliente');
      if (!tokenCliente) {
        router.push('/login');
        return;
      }
      
      loadClienteData();
    });
    
    return {
      clienteData,
      clienteEmail,
      handleLogout
    };
  }
};
</script>

<style scoped>
.perfil-cliente {
  min-height: 100vh;
  background: linear-gradient(135deg, #000 0%, #111 100%);
  padding: 40px 20px;
}

.perfil-container {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #fff;
  letter-spacing: 2px;
  text-transform: uppercase;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #e63946;
  letter-spacing: 1px;
}

/* Dados Section */
.dados-section {
  background: #1a1a1a;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.dados-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dado-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #222;
  border-radius: 8px;
  border-left: 4px solid #e63946;
}

.label {
  font-weight: 600;
  color: #ccc;
  font-size: 0.95rem;
}

.value {
  color: #fff;
  font-size: 1.05rem;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Histórico Section */
.historico-section {
  margin-bottom: 30px;
}

/* Actions */
.actions {
  text-align: center;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 2px solid #e63946;
  color: #e63946;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout svg {
  width: 20px;
  height: 20px;
}

.btn-logout:hover {
  background: #e63946;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.4);
}

@media (max-width: 768px) {
  h2 {
    font-size: 2rem;
  }
  
  .dados-section {
    padding: 20px;
  }
  
  .dado-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
