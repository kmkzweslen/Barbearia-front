<template>
  <section class="agendamento">
    <h1>Novo Agendamento</h1>
    <form @submit.prevent="criarAgendamento">
      <div class="form-content">
        <label>
          Serviço
          <select v-model="servicoId" required>
            <option value="" disabled>Selecione um serviço</option>
            <option v-for="servico in servicos" :key="servico.servicoId" :value="servico.servicoId">
              {{ servico.nome }} - R$ {{ servico.preco }}
            </option>
          </select>
        </label>

        <label>
          Barbeiro
          <select v-model="barbeiroEmail" required>
            <option value="" disabled>Selecione um barbeiro</option>
            <option v-for="barbeiro in barbeiros" :key="barbeiro.email" :value="barbeiro.email">
              {{ barbeiro.nome }} - {{ barbeiro.telefone }}
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
      </div>

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

const clienteEmail = ref(localStorage.getItem('emailCliente') || '')

onMounted(async () => {
  await carregarServicos()
  await carregarBarbeiros()
})

async function carregarServicos() {
  try {
    const resp = await api('/servico/buscarTodosServicos', { method: 'GET' })
    console.log('SERVICOS API:', resp)
    servicos.value = resp || []
  } catch {
    errorMessage.value = 'Erro ao carregar serviços.'
  }
}

async function carregarBarbeiros() {
  try {
    const resp = await api('/barbeiro/buscarTodosBarbeiros', { method: 'GET' })
    barbeiros.value = resp || []
  } catch {
    errorMessage.value = 'Erro ao carregar barbeiros.'
  }
}

function validarCampos() {
  console.log('servicoId =>', servicoId.value)
  console.log('barbeiroEmail =>', barbeiroEmail.value)
  console.log('data =>', data.value)
  console.log('hora =>', hora.value)

  if (!servicoId.value || !barbeiroEmail.value || !data.value || !hora.value) {
    errorMessage.value = 'Todos os campos são obrigatórios.'
    return false
  }
  if (!clienteEmail.value) {
    errorMessage.value = 'Cliente não identificado. Faça login como cliente antes de agendar.'
    return false
  }
  return true
}

async function criarAgendamento() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validarCampos()) return

  loading.value = true
  const horario = `${data.value}T${hora.value}:00`

  const payload = {
    servicoId: Number(servicoId.value),
    barbeiroEmail: barbeiroEmail.value,
    clienteEmail: clienteEmail.value,
    horario,
    status: "PENDENTE"
  }

  console.log('PAYLOAD AGENDAMENTO:', payload)

  try {
    const resp = await api('/agendamento/criarAgendamento', {
      method: 'POST',
      body: payload
    })

    if (resp?.statusCode === '201') {
      successMessage.value = 'Agendamento criado com sucesso!'
      servicoId.value = ''
      barbeiroEmail.value = ''
      data.value = ''
      hora.value = ''
    } else {
      errorMessage.value = resp?.statusMsg || 'Falha ao criar agendamento.'
    }
  } catch {
    errorMessage.value = 'Erro ao criar agendamento.'
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
  text-align: center;
}

.form-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}

label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

select,
input[type="date"],
input[type="time"] {
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
