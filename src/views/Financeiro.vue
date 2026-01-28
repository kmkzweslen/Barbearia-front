<template>
  <div class="financeiro-page">
    <div class="page-header">
      <div class="header-content">
        <h1>💰 Controle Financeiro</h1>
        <router-link to="/admin" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Voltar ao Painel
        </router-link>
      </div>
    </div>

    <div class="page-container">
      <!-- Navigation Tabs -->
      <div class="nav-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['nav-tab', { active: selectedTab === tab.id }]"
          @click="selectedTab = tab.id"
        >
          <span v-html="tab.icon"></span>
          {{ tab.label }}
        </button>
      </div>

      <!-- ================== ABA: CONSULTA FINANCEIRA ================== -->
      <div v-if="selectedTab === 'consulta'" class="tab-content">
        <div class="section-header">
          <h2>Consulta Financeira</h2>
          <p>Visualize receitas e despesas por período</p>
        </div>

        <!-- Filtros de Período -->
        <div class="filters-card">
          <h3>Filtrar por Período</h3>
          <div class="filters-grid">
            <div class="filter-group">
              <label>Data Inicial</label>
              <input type="date" v-model="consultaFiltros.dataInicio" />
            </div>
            <div class="filter-group">
              <label>Data Final</label>
              <input type="date" v-model="consultaFiltros.dataFim" />
            </div>
            <div class="filter-group filter-actions">
              <label>&nbsp;</label>
              <button @click="buscarResumoFinanceiro" class="btn btn-primary" :disabled="isLoadingConsulta">
                {{ isLoadingConsulta ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Cards de Resumo -->
        <div v-if="resumoFinanceiro" class="stats-grid">
          <div class="stat-card receita">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">R$ {{ formatCurrency(resumoFinanceiro.totalReceitas) }}</div>
              <div class="stat-label">Total de Receitas</div>
              <div class="stat-count">{{ resumoFinanceiro.quantidadeReceitas }} serviços</div>
            </div>
          </div>

          <div class="stat-card despesa">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">R$ {{ formatCurrency(resumoFinanceiro.totalDespesas) }}</div>
              <div class="stat-label">Total de Despesas</div>
              <div class="stat-count">{{ resumoFinanceiro.quantidadeDespesas }} despesas</div>
            </div>
          </div>

          <div class="stat-card" :class="resumoFinanceiro.lucro >= 0 ? 'lucro-positivo' : 'lucro-negativo'">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">R$ {{ formatCurrency(resumoFinanceiro.lucro) }}</div>
              <div class="stat-label">{{ resumoFinanceiro.lucro >= 0 ? 'Lucro' : 'Prejuízo' }}</div>
            </div>
          </div>
        </div>

        <!-- Tabelas de Detalhes -->
        <div v-if="resumoFinanceiro" class="details-grid">
          <!-- Receitas -->
          <div class="list-card">
            <h3>Receitas do Período</h3>
            <div v-if="resumoFinanceiro.receitas.length === 0" class="empty">Nenhuma receita no período</div>
            <div v-else class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Serviço</th>
                    <th>Barbeiro</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="receita in resumoFinanceiro.receitas" :key="receita.id">
                    <td>{{ formatDate(receita.data) }}</td>
                    <td>{{ receita.servico }}</td>
                    <td>{{ receita.barbeiro }}</td>
                    <td class="valor-positivo">R$ {{ formatCurrency(receita.valor) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Despesas -->
          <div class="list-card">
            <h3>Despesas do Período</h3>
            <div v-if="resumoFinanceiro.despesas.length === 0" class="empty">Nenhuma despesa no período</div>
            <div v-else class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="despesa in resumoFinanceiro.despesas" :key="despesa.id">
                    <td>{{ formatDate(despesa.data) }}</td>
                    <td>{{ despesa.descricao }}</td>
                    <td class="valor-negativo">R$ {{ formatCurrency(despesa.valor) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ================== ABA: DESPESAS ================== -->
      <div v-if="selectedTab === 'despesas'" class="tab-content">
        <div class="section-header">
          <h2>Registrar Despesas</h2>
          <p>Cadastre as despesas da barbearia</p>
        </div>

        <!-- Formulário de Despesa -->
        <div class="form-card">
          <h3>{{ isEditingDespesa ? 'Editar Despesa' : 'Nova Despesa' }}</h3>
          <form @submit.prevent="handleDespesaSubmit" class="modern-form">
            <div class="form-row">
              <div class="form-group">
                <label>Descrição</label>
                <input v-model="formDespesa.descricao" placeholder="Ex: Compra de produtos de higiene" required />
              </div>
              <div class="form-group">
                <label>Valor (R$)</label>
                <input type="number" step="0.01" min="0.01" v-model.number="formDespesa.valor" placeholder="0.00" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Data da Despesa</label>
                <input type="date" v-model="formDespesa.data" :max="today" required />
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="isSavingDespesa">
                {{ isSavingDespesa ? 'Salvando...' : (isEditingDespesa ? 'Atualizar' : 'Cadastrar') }}
              </button>
              <button v-if="isEditingDespesa" type="button" @click="cancelEditDespesa" class="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de Despesas -->
        <div class="list-card">
          <h3>Despesas Cadastradas</h3>
          <div v-if="isLoadingDespesas" class="loading">Carregando...</div>
          <div v-else-if="despesas.length === 0" class="empty">Nenhuma despesa cadastrada</div>
          <div v-else class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="despesa in despesasOrdenadas" :key="despesa.id">
                  <td>{{ formatDate(despesa.data) }}</td>
                  <td>{{ despesa.descricao }}</td>
                  <td class="valor-negativo">R$ {{ formatCurrency(despesa.valor) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================== ABA: RELATÓRIO MENSAL ================== -->
      <div v-if="selectedTab === 'relatorio'" class="tab-content">
        <div class="section-header">
          <h2>Relatório Mensal</h2>
          <p>Acompanhe o faturamento da barbearia</p>
        </div>

        <!-- Seletor de Mês -->
        <div class="filters-card">
          <h3>Selecionar Período</h3>
          <div class="filters-grid">
            <div class="filter-group">
              <label>Mês</label>
              <select v-model="relatorioMes">
                <option v-for="m in meses" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Ano</label>
              <select v-model="relatorioAno">
                <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
            <div class="filter-group filter-actions">
              <label>&nbsp;</label>
              <button @click="gerarRelatorio" class="btn btn-primary" :disabled="isLoadingRelatorio">
                {{ isLoadingRelatorio ? 'Gerando...' : 'Gerar Relatório' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Relatório -->
        <div v-if="relatorioMensal" class="relatorio-container">
          <!-- Resumo do Mês -->
          <div class="stats-grid">
            <div class="stat-card receita">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">R$ {{ formatCurrency(relatorioMensal.totalReceitas) }}</div>
                <div class="stat-label">Receitas em {{ capitalize(relatorioMensal.nomeMes) }}</div>
              </div>
            </div>

            <div class="stat-card despesa">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                  <polyline points="17 18 23 18 23 12"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">R$ {{ formatCurrency(relatorioMensal.totalDespesas) }}</div>
                <div class="stat-label">Despesas em {{ capitalize(relatorioMensal.nomeMes) }}</div>
              </div>
            </div>

            <div class="stat-card" :class="relatorioMensal.lucro >= 0 ? 'lucro-positivo' : 'lucro-negativo'">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"/>
                  <line x1="12" y1="11" x2="12" y2="17"/>
                  <line x1="9" y1="14" x2="15" y2="14"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">R$ {{ formatCurrency(relatorioMensal.lucro) }}</div>
                <div class="stat-label">{{ relatorioMensal.lucro >= 0 ? 'Lucro Líquido' : 'Prejuízo' }}</div>
              </div>
            </div>
          </div>

          <!-- Gráfico de Barras Simples -->
          <div class="chart-card">
            <h3>Faturamento Diário - {{ capitalize(relatorioMensal.nomeMes) }} {{ relatorioMensal.ano }}</h3>
            <div class="chart-container">
              <div class="chart-bars">
                <div 
                  v-for="(valor, data) in relatorioMensal.receitasPorDia" 
                  :key="data"
                  class="chart-bar-wrapper"
                >
                  <div 
                    class="chart-bar receita-bar" 
                    :style="{ height: getBarHeight(valor, maxReceita) + '%' }"
                    :title="`R$ ${formatCurrency(valor)}`"
                  ></div>
                  <div 
                    class="chart-bar despesa-bar" 
                    :style="{ height: getBarHeight(relatorioMensal.despesasPorDia[data] || 0, maxReceita) + '%' }"
                    :title="`R$ ${formatCurrency(relatorioMensal.despesasPorDia[data] || 0)}`"
                  ></div>
                  <span class="chart-label">{{ getDayFromDate(data) }}</span>
                </div>
              </div>
              <div class="chart-legend">
                <span class="legend-item">
                  <span class="legend-color receita-color"></span>
                  Receitas
                </span>
                <span class="legend-item">
                  <span class="legend-color despesa-color"></span>
                  Despesas
                </span>
              </div>
            </div>
          </div>

          <!-- Lista Resumida -->
          <div class="details-grid">
            <div class="list-card">
              <h3>Top Serviços do Mês</h3>
              <div v-if="topServicos.length === 0" class="empty">Sem dados</div>
              <div v-else class="top-list">
                <div v-for="(item, index) in topServicos" :key="index" class="top-item">
                  <span class="top-rank">#{{ index + 1 }}</span>
                  <span class="top-name">{{ item.servico }}</span>
                  <span class="top-value">R$ {{ formatCurrency(item.total) }}</span>
                </div>
              </div>
            </div>

            <div class="list-card">
              <h3>Últimas Despesas</h3>
              <div v-if="!relatorioMensal.despesas || relatorioMensal.despesas.length === 0" class="empty">Sem despesas no mês</div>
              <div v-else class="top-list">
                <div v-for="(despesa, index) in relatorioMensal.despesas.slice(0, 5)" :key="index" class="top-item">
                  <span class="top-name">{{ despesa.descricao }}</span>
                  <span class="top-value valor-negativo">R$ {{ formatCurrency(despesa.valor) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApiFinanceiro } from '@/composables/useApiFinanceiro';

const {
  buscarTodasDespesas,
  criarDespesa,
  atualizarDespesa,
  excluirDespesa,
  calcularResumoFinanceiro,
  gerarRelatorioMensal: apiGerarRelatorioMensal
} = useApiFinanceiro();

// Tabs
const tabs = [
  { 
    id: 'consulta', 
    label: 'Consulta Financeira',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/></svg>'
  },
  { 
    id: 'despesas', 
    label: 'Despesas',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>'
  },
  { 
    id: 'relatorio', 
    label: 'Relatório Mensal',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>'
  }
];

const selectedTab = ref('consulta');

// ============ Consulta Financeira ============
const consultaFiltros = ref({
  dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  dataFim: new Date().toISOString().split('T')[0]
});
const resumoFinanceiro = ref(null);
const isLoadingConsulta = ref(false);

async function buscarResumoFinanceiro() {
  isLoadingConsulta.value = true;
  try {
    const { data, error } = await calcularResumoFinanceiro(
      consultaFiltros.value.dataInicio,
      consultaFiltros.value.dataFim
    );
    if (!error && data) {
      resumoFinanceiro.value = data;
    }
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    alert('Erro ao buscar dados financeiros');
  } finally {
    isLoadingConsulta.value = false;
  }
}

// ============ Despesas ============
const despesas = ref([]);
const today = new Date().toISOString().split('T')[0];
const formDespesa = ref({
  id: null,
  descricao: '',
  valor: null,
  data: today
});
const isEditingDespesa = ref(false);
const isSavingDespesa = ref(false);
const isLoadingDespesas = ref(false);

const despesasOrdenadas = computed(() => {
  return [...despesas.value].sort((a, b) => new Date(b.data) - new Date(a.data));
});

async function fetchDespesas() {
  isLoadingDespesas.value = true;
  try {
    const { data, error } = await buscarTodasDespesas();
    if (!error && data) {
      despesas.value = data;
    }
  } catch (error) {
    console.error('Erro ao carregar despesas:', error);
  } finally {
    isLoadingDespesas.value = false;
  }
}

async function handleDespesaSubmit() {
  isSavingDespesa.value = true;
  try {
    if (isEditingDespesa.value) {
      await atualizarDespesa(formDespesa.value);
    } else {
      await criarDespesa(formDespesa.value);
    }
    await fetchDespesas();
    cancelEditDespesa();
  } catch (error) {
    alert('Erro ao salvar despesa');
  } finally {
    isSavingDespesa.value = false;
  }
}

function editDespesa(despesa) {
  formDespesa.value = { ...despesa };
  isEditingDespesa.value = true;
  window.scrollTo(0, 0);
}

function cancelEditDespesa() {
  formDespesa.value = {
    id: null,
    descricao: '',
    valor: null,
    data: today
  };
  isEditingDespesa.value = false;
}

async function removerDespesa(id) {
  if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;
  try {
    await excluirDespesa(id);
    await fetchDespesas();
  } catch (error) {
    alert('Erro ao excluir despesa');
  }
}

// ============ Relatório Mensal ============
const hoje = new Date();
const relatorioMes = ref(hoje.getMonth() + 1);
const relatorioAno = ref(hoje.getFullYear());
const relatorioMensal = ref(null);
const isLoadingRelatorio = ref(false);

const meses = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

const anos = computed(() => {
  const anoAtual = new Date().getFullYear();
  return [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1];
});

const maxReceita = computed(() => {
  if (!relatorioMensal.value) return 100;
  const valores = Object.values(relatorioMensal.value.receitasPorDia);
  const despesasValores = Object.values(relatorioMensal.value.despesasPorDia);
  return Math.max(...valores, ...despesasValores, 1);
});

const topServicos = computed(() => {
  if (!relatorioMensal.value || !relatorioMensal.value.receitas) return [];
  
  const agrupado = {};
  relatorioMensal.value.receitas.forEach(r => {
    if (!agrupado[r.servico]) {
      agrupado[r.servico] = { servico: r.servico, total: 0, count: 0 };
    }
    agrupado[r.servico].total += r.valor;
    agrupado[r.servico].count++;
  });
  
  return Object.values(agrupado)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
});

async function gerarRelatorio() {
  isLoadingRelatorio.value = true;
  try {
    const { data, error } = await apiGerarRelatorioMensal(relatorioAno.value, relatorioMes.value);
    if (!error && data) {
      relatorioMensal.value = data;
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    alert('Erro ao gerar relatório');
  } finally {
    isLoadingRelatorio.value = false;
  }
}

// ============ Helpers ============
function formatCurrency(value) {
  return (value || 0).toFixed(2).replace('.', ',');
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getBarHeight(value, max) {
  if (!max || !value) return 0;
  return Math.max((value / max) * 100, 2);
}

function getDayFromDate(dateString) {
  return dateString.split('-')[2];
}

// ============ Lifecycle ============
onMounted(() => {
  fetchDespesas();
  buscarResumoFinanceiro();
});
</script>

<style scoped>
.financeiro-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #000 0%, #0a0a0a 100%);
  color: #fff;
}

.page-header {
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 1.8rem;
  margin: 0;
  letter-spacing: 2px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #222;
  color: #fff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #333;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #333;
  border-color: #e63946;
  color: #e63946;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
}

/* Nav Tabs */
.nav-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  background: #111;
  padding: 8px;
  border-radius: 12px;
}

.nav-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  background: transparent;
  border: none;
  color: #999;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-tab:hover {
  color: #fff;
  background: #222;
}

.nav-tab.active {
  background: linear-gradient(135deg, #e63946, #c1121f);
  color: #fff;
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3);
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Section Header */
.section-header {
  margin-bottom: 25px;
}

.section-header h2 {
  font-size: 1.8rem;
  color: #fff;
  margin: 0 0 5px 0;
}

.section-header p {
  color: #666;
  margin: 0;
}

/* Filters Card */
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  align-items: end;
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

.filter-actions {
  display: flex;
  flex-direction: column;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 25px;
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

.stat-card.receita {
  border-left: 4px solid #2a9d8f;
}

.stat-card.receita .stat-icon {
  background: rgba(42, 157, 143, 0.2);
  color: #2a9d8f;
}

.stat-card.despesa {
  border-left: 4px solid #e63946;
}

.stat-card.despesa .stat-icon {
  background: rgba(230, 57, 70, 0.2);
  color: #e63946;
}

.stat-card.lucro-positivo {
  border-left: 4px solid #4ade80;
}

.stat-card.lucro-positivo .stat-icon {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.stat-card.lucro-negativo {
  border-left: 4px solid #f87171;
}

.stat-card.lucro-negativo .stat-icon {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
}

.stat-icon {
  width: 65px;
  height: 65px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
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

.stat-count {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

/* Form and List Cards */
.form-card, .list-card, .chart-card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid #333;
}

.form-card h3, .list-card h3, .chart-card h3 {
  margin: 0 0 20px 0;
  color: #e63946;
  font-size: 1.3rem;
}

/* Modern Form */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group textarea,
.form-group select {
  background: #222;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 12px 15px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #e63946;
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #e63946, #c1121f);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #c1121f, #9d0208);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.4);
}

.btn-secondary {
  background: #333;
  color: #fff;
}

.btn-secondary:hover {
  background: #444;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Table */
.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #222;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #e63946;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

td {
  padding: 15px;
  border-bottom: 1px solid #333;
}

tr:hover {
  background: #222;
}

.valor-positivo {
  color: #2a9d8f;
  font-weight: 600;
}

.valor-negativo {
  color: #e63946;
  font-weight: 600;
}

/* Actions */
.actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: transparent;
  border: 1px solid #333;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  color: #457b9d;
}

.btn-edit:hover {
  background: rgba(69, 123, 157, 0.2);
  border-color: #457b9d;
}

.btn-delete {
  color: #e63946;
}

.btn-delete:hover {
  background: rgba(230, 57, 70, 0.2);
  border-color: #e63946;
}

/* Chart */
.chart-container {
  padding: 20px 0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  padding: 0 10px;
  border-bottom: 2px solid #333;
  margin-bottom: 20px;
  gap: 2px;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
  max-width: 30px;
}

.chart-bar {
  width: 100%;
  max-width: 12px;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
  position: absolute;
  bottom: 20px;
}

.receita-bar {
  background: linear-gradient(180deg, #2a9d8f, #1a7a6f);
  left: 2px;
}

.despesa-bar {
  background: linear-gradient(180deg, #e63946, #c1121f);
  right: 2px;
}

.chart-label {
  position: absolute;
  bottom: 0;
  font-size: 0.65rem;
  color: #666;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #999;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.receita-color {
  background: #2a9d8f;
}

.despesa-color {
  background: #e63946;
}

/* Top List */
.top-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #222;
  border-radius: 8px;
}

.top-rank {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e63946;
  width: 35px;
}

.top-name {
  flex: 1;
  color: #fff;
}

.top-value {
  font-weight: 600;
  color: #2a9d8f;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 20px 15px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .nav-tabs {
    flex-direction: column;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .chart-bars {
    height: 150px;
  }
}
</style>
