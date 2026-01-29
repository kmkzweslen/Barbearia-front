<template>
  <div class="ranking-clientes-container">
    <!-- Header -->
    <header class="page-header">
      <h1>🏆 Ranking de Clientes Mais Ativos</h1>
      <router-link to="/admin" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Voltar ao Painel
      </router-link>
    </header>

    <!-- Subtitle -->
    <div class="page-subtitle">
      <p>Identifique e valorize seus clientes mais fiéis</p>
    </div>

    <!-- Filtros de Data -->
    <section class="filtros-data">
      <div class="input-group">
        <label>Data Início:</label>
        <input type="date" v-model="filtros.inicio" />
      </div>
      <div class="input-group">
        <label>Data Fim:</label>
        <input type="date" v-model="filtros.fim" />
      </div>
      <button @click="buscarDados" :disabled="loading" class="btn-aplicar">
        {{ loading ? 'Carregando...' : 'Aplicar' }}
      </button>
    </section>

    <!-- Estado de Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando ranking...</p>
    </div>

    <!-- Estado de Erro -->
    <div v-else-if="erro" class="error-state">
      <p>❌ {{ mensagemErro }}</p>
      <button @click="buscarDados" class="btn-retry">Tentar novamente</button>
    </div>

    <!-- Conteúdo Principal -->
    <div v-else-if="clientes.length > 0">
      <!-- Pódio Top 3 -->
      <section class="podio" v-if="top3.length > 0">
        <div class="podio-container">
          <!-- Segundo Lugar -->
          <div v-if="top3[1]" class="podio-card segundo">
            <div class="medalha">🥈</div>
            <div class="posicao">#2</div>
            <div class="nome">{{ top3[1].nomeCliente }}</div>
            <div class="stats">
              <div class="stat">
                <span class="stat-value">{{ top3[1].quantidadeAtendimentos }}</span>
                <span class="stat-label">atendimentos</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ formatarMoeda(top3[1].valorTotalGasto) }}</span>
                <span class="stat-label">total gasto</span>
              </div>
            </div>
          </div>

          <!-- Primeiro Lugar -->
          <div v-if="top3[0]" class="podio-card primeiro">
            <div class="medalha">🥇</div>
            <div class="posicao">#1</div>
            <div class="nome">{{ top3[0].nomeCliente }}</div>
            <div class="stats">
              <div class="stat">
                <span class="stat-value">{{ top3[0].quantidadeAtendimentos }}</span>
                <span class="stat-label">atendimentos</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ formatarMoeda(top3[0].valorTotalGasto) }}</span>
                <span class="stat-label">total gasto</span>
              </div>
            </div>
          </div>

          <!-- Terceiro Lugar -->
          <div v-if="top3[2]" class="podio-card terceiro">
            <div class="medalha">🥉</div>
            <div class="posicao">#3</div>
            <div class="nome">{{ top3[2].nomeCliente }}</div>
            <div class="stats">
              <div class="stat">
                <span class="stat-value">{{ top3[2].quantidadeAtendimentos }}</span>
                <span class="stat-label">atendimentos</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ formatarMoeda(top3[2].valorTotalGasto) }}</span>
                <span class="stat-label">total gasto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Busca -->
      <section class="busca">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            v-model="filtroNome" 
            placeholder="Buscar cliente por nome..."
            class="search-input"
          />
          <span v-if="filtroNome" @click="filtroNome = ''" class="clear-search">✕</span>
        </div>
        <div class="results-count">
          {{ clientesFiltrados.length }} {{ clientesFiltrados.length === 1 ? 'cliente encontrado' : 'clientes encontrados' }}
        </div>
      </section>

      <!-- Ranking Completo -->
      <section class="ranking-tabela">
        <h2>Ranking Completo</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-posicao">Posição</th>
                <th class="col-cliente">Cliente</th>
                <th class="col-atendimentos">Atendimentos</th>
                <th class="col-total">Total Gasto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cliente, index) in clientesFiltrados" :key="cliente.clienteId" class="table-row">
                <td class="col-posicao">
                  <span class="posicao-badge">{{ index + 1 }}</span>
                </td>
                <td class="col-cliente">
                  <div class="cliente-info">
                    <span class="cliente-nome">{{ cliente.nomeCliente }}</span>
                    <span v-if="cliente.quantidadeAtendimentos > 10" class="badge-vip">
                      ⭐ VIP
                    </span>
                  </div>
                  <div class="cliente-contato">
                    <span v-if="cliente.emailCliente">{{ cliente.emailCliente }}</span>
                    <span v-if="cliente.telefoneCliente" class="telefone">{{ cliente.telefoneCliente }}</span>
                  </div>
                </td>
                <td class="col-atendimentos">
                  <span class="atendimentos-badge">{{ cliente.quantidadeAtendimentos }}</span>
                </td>
                <td class="col-total">
                  <span class="valor-total">{{ formatarMoeda(cliente.valorTotalGasto) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Estado Vazio -->
    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Nenhum cliente encontrado no período selecionado</p>
      <small>Tente selecionar um período diferente</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApiRelatorios } from '@/composables/useApiRelatorios'

const { buscarClientesMaisFrequentes } = useApiRelatorios()

// Estado
const clientes = ref([])
const loading = ref(false)
const erro = ref(false)
const mensagemErro = ref('')
const filtroNome = ref('')

// Filtros de data (valores padrão: último mês)
const hoje = new Date()
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

const filtros = ref({
  inicio: primeiroDiaMes.toISOString().split('T')[0],
  fim: hoje.toISOString().split('T')[0]
})

// Computed: Top 3 para o pódio
const top3 = computed(() => clientes.value.slice(0, 3))

// Computed: Clientes filtrados por nome
const clientesFiltrados = computed(() => {
  if (!filtroNome.value) return clientes.value
  
  const busca = filtroNome.value.toLowerCase()
  return clientes.value.filter(c => 
    c.nomeCliente.toLowerCase().includes(busca)
  )
})

// Função: Buscar dados da API
async function buscarDados() {
  // Validar datas
  if (filtros.value.fim < filtros.value.inicio) {
    alert('A data fim deve ser posterior à data início!')
    return
  }

  loading.value = true
  erro.value = false
  
  try {
    const response = await buscarClientesMaisFrequentes(
      filtros.value.inicio,
      filtros.value.fim
    )
    clientes.value = response || []
  } catch (error) {
    erro.value = true
    mensagemErro.value = 'Erro ao carregar ranking de clientes'
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Função: Formatar valores monetários
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

// Carregar dados ao montar componente
onMounted(() => {
  buscarDados()
})
</script>

<style scoped>
.ranking-clientes-container {
  min-height: 100vh;
  background: #0a0a0a;
  color: #ffffff;
  padding: 2rem;
}

/* Header */
.page-header {
  max-width: 1400px;
  margin: 0 auto 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(135deg, #e63946, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.page-subtitle {
  text-align: center;
  margin-bottom: 2rem;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.page-subtitle p {
  color: #a0a0a0;
  font-size: 1.1rem;
  margin: 0;
}

/* Filtros de Data */
.filtros-data {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.input-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  color: #a0a0a0;
  font-weight: 500;
}

.input-group input[type="date"] {
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-group input[type="date"]:focus {
  outline: none;
  border-color: #e63946;
}

.btn-aplicar {
  background: linear-gradient(135deg, #e63946, #c0392b);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-aplicar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 57, 70, 0.4);
}

.btn-aplicar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estados */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  margin: 2rem 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #333;
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p,
.error-state p {
  color: #a0a0a0;
  font-size: 1.1rem;
}

.btn-retry {
  background: #e63946;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  margin-top: 1rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-retry:hover {
  background: #c0392b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #a0a0a0;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.empty-state small {
  color: #666;
  font-size: 0.9rem;
}

/* Pódio */
.podio {
  margin-bottom: 3rem;
}

.podio-container {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: flex-end;
  flex-wrap: wrap;
}

.podio-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
  border: 2px solid #333;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  flex: 1;
  max-width: 280px;
}

.podio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(230, 57, 70, 0.2);
}

.podio-card.primeiro {
  border-color: #FFD700;
  order: 2;
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
}

.podio-card.primeiro:hover {
  transform: scale(1.1) translateY(-5px);
  box-shadow: 0 12px 32px rgba(255, 215, 0, 0.4);
}

.podio-card.segundo {
  border-color: #C0C0C0;
  order: 1;
}

.podio-card.terceiro {
  border-color: #CD7F32;
  order: 3;
}

.medalha {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.posicao {
  font-size: 1.2rem;
  color: #a0a0a0;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.nome {
  font-size: 1.3rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 1rem;
  min-height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #e63946;
}

.stat-label {
  font-size: 0.85rem;
  color: #a0a0a0;
}

/* Busca */
.busca {
  margin-bottom: 2rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
  margin: 0 auto 0.5rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1rem 3rem 1rem 3rem;
  color: #ffffff;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #e63946;
}

.clear-search {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  transition: color 0.3s;
}

.clear-search:hover {
  color: #e63946;
}

.results-count {
  text-align: center;
  color: #a0a0a0;
  font-size: 0.9rem;
}

/* Tabela */
.ranking-tabela h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #ffffff;
}

.table-container {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #252525;
}

thead th {
  padding: 1rem;
  text-align: left;
  color: #a0a0a0;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.col-posicao {
  width: 100px;
  text-align: center !important;
}

.col-atendimentos,
.col-total {
  text-align: right !important;
}

tbody tr {
  border-bottom: 1px solid #252525;
  transition: background 0.3s;
}

tbody tr:hover {
  background: rgba(230, 57, 70, 0.05);
}

tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

tbody tr:nth-child(even):hover {
  background: rgba(230, 57, 70, 0.07);
}

tbody td {
  padding: 1.25rem 1rem;
}

.posicao-badge {
  background: #252525;
  color: #e63946;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
}

.cliente-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.cliente-nome {
  font-weight: 600;
  font-size: 1rem;
  color: #ffffff;
}

.badge-vip {
  display: inline-block;
  background: linear-gradient(135deg, #e63946, #FFD700);
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.cliente-contato {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.telefone::before {
  content: "• ";
  margin: 0 0.25rem;
}

.atendimentos-badge {
  background: rgba(230, 57, 70, 0.1);
  color: #e63946;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  display: inline-block;
}

.valor-total {
  font-weight: bold;
  color: #4CAF50;
  font-size: 1.1rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .ranking-clientes-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .btn-back {
    width: 100%;
    justify-content: center;
  }

  .page-subtitle {
    text-align: left;
    margin-bottom: 1.5rem;
  }

  .filtros-data {
    flex-direction: column;
    align-items: stretch;
  }

  .input-group {
    min-width: 100%;
  }

  .btn-aplicar {
    width: 100%;
  }

  .podio-container {
    flex-direction: column;
    align-items: center;
  }

  .podio-card {
    max-width: 100%;
    width: 100%;
  }

  .podio-card.primeiro {
    order: 1;
    transform: scale(1);
  }

  .podio-card.primeiro:hover {
    transform: translateY(-5px);
  }

  .podio-card.segundo {
    order: 2;
  }

  .podio-card.terceiro {
    order: 3;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }

  .cliente-contato {
    flex-direction: column;
    gap: 0.25rem;
  }

  .telefone::before {
    content: "";
    margin: 0;
  }
}
</style>
