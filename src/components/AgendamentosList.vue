<template>
  <section class="agendamentos-list">
    <h2>{{ title }}</h2>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando agendamentos...</p>
    </div>
    
    <div v-else-if="agendamentos.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
      <p>Nenhum agendamento encontrado.</p>
    </div>
    
    <div v-else class="agendamentos-grid">
      <div 
        v-for="agendamento in agendamentos" 
        :key="agendamento.id" 
        class="agendamento-card"
        :class="`status-${agendamento.status.toLowerCase()}`"
      >
        <div class="card-header">
          <span class="status-badge" :class="`badge-${agendamento.status.toLowerCase()}`">
            {{ agendamento.status }}
          </span>
          <span class="agendamento-id">#{{ agendamento.id }}</span>
        </div>
        
        <div class="card-body">
          <div class="info-row">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l12 12M6 18L18 6"/>
            </svg>
            <div class="info-content">
              <span class="label">Serviço:</span>
              <span class="value">{{ agendamento.servico }}</span>
            </div>
          </div>
          
          <div class="info-row">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="5"/>
              <path d="M20 21a8 8 0 1 0-16 0"/>
            </svg>
            <div class="info-content">
              <span class="label">Barbeiro:</span>
              <span class="value">{{ agendamento.barbeiro }}</span>
            </div>
          </div>
          
          <div v-if="role === 'ADM' && agendamento.clienteNome" class="info-row">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <div class="info-content">
              <span class="label">Cliente:</span>
              <span class="value">{{ agendamento.clienteNome }}</span>
            </div>
          </div>
          
          <div class="info-row">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <div class="info-content">
              <span class="label">Data:</span>
              <span class="value">{{ agendamento.data }}</span>
            </div>
          </div>
          
          <div class="info-row">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <div class="info-content">
              <span class="label">Horário:</span>
              <span class="value">{{ agendamento.hora }}</span>
            </div>
          </div>
        </div>
        
        <div class="card-actions" v-if="canCancel(agendamento)">
          <button 
            @click="handleCancelar(agendamento)" 
            class="btn btn-cancel"
            :disabled="loading"
          >
            Cancelar Agendamento
          </button>
        </div>
      </div>
    </div>
    
    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useApiAgendamentos } from '@/composables/useApiAgendamentos';

const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (value) => ['CLIENTE', 'ADM'].includes(value)
  },
  email: {
    type: String,
    default: ''
  },
  filtros: {
    type: Object,
    default: () => ({
      status: '',
      barbeiro: '',
      dataInicio: '',
      dataFim: ''
    })
  }
});

const { buscarTodosAgendamentos, buscarAgendamentosPorCliente, cancelarAgendamento } = useApiAgendamentos();

const todosAgendamentos = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const title = computed(() => {
  return props.role === 'ADM' ? 'Todos os Agendamentos' : 'Meus Agendamentos';
});

// Agendamentos filtrados
const agendamentos = computed(() => {
  let resultado = [...todosAgendamentos.value];
  
  // Filtrar por status
  if (props.filtros.status) {
    resultado = resultado.filter(a => a.status === props.filtros.status);
  }
  
  // Filtrar por barbeiro
  if (props.filtros.barbeiro) {
    resultado = resultado.filter(a => a.barbeiroEmail === props.filtros.barbeiro);
  }
  
  // Filtrar por data inicial
  if (props.filtros.dataInicio) {
    const dataInicio = new Date(props.filtros.dataInicio);
    dataInicio.setHours(0, 0, 0, 0);
    resultado = resultado.filter(a => {
      const dataAgendamento = new Date(a.horario);
      return dataAgendamento >= dataInicio;
    });
  }
  
  // Filtrar por data final
  if (props.filtros.dataFim) {
    const dataFim = new Date(props.filtros.dataFim);
    dataFim.setHours(23, 59, 59, 999);
    resultado = resultado.filter(a => {
      const dataAgendamento = new Date(a.horario);
      return dataAgendamento <= dataFim;
    });
  }
  
  return resultado;
});

async function carregarAgendamentos() {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    let result;
    if (props.role === 'ADM') {
      result = await buscarTodosAgendamentos();
    } else {
      if (!props.email) {
        errorMessage.value = 'Email do cliente não fornecido.';
        return;
      }
      result = await buscarAgendamentosPorCliente(props.email);
    }
    
    if (result.error) {
      errorMessage.value = 'Erro ao carregar agendamentos.';
      console.error(result.error);
    } else {
      todosAgendamentos.value = result.data || [];
    }
  } catch (e) {
    errorMessage.value = 'Erro ao buscar agendamentos.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// Recarregar quando o email mudar (para o cliente)
watch(() => props.email, (newEmail) => {
  if (newEmail && props.role === 'CLIENTE') {
    carregarAgendamentos();
  }
});

function canCancel(agendamento) {
  return agendamento.status !== 'CANCELADO' && agendamento.status !== 'CONCLUIDO';
}

async function handleCancelar(agendamento) {
  if (!confirm(`Deseja realmente cancelar o agendamento #${agendamento.id}?`)) {
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    const result = await cancelarAgendamento(agendamento.id);
    
    if (result.success) {
      successMessage.value = 'Agendamento cancelado com sucesso!';
      await carregarAgendamentos();
      
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } else {
      errorMessage.value = 'Erro ao cancelar agendamento.';
    }
  } catch (e) {
    errorMessage.value = 'Erro ao cancelar agendamento.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(carregarAgendamentos);
</script>

<style scoped>
.agendamentos-list {
  padding: 30px 20px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  min-height: 400px;
}

h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 30px;
  color: #fff;
  letter-spacing: 1px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #333;
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state svg {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
}

.agendamentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.agendamento-card {
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  border-left: 4px solid #333;
  transition: all 0.3s ease;
}

.agendamento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.agendamento-card.status-pendente {
  border-left-color: #e9c46a;
}

.agendamento-card.status-confirmado {
  border-left-color: #2a9d8f;
}

.agendamento-card.status-cancelado {
  border-left-color: #e63946;
  opacity: 0.7;
}

.agendamento-card.status-concluido {
  border-left-color: #457b9d;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #222;
  border-bottom: 1px solid #333;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-pendente {
  background: #e9c46a;
  color: #000;
}

.badge-confirmado {
  background: #2a9d8f;
  color: #fff;
}

.badge-cancelado {
  background: #e63946;
  color: #fff;
}

.badge-concluido {
  background: #457b9d;
  color: #fff;
}

.agendamento-id {
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-row svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #e63946;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.label {
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 0.95rem;
  color: #fff;
  font-weight: 500;
}

.card-actions {
  padding: 15px 20px;
  background: #222;
  border-top: 1px solid #333;
}

.btn {
  width: 100%;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.btn-cancel {
  background: linear-gradient(135deg, #e63946, #c1121f);
  color: #fff;
}

.btn-cancel:hover:not(:disabled) {
  background: linear-gradient(135deg, #c1121f, #9d0208);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  margin-top: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.message.error {
  background: rgba(230, 57, 70, 0.2);
  border: 1px solid #e63946;
  color: #ff6b6b;
}

.message.success {
  background: rgba(42, 157, 143, 0.2);
  border: 1px solid #2a9d8f;
  color: #5ac95a;
}

@media (max-width: 768px) {
  .agendamentos-grid {
    grid-template-columns: 1fr;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}
</style>
