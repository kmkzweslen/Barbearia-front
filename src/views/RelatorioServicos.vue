<template>
  <section class="relatorio-servicos">
    <div class="page-header">
      <h1>📊 Serviços Mais Realizados</h1>
      <router-link to="/admin" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Voltar ao Painel
      </router-link>
    </div>


    <div class="container">
      <div class="filtros-card">
        <div class="filtro-grupo">
          <label>Data Início</label>
          <input type="date" v-model="dataInicio" />
        </div>
        <div class="filtro-grupo">
          <label>Data Fim</label>
          <input type="date" v-model="dataFim" />
        </div>
        <button @click="buscarDados" :disabled="loading" class="btn-filtrar">
          {{ loading ? 'Carregando...' : 'Filtrar' }}
        </button>
      </div>

      <div class="toggle-visualizacao">
        <button 
          :class="['btn-toggle', { active: modoVisualizacao === 'lista' }]"
          @click="modoVisualizacao = 'lista'"
        >
          📋 Lista
        </button>
        <button 
          :class="['btn-toggle', { active: modoVisualizacao === 'grafico' }]"
          @click="modoVisualizacao = 'grafico'"
        >
          📊 Gráfico
        </button>
      </div>

      <div v-if="loading" class="loading">Carregando dados...</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-else-if="servicos.length === 0" class="no-data">
        Nenhum serviço encontrado no período selecionado
      </div>

      <div v-else-if="modoVisualizacao === 'lista'" class="modo-lista">
        <table class="tabela-servicos">
          <thead>
            <tr>
              <th>#</th>
              <th>Serviço</th>
              <th>Vendas</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(servico, index) in servicos" :key="servico.servicoId">
              <td class="posicao">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>{{ index + 1 }}</span>
              </td>
              <td class="nome-servico">{{ servico.nomeServico }}</td>
              <td class="vendas">{{ servico.quantidadeVendas }}</td>
              <td class="valor">{{ formatarMoeda(servico.valorTotalArrecadado) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="modo-grafico">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useApiRelatorios } from '@/composables/useApiRelatorios'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const { buscarServicosMaisVendidos } = useApiRelatorios()

const servicos = ref([])
const loading = ref(false)
const errorMessage = ref('')
const modoVisualizacao = ref('lista')
const dataInicio = ref('')
const dataFim = ref('')

const inicializarDatas = () => {
  const hoje = new Date()
  const umMesAtras = new Date(hoje)
  umMesAtras.setDate(hoje.getDate() - 30)
  dataFim.value = hoje.toISOString().split('T')[0]
  dataInicio.value = umMesAtras.toISOString().split('T')[0]
}

const buscarDados = async () => {
  if (new Date(dataFim.value) < new Date(dataInicio.value)) {
    errorMessage.value = 'Data fim deve ser maior ou igual à data início'
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    servicos.value = await buscarServicosMaisVendidos(dataInicio.value, dataFim.value)
  } catch (error) {
    errorMessage.value = 'Erro ao buscar dados. Tente novamente.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

const chartData = computed(() => ({
  labels: servicos.value.map(s => s.nomeServico),
  datasets: [{
    label: 'Quantidade de Vendas',
    data: servicos.value.map(s => s.quantidadeVendas),
    backgroundColor: '#e63946',
    borderRadius: 8
  }]
}))

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: '#333' }, ticks: { color: '#999' } },
    y: { grid: { display: false }, ticks: { color: '#fff' } }
  }
}

onMounted(() => {
  inicializarDatas()
  buscarDados()
})
</script>

<style scoped>
.relatorio-servicos { 
  min-height: 100vh; 
  background-color: #0a0a0a; 
  padding: 30px 20px; 
  color: #fff; 
}

.page-header {
  max-width: 1200px;
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

.container { 
  max-width: 1200px; 
  margin: 0 auto; 
}

.filtros-card { 
  background-color: #1a1a1a; 
  padding: 24px; 
  border-radius: 12px; 
  margin-bottom: 24px; 
  display: flex; 
  gap: 16px; 
  align-items: end; 
}

.filtro-grupo { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}

.filtro-grupo label { 
  font-size: 14px; 
  color: #999; 
}

.filtro-grupo input { 
  padding: 12px; 
  border-radius: 8px; 
  border: 1px solid #333; 
  background-color: #252525; 
  color: #fff; 
  font-size: 16px; 
}

.btn-filtrar { 
  background-color: #e63946; 
  color: #000; 
  border: none; 
  padding: 12px 32px; 
  border-radius: 8px; 
  font-size: 16px; 
  font-weight: bold; 
  cursor: pointer; 
  transition: all 0.3s ease; 
}

.btn-filtrar:hover:not(:disabled) { 
  background-color: #ff6c78; 
}

.btn-filtrar:disabled { 
  opacity: 0.5; 
  cursor: not-allowed; 
}

.toggle-visualizacao { 
  display: flex; 
  gap: 12px; 
  margin-bottom: 24px; 
}

.btn-toggle { 
  flex: 1; 
  padding: 12px; 
  border: 2px solid #333; 
  background-color: #1a1a1a; 
  color: #fff; 
  border-radius: 8px; 
  cursor: pointer; 
  transition: all 0.3s ease; 
}

.btn-toggle:hover { 
  border-color: #e63946; 
}

.btn-toggle.active { 
  background-color: #e63946; 
  color: #000; 
  border-color: #e63946; 
  font-weight: bold; 
}

.loading, 
.error-message, 
.no-data { 
  text-align: center; 
  padding: 40px; 
  background-color: #1a1a1a; 
  border-radius: 12px; 
}

.error-message { 
  color: #ff4444; 
}

.tabela-servicos { 
  width: 100%; 
  background-color: #1a1a1a; 
  border-radius: 12px; 
  overflow: hidden; 
}

.tabela-servicos th, 
.tabela-servicos td { 
  padding: 16px; 
  text-align: left; 
}

.tabela-servicos thead { 
  background-color: #252525; 
  color: #e63946; 
}

.tabela-servicos tbody tr { 
  border-bottom: 1px solid #333; 
  transition: background-color 0.3s ease; 
}

.tabela-servicos tbody tr:hover { 
  background-color: #252525; 
}

.posicao { 
  font-size: 24px; 
  width: 80px; 
  text-align: center; 
}

.nome-servico { 
  font-weight: 500; 
}

.vendas { 
  text-align: center; 
  font-weight: bold; 
  color: #e63946; 
}

.valor { 
  text-align: right; 
  font-weight: 500; 
  color: #47d265; 
}

.modo-grafico { 
  background-color: #1a1a1a; 
  padding: 24px; 
  border-radius: 12px; 
  height: 500px; 
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

  .filtros-card { 
    flex-direction: column; 
    align-items: stretch; 
  }
  
  .modo-grafico { 
    height: 400px; 
  }
}
</style>
