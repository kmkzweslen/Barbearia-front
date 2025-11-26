<template>
  <section class="agendamento">
    <h1>Novo Agendamento</h1>
    <form @submit.prevent="criarAgendamento">
      <label>
        Serviço
        <select v-model="servicoId" required>
          <option value="" disabled>Selecione um serviço</option>
          <option v-for="servico in servicos" :key="servico.id" :value="servico.id">
            {{ servico.nome }} - R$ {{ servico.preco }}
          </option>
        </select>
      </label>

      <label>
        Barbeiro
        <select v-model="barbeiroEmail" required>
          <option value="" disabled>Selecione um barbeiro</option>
          <option v-for="barbeiro in barbeiros" :key="barbeiro.email" :value="barbeiro.email">
            {{ barbeiro.nome }} - {{ barbeiro.especialidade }}
          </option>
        </select>
      </label>

      <label>
        Data
        <input type="date" v-model="data" required />
      </label>

      <label>
        Hora
        <input type="time" v-model="hora" required />
      </label>

      <button type="submit" class="btn" :disabled="loading">
        <span v-if="loading">Salvando...</span>
        <span v-else>Agendar</span>
      </button>
    </form>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'

const servicos = ref([])
const barbeiros = ref([])

const servicoId = ref('')
const barbeiroEmail = ref('')
const data = ref('')
const hora = ref('')

const successMessage = ref('')
const errorMessage = ref('')
const loading = ref(false)

// Carregamento dos dados da API ao montar componente
onMounted(async () => {
  await carregarServicos()
  await carregarBarbeiros()
})

async function carregarServicos() {
  try {
    const data = await api('/servico/buscarTodosServicos', { method: 'GET' })
    servicos.value = data || []
  } catch (e) {
    errorMessage.value = 'Erro ao carregar serviços.'
  }
}

async function carregarBarbeiros() {
  try {
    const data = await api('/barbeiro/buscarTodosBarbeiros', { method: 'GET' })
    barbeiros.value = data || []
  } catch (e) {
    errorMessage.value = 'Erro ao carregar barbeiros.'
  }
}

function validarCampos() {
  if (!servicoId.value || !barbeiroEmail.value || !data.value || !hora.value) {
    errorMessage.value = 'Todos os campos são obrigatórios.'
    return false
  }
  return true
}

async function criarAgendamento() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!validarCampos()) return

  const token = localStorage.getItem('tokenCliente')
  if (!token) {
    errorMessage.value = 'Faça login como cliente antes de agendar.'
    return
  }

  loading.value = true
  try {
    const payload = {
      servicoId: servicoId.value,
      barbeiroEmail: barbeiroEmail.value,
      data: data.value,
      hora: hora.value
    }
    const response = await api('/agendamento/criarAgendamento', {
      method: 'POST',
      body: payload,
      auth: `Bearer ${token}` // Adapte à sua util/function que injeta o header "Authorization"
    })
    if (response?.statusCode === '201') {
      successMessage.value = 'Agendamento criado com sucesso!'
      // Reseta formulário após sucesso
      servicoId.value = ''
      barbeiroEmail.value = ''
      data.value = ''
      hora.value = ''
    } else {
      errorMessage.value = response?.statusMsg || 'Falha ao criar agendamento.'
    }
  } catch (e) {
    errorMessage.value = 'Erro ao criar agendamento. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.agendamento {
  padding: 20px;
  background-color: #111;
  color: #eee;
  font-family: Arial, sans-serif;
}
label {
  display: block;
  margin-bottom: 12px;
}
select,
input[type="date"],
input[type="time"] {
  display: block;
  margin-top: 4px;
  padding: 8px;
  width: 250px;
  border-radius: 5px;
  border: 1px solid #444;
  background-color: #222;
  color: #fff;
}
.btn {
  margin-top: 10px;
  background-color: #f90;
  color: #222;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn:hover:enabled {
  background-color: #e68a00;
}
.success {
  margin-top: 10px;
  color: #5ac95a;
}
.error {
  margin-top: 10px;
  color: #ff4444;
}
</style>
