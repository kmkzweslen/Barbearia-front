<template>
  <div class="agendamentos-admin">
    <div class="page-header">
      <h1>📅 Gerenciar Agendamentos</h1>
      <router-link to="/admin" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Voltar ao Painel
      </router-link>
    </div>

    <div class="page-container">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(42, 157, 143, 0.2); color: #2a9d8f;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(233, 196, 106, 0.2); color: #e9c46a;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendentes }}</div>
            <div class="stat-label">Pendentes</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(69, 123, 157, 0.2); color: #457b9d;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.concluidos }}</div>
            <div class="stat-label">Concluídos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(230, 57, 70, 0.2); color: #e63946;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.cancelados }}</div>
            <div class="stat-label">Cancelados</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <h3>Filtros</h3>
        <div class="filters-grid">
          <div class="filter-group">
            <label>Status</label>
            <select v-model="filters.status">
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Barbeiro</label>
            <select v-model="filters.barbeiro">
              <option value="">Todos</option>
              <option v-for="barbeiro in barbeiros" :key="barbeiro.email" :value="barbeiro.email">
                {{ barbeiro.nome }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Data Inicial</label>
            <input type="date" v-model="filters.dataInicio" />
          </div>

          <div class="filter-group">
            <label>Data Final</label>
            <input type="date" v-model="filters.dataFim" />
          </div>
        </div>
        <div class="filter-buttons">
          <button @click="aplicarFiltros" class="btn-filter">
            Aplicar Filtros
          </button>
          <button @click="limparFiltros" class="btn-clear">
            Limpar
          </button>
        </div>
      </div>

      <!-- Agendamentos List -->
      <AgendamentosList role="ADM" :filtros="filtrosAplicados" :key="filtroKey" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useApiAgendamentos } from '@/composables/useApiAgendamentos';
import { useApiBarbeiros } from '@/composables/useApiBarbeiro';
import AgendamentosList from '@/components/AgendamentosList.vue';

const { buscarTodosAgendamentos } = useApiAgendamentos();
const { buscarTodosBarbeiros } = useApiBarbeiros();

const agendamentos = ref([]);
const barbeiros = ref([]);
const filtroKey = ref(0);

const filters = ref({
  status: '',
  barbeiro: '',
  dataInicio: '',
  dataFim: ''
});

// Filtros que serão passados para o componente (só atualiza ao clicar em Aplicar)
const filtrosAplicados = reactive({
  status: '',
  barbeiro: '',
  dataInicio: '',
  dataFim: ''
});

const stats = computed(() => {
  const total = agendamentos.value.length;
  const pendentes = agendamentos.value.filter(a => a.status === 'PENDENTE').length;
  const concluidos = agendamentos.value.filter(a => a.status === 'CONCLUIDO').length;
  const cancelados = agendamentos.value.filter(a => a.status === 'CANCELADO').length;
  
  return { total, pendentes, concluidos, cancelados };
});

async function loadData() {
  try {
    const [agendamentosResult, barbeirosResult] = await Promise.all([
      buscarTodosAgendamentos(),
      buscarTodosBarbeiros()
    ]);
    
    if (agendamentosResult.data) {
      agendamentos.value = agendamentosResult.data;
    }
    
    if (barbeirosResult.data) {
      barbeiros.value = barbeirosResult.data;
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

function aplicarFiltros() {
  // Copia os filtros atuais para os filtros aplicados
  filtrosAplicados.status = filters.value.status;
  filtrosAplicados.barbeiro = filters.value.barbeiro;
  filtrosAplicados.dataInicio = filters.value.dataInicio;
  filtrosAplicados.dataFim = filters.value.dataFim;
  
  // Incrementa key para forçar re-render se necessário
  filtroKey.value++;
}

function limparFiltros() {
  filters.value = {
    status: '',
    barbeiro: '',
    dataInicio: '',
    dataFim: ''
  };
  aplicarFiltros();
}

onMounted(loadData);
</script>

<style scoped>
.agendamentos-admin {
  min-height: 100vh;
  background: linear-gradient(135deg, #000 0%, #0a0a0a 100%);
  padding: 30px 20px;
}

.page-header {
  max-width: 1400px;
  margin: 0 auto 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 2rem;
  color: #fff;
  margin: 0;
  letter-spacing: 1px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #333;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #222;
  border-color: #e63946;
  color: #e63946;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filters-card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  border: 1px solid #333;
}

.filters-card h3 {
  margin: 0 0 20px 0;
  color: #e63946;
  font-size: 1.2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select,
.filter-group input {
  background: #222;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 10px 12px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #e63946;
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 15px;
}

.btn-filter {
  background: linear-gradient(135deg, #e63946, #c1121f);
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-filter:hover {
  background: linear-gradient(135deg, #c1121f, #9d0208);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.4);
}

.btn-clear {
  background: #333;
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-clear:hover {
  background: #444;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
