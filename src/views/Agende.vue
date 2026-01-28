<template>
  <section class="agendamento">
    <div class="card">
      <h1 class="title">Novo Agendamento</h1>
      
      <!-- Progress Bar -->
      <div class="progress-bar">
        <div :class="['progress-step', { active: step >= 1 }]">
          <div class="progress-number">1</div>
          <span class="progress-label">Serviço</span>
        </div>
        <div class="progress-line"></div>
        <div :class="['progress-step', { active: step >= 2 }]">
          <div class="progress-number">2</div>
          <span class="progress-label">Barbeiro</span>
        </div>
        <div class="progress-line"></div>
        <div :class="['progress-step', { active: step >= 3 }]">
          <div class="progress-number">3</div>
          <span class="progress-label">Data</span>
        </div>
        <div class="progress-line"></div>
        <div :class="['progress-step', { active: step >= 4 }]">
          <div class="progress-number">4</div>
          <span class="progress-label">Horário</span>
        </div>
      </div>

      <!-- Resumo da seleção -->
      <div v-if="selectedServico || selectedBarbeiro || selectedDate" class="resumo">
        <div v-if="selectedServico" class="resumo-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 6l12 12M6 18L18 6"/>
          </svg>
          <span>{{ selectedServico.nome }} - R$ {{ selectedServico.preco.toFixed(2) }}</span>
        </div>
        <div v-if="selectedBarbeiro" class="resumo-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
          <span>{{ selectedBarbeiro.nome }}</span>
        </div>
        <div v-if="selectedDate" class="resumo-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <span>{{ formatDateDisplay(selectedDate) }}</span>
        </div>
        <div v-if="selectedHorario" class="resumo-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span>{{ selectedHorario }}</span>
        </div>
      </div>

      <!-- Loading Inicial -->
      <div v-if="loading && servicos.length === 0" class="loading">
        Carregando dados...
      </div>

      <!-- Step 1: Selecionar Serviço -->
      <div v-if="!loading && step === 1" class="step-content">
        <h2 class="step-title">Escolha o Serviço</h2>
        <div class="grid">
          <div
            v-for="servico in servicos"
            :key="servico.servicoId"
            class="service-card"
            @click="handleServicoSelect(servico)"
          >
            <div class="service-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 6l12 12M6 18L18 6"/>
              </svg>
            </div>
            <h3 class="service-name">{{ servico.nome }}</h3>
            <p class="service-price">R$ {{ servico.preco.toFixed(2) }}</p>
            <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Step 2: Selecionar Barbeiro -->
      <div v-if="step === 2" class="step-content">
        <h2 class="step-title">Escolha o Barbeiro</h2>
        <div class="grid">
          <div
            v-for="barbeiro in barbeiros"
            :key="barbeiro.email"
            class="barbeiro-card"
            @click="handleBarbeiroSelect(barbeiro)"
          >
            <div class="barbeiro-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/>
              </svg>
            </div>
            <h3 class="barbeiro-name">{{ barbeiro.nome }}</h3>
            <p class="barbeiro-phone">{{ barbeiro.telefone }}</p>
            <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Step 3: Selecionar Data -->
      <div v-if="step === 3" class="step-content">
        <h2 class="step-title">Escolha a Data</h2>
        <div class="date-grid">
          <div
            v-for="(dataObj, index) in proximosDias"
            :key="index"
            :class="['date-card', { selected: selectedDate === dataObj.iso }]"
            @click="handleDateSelect(dataObj.iso)"
          >
            <div class="date-dia">{{ dataObj.diaSemana }}</div>
            <div class="date-numero">{{ dataObj.diaFormatado }}</div>
          </div>
        </div>
      </div>

      <!-- Step 4: Selecionar Horário -->
      <div v-if="step === 4" class="step-content">
        <h2 class="step-title">Escolha o Horário</h2>
        
        <!-- Manhã -->
        <div class="periodo-section">
          <h3 class="periodo-title"> Manhã (07h - 12h)</h3>
          <div class="horario-grid">
            <button
              v-for="horario in horarios.manha"
              :key="horario"
              :class="['horario-btn', { selected: selectedHorario === horario }]"
              @click="handleHorarioSelect(horario)"
            >
              {{ horario }}
            </button>
          </div>
        </div>

        <!-- Tarde -->
        <div class="periodo-section">
          <h3 class="periodo-title"> Tarde (12h - 18h)</h3>
          <div class="horario-grid">
            <button
              v-for="horario in horarios.tarde"
              :key="horario"
              :class="['horario-btn', { selected: selectedHorario === horario }]"
              @click="handleHorarioSelect(horario)"
            >
              {{ horario }}
            </button>
          </div>
        </div>

        <!-- Noite -->
        <div class="periodo-section">
          <h3 class="periodo-title"> Noite (18h - 21h)</h3>
          <div class="horario-grid">
            <button
              v-for="horario in horarios.noite"
              :key="horario"
              :class="['horario-btn', { selected: selectedHorario === horario }]"
              @click="handleHorarioSelect(horario)"
            >
              {{ horario }}
            </button>
          </div>
        </div>

        <button
          class="confirmar-btn"
          @click="confirmarAgendamento"
          :disabled="!selectedHorario || loading"
        >
          {{ loading ? 'Confirmando...' : 'Confirmar Agendamento' }}
        </button>
      </div>

      <!-- Mensagens -->
      <p v-if="successMessage" class="message success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>

      <!-- Botão Voltar -->
      <button v-if="step > 1" class="voltar-btn" @click="voltarStep">
        ← Voltar
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/utils/api'

const step = ref(1)
const servicos = ref([])
const barbeiros = ref([])
const selectedServico = ref(null)
const selectedBarbeiro = ref(null)
const selectedDate = ref('')
const selectedHorario = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const clienteEmail = ref(localStorage.getItem('emailCliente') || '')

// Gera todos os horários base divididos por período
const gerarTodosHorarios = () => {
  const horarios = {
    manha: [],
    tarde: [],
    noite: []
  }

  for (let hora = 7; hora <= 20; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      const horaFormatada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
      
      if (hora >= 7 && hora < 12) {
        horarios.manha.push(horaFormatada)
      } else if (hora >= 12 && hora < 18) {
        horarios.tarde.push(horaFormatada)
      } else if (hora >= 18 && hora <= 20) {
        horarios.noite.push(horaFormatada)
      }
    }
  }

  // Adiciona último horário da noite
  horarios.noite.push('21:00')

  return horarios
}

const todosHorarios = gerarTodosHorarios()

// Filtra horários disponíveis baseado na data selecionada
const horarios = computed(() => {
  const hoje = new Date().toISOString().split('T')[0]
  
  // Se a data selecionada não é hoje, retorna todos os horários
  if (selectedDate.value !== hoje) {
    return todosHorarios
  }
  
  // Se é hoje, filtra horários que já passaram (com margem de 30 minutos)
  const agora = new Date()
  const horaAtual = agora.getHours()
  const minutoAtual = agora.getMinutes()
  
  const filtrarHorarios = (listaHorarios) => {
    return listaHorarios.filter(horario => {
      const [hora, minuto] = horario.split(':').map(Number)
      // Adiciona margem de 30 minutos
      if (hora > horaAtual) return true
      if (hora === horaAtual && minuto > minutoAtual + 30) return true
      return false
    })
  }
  
  return {
    manha: filtrarHorarios(todosHorarios.manha),
    tarde: filtrarHorarios(todosHorarios.tarde),
    noite: filtrarHorarios(todosHorarios.noite)
  }
})

// Gera próximos 14 dias
const proximosDias = computed(() => {
  const dias = []
  const hoje = new Date()
  
  for (let i = 0; i < 14; i++) {
    const data = new Date(hoje)
    data.setDate(hoje.getDate() + i)
    
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const dia = data.getDate().toString().padStart(2, '0')
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    
    dias.push({
      iso: data.toISOString().split('T')[0],
      diaSemana: diasSemana[data.getDay()],
      diaFormatado: `${dia}/${mes}`
    })
  }
  
  return dias
})

// Carrega dados iniciais
onMounted(async () => {
  await carregarDados()
})

async function carregarDados() {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const [respServicos, respBarbeiros] = await Promise.all([
      api('/servico/buscarTodosServicos', { method: 'GET' }),
      api('/barbeiro/buscarTodosBarbeiros', { method: 'GET' })
    ])
    
    servicos.value = respServicos || []
    barbeiros.value = respBarbeiros || []
  } catch (e) {
    errorMessage.value = 'Erro ao carregar dados. Tente novamente.'
    console.error('Erro ao carregar dados:', e)
  } finally {
    loading.value = false
  }
}

function handleServicoSelect(servico) {
  selectedServico.value = servico
  step.value = 2
  errorMessage.value = ''
  successMessage.value = ''
}

function handleBarbeiroSelect(barbeiro) {
  selectedBarbeiro.value = barbeiro
  step.value = 3
  errorMessage.value = ''
  successMessage.value = ''
}

function handleDateSelect(date) {
  selectedDate.value = date
  step.value = 4
  errorMessage.value = ''
  successMessage.value = ''
}

function handleHorarioSelect(horario) {
  selectedHorario.value = horario
  errorMessage.value = ''
  successMessage.value = ''
}

async function confirmarAgendamento() {
  if (!selectedHorario.value) {
    errorMessage.value = 'Selecione um horário'
    return
  }

  if (!clienteEmail.value) {
    errorMessage.value = 'Cliente não identificado. Faça login antes de agendar.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const horarioCompleto = `${selectedDate.value}T${selectedHorario.value}:00`

  const payload = {
    servicoId: selectedServico.value.servicoId || selectedServico.value.id,
    barbeiroEmail: selectedBarbeiro.value.email,
    clienteEmail: clienteEmail.value,
    horario: horarioCompleto
  }
  
  console.log('Payload do agendamento:', payload)

  try {
    const resp = await api('/agendamento/criarAgendamento', {
      method: 'POST',
      body: payload
    })

    if (resp?.statusCode === '201' || resp?.id) {
      successMessage.value = 'Agendamento realizado com sucesso!'
      
      // Reset após 3 segundos
      setTimeout(() => {
        resetForm()
      }, 3000)
    } else {
      errorMessage.value = resp?.statusMsg || 'Falha ao criar agendamento.'
    }
  } catch (e) {
    errorMessage.value = 'Erro ao criar agendamento. Tente novamente.'
    console.error('Erro ao criar agendamento:', e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  step.value = 1
  selectedServico.value = null
  selectedBarbeiro.value = null
  selectedDate.value = ''
  selectedHorario.value = ''
  errorMessage.value = ''
  successMessage.value = ''
}

function voltarStep() {
  if (step.value > 1) {
    step.value--
    
    if (step.value === 1) selectedServico.value = null
    if (step.value === 2) selectedBarbeiro.value = null
    if (step.value === 3) {
      selectedDate.value = ''
      selectedHorario.value = ''
    }
    
    errorMessage.value = ''
    successMessage.value = ''
  }
}

function formatDateDisplay(dateISO) {
  if (!dateISO) return ''
  const date = new Date(dateISO + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}
</script>

<style scoped>
.agendamento {
  min-height: 100vh;
  background-color: #0a0a0a;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.card {
  max-width: 900px;
  margin: 0 auto;
  background-color: #1a1a1a;
  border-radius: 16px;
  padding: 32px;
  color: #fff;
}

.title {
  text-align: center;
  margin-bottom: 32px;
  font-size: 28px;
  color: #e63946;
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  padding: 0 20px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.progress-step.active {
  opacity: 1;
}

.progress-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.progress-label {
  font-size: 12px;
  color: #999;
}

.progress-line {
  flex: 1;
  height: 2px;
  background-color: #333;
  margin: 0 8px;
}

.resumo {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #252525;
  border-radius: 8px;
}

.resumo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ddd;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #e63946;
}

.step-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  font-size: 22px;
  margin-bottom: 24px;
  color: #e63946;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.service-card {
  background-color: #252525;
  padding: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.service-card:hover {
  transform: translateY(-4px);
  border-color: #e63946;
}

.service-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e63946;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #000;
}

.service-name {
  font-size: 16px;
  margin-bottom: 8px;
  color: #fff;
}

.service-price {
  font-size: 20px;
  font-weight: bold;
  color: #e63946;
  margin: 0;
}

.chevron {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.barbeiro-card {
  background-color: #252525;
  padding: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  text-align: center;
  border: 2px solid transparent;
}

.barbeiro-card:hover {
  transform: translateY(-4px);
  border-color: #e63946;
}

.barbeiro-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: #e63946;
}

.barbeiro-name {
  font-size: 16px;
  margin-bottom: 4px;
  color: #fff;
}

.barbeiro-phone {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.date-card {
  background-color: #252525;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.date-card:hover {
  transform: scale(1.05);
  border-color: #e63946;
}

.date-card.selected {
  background-color: #e63946;
  color: #000;
  font-weight: bold;
  border-color: #e63946;
}

.date-dia {
  font-size: 12px;
  margin-bottom: 4px;
  opacity: 0.8;
}

.date-numero {
  font-size: 18px;
  font-weight: bold;
}

.periodo-section {
  margin-bottom: 32px;
}

.periodo-title {
  font-size: 18px;
  margin-bottom: 16px;
  color: #e63946;
}

.horario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.horario-btn {
  background-color: #252525;
  color: #fff;
  border: 2px solid transparent;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.horario-btn:hover {
  border-color: #e63946;
  transform: scale(1.05);
}

.horario-btn.selected {
  background-color: #e63946;
  color: #000;
  font-weight: bold;
  border-color: #e63946;
}

.confirmar-btn {
  width: 100%;
  background-color: #e63946;
  color: #000;
  border: none;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  margin-top: 24px;
  transition: all 0.3s ease;
}

.confirmar-btn:hover:not(:disabled) {
  background-color: #ff6c78;
  transform: scale(1.02);
}

.confirmar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voltar-btn {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 24px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.voltar-btn:hover {
  background-color: #444;
}

.message {
  padding: 16px;
  border-radius: 8px;
  margin-top: 24px;
  text-align: center;
  font-weight: bold;
}

.message.error {
  background-color: #ff4444;
  color: #fff;
}

.message.success {
  background-color: #47d265;
  color: #000;
}

@media (max-width: 768px) {
  .card {
    padding: 20px;
  }

  .progress-bar {
    padding: 0 10px;
  }

  .progress-label {
    font-size: 10px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .date-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  .horario-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  }
}
</style>