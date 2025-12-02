<template>
  <section class="agendamentos-list">
    <h2>Meus Agendamentos</h2>
    <div v-if="loading">Carregando...</div>
    <div v-else-if="agendamentos.length === 0">Nenhum agendamento encontrado.</div>
    <ul v-else>
      <li v-for="agendamento in agendamentos" :key="agendamento.id" class="agendamento-card">
        <div><strong>Serviço:</strong> {{ agendamento.servico }}</div>
        <div><strong>Barbeiro:</strong> {{ agendamento.barbeiro }}</div>
        <div><strong>Data:</strong> {{ agendamento.data }}</div>
        <div><strong>Hora:</strong> {{ agendamento.hora }}</div>
        <div class="actions">
          <button v-if="canEdit(agendamento)" @click="editarAgendamento(agendamento)" class="btn edit">Editar</button>
          <button v-if="canCancel(agendamento)" @click="cancelarAgendamento(agendamento)" class="btn cancel">Cancelar</button>
        </div>
      </li>
    </ul>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/utils/api'

// Props: role ('CLIENTE' ou 'ADM'), email do cliente (se houver)
const props = defineProps({
  role: {
    type: String, // "CLIENTE" ou "ADM"
    required: true
  },
  email: {
    type: String,
    default: ''
  }
})

const agendamentos = ref([])
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Busca pela role: admin vê todos, cliente vê apenas seus
async function carregarAgendamentos() {
  loading.value = true
  errorMessage.value = ''
  try {
    if (props.role === 'ADM') {
      agendamentos.value = await api('/agendamento/buscarTodosAgendamentos', { method: 'GET' })
    } else {
      agendamentos.value = await api(`/agendamento/buscarPorCliente?email=${props.email}`, { method: 'GET' })
    }
  } catch (e) {
    errorMessage.value = 'Erro ao buscar agendamentos.'
  } finally {
    loading.value = false
  }
}
onMounted(carregarAgendamentos)

// Permissão para editar/cancelar
function canEdit(agendamento) {
  return props.role === 'ADM' || (props.role === 'CLIENTE' && agendamento.clienteEmail === props.email)
}
function canCancel(agendamento) {
  return canEdit(agendamento) && agendamento.status !== 'CANCELADO'
}

// Botão editar (lógica/modais podem ser expandidos)
function editarAgendamento(agendamento) {
  successMessage.value = ''
  errorMessage.value = ''
  // Redireciona ou abre modal, conforme arquitetura do app
  alert(`Editar agendamento #${agendamento.id}`)
}

// Botão cancelar
async function cancelarAgendamento(agendamento) {
  try {
    await api(`/agendamento/cancelarAgendamento?id=${agendamento.id}`, { method: 'PUT' })
    successMessage.value = 'Agendamento cancelado!'
    await carregarAgendamentos()
  } catch (e) {
    errorMessage.value = 'Erro ao cancelar agendamento.'
  }
}
</script>

<style scoped>
.agendamentos-list {
  padding: 20px;
  background: #111;
  color: #eee;
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
}
ul {
  list-style: none;
  padding: 0;
}
.agendamento-card {
  background: #222;
  margin-bottom: 18px;
  border-radius: 7px;
  padding: 16px;
  box-shadow: 0 2px 6px #0008;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
.btn {
  padding: 6px 18px;
  font-weight: bold;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}
.edit {
  background: #0af;
  color: #222;
}
.cancel {
  background: #ff4444;
  color: #fff;
}
.error {
  color: #ff4444;
  margin-top: 16px;
  font-weight: bold;
}
.success {
  color: #47d265;
  margin-top: 16px;
  font-weight: bold;
}
</style>
