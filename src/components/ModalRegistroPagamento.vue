<template>
  <!-- Overlay -->
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="fecharModal">
      <!-- Modal Container -->
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <h2>💰 Registrar Pagamento</h2>
          <button @click="fecharModal" class="btn-close" aria-label="Fechar">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Detalhes do Agendamento -->
          <section class="agendamento-info">
            <h3>📋 Detalhes do Agendamento</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Cliente:</span>
                <span class="value">{{ agendamento?.clienteNome || agendamento?.cliente?.nome || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Data/Hora:</span>
                <span class="value">{{ formatarDataHora() }}</span>
              </div>
              <div class="info-item">
                <span class="label">Serviço:</span>
                <span class="value">{{ agendamento?.servico || agendamento?.servicoNome || 'N/A' }}</span>
              </div>
              <div class="info-item valor-destaque">
                <span class="label">Valor:</span>
                <span class="value">{{ formatarMoeda(servicoDetalhes?.preco || agendamento?.servicoPreco || 0) }}</span>
              </div>
            </div>
          </section>

          <!-- Seleção de Forma de Pagamento -->
          <section class="forma-pagamento">
            <h3>💳 Forma de Pagamento <span class="required">*</span></h3>

            <div class="payment-options">
              <label v-for="forma in formasPagamento" :key="forma.value"
                :class="['payment-option', { selected: formaPagamentoSelecionada === forma.value }]">
                <input type="radio" name="formaPagamento" :value="forma.value" v-model="formaPagamentoSelecionada"
                  :disabled="loading" />
                <div class="option-content">
                  <span class="icon">{{ forma.icon }}</span>
                  <span class="text">{{ forma.label }}</span>
                </div>
              </label>
            </div>
          </section>

          <!-- Mensagens de Feedback -->
          <div v-if="mensagemErro" class="alert alert-error">
            ❌ {{ mensagemErro }}
          </div>
          <div v-if="mensagemSucesso" class="alert alert-success">
            ✅ {{ mensagemSucesso }}
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="fecharModal" class="btn btn-secondary" :disabled="loading">
            Cancelar
          </button>
          <button @click="confirmarPagamento" class="btn btn-primary" :disabled="!formaPagamentoSelecionada || loading">
            {{ loading ? 'Processando...' : 'Confirmar Pagamento' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useApiAgendamentos } from '@/composables/useApiAgendamentos'
import { useApiServicos } from '@/composables/useApiServicos'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  agendamento: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'payment-registered'])

const { concluirAgendamento } = useApiAgendamentos()
const { buscarServico } = useApiServicos()

// Estado
const formaPagamentoSelecionada = ref(null)
const loading = ref(false)
const mensagemErro = ref('')
const mensagemSucesso = ref('')
const servicoDetalhes = ref(null)

// Buscar detalhes do serviço quando o modal abre
watch(() => [props.isOpen, props.agendamento?.servicoId], async ([isOpen, servicoId]) => {
  if (isOpen && servicoId) {
    try {
      const response = await buscarServico(servicoId)
      if (response.data) {
        servicoDetalhes.value = response.data
        console.log('Serviço carregado:', response.data)
      }
    } catch (error) {
      console.error('Erro ao buscar serviço:', error)
    }
  }
}, { immediate: true })

// Opções de pagamento
const formasPagamento = [
  { value: 'DINHEIRO', label: 'Dinheiro', icon: '💵' },
  { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'CARTAO_DEBITO', label: 'Cartão de Débito', icon: '💳' },
  { value: 'PIX', label: 'PIX', icon: '📱' }
]

// Função: Confirmar pagamento
async function confirmarPagamento() {
  if (!formaPagamentoSelecionada.value) {
    mensagemErro.value = 'Selecione uma forma de pagamento'
    return
  }

  if (!props.agendamento?.id) {
    mensagemErro.value = 'Agendamento inválido'
    return
  }

  loading.value = true
  mensagemErro.value = ''
  mensagemSucesso.value = ''

  try {
    const response = await concluirAgendamento(
      props.agendamento.id,
      formaPagamentoSelecionada.value
    )

    if (response.error) {
      throw new Error(response.error.message || 'Erro ao registrar pagamento')
    }

    mensagemSucesso.value = 'Pagamento registrado com sucesso!'

    // Aguardar 1.5s para mostrar mensagem de sucesso
    setTimeout(() => {
      emit('payment-registered')
      fecharModal()
    }, 1500)
  } catch (error) {
    mensagemErro.value = error.message || 'Erro ao registrar pagamento. Tente novamente.'
    console.error(error)
    loading.value = false
  }
}

// Função: Fechar modal
function fecharModal() {
  if (!loading.value) {
    formaPagamentoSelecionada.value = null
    mensagemErro.value = ''
    mensagemSucesso.value = ''
    emit('close')
  }
}

// Função: Formatar data e hora
function formatarDataHora() {
  const agend = props.agendamento
  if (!agend) return '-'

  // Se já tem data e hora formatadas
  if (agend.data && agend.hora) {
    return `${agend.data} às ${agend.hora}`
  }

  // Se tem horario ISO
  if (agend.horario) {
    const dataObj = new Date(agend.horario)
    const dataFormatada = dataObj.toLocaleDateString('pt-BR')
    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${dataFormatada} às ${horaFormatada}`
  }

  return '-'
}

// Função: Formatar valores monetários
function formatarMoeda(valor) {
  if (!valor && valor !== 0) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

/* Modal Container */
.modal-container {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
}

.btn-close {
  background: transparent;
  border: none;
  color: #a0a0a0;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: color 0.3s;
  line-height: 1;
}

.btn-close:hover {
  color: #e63946;
}

/* Body */
.modal-body {
  padding: 1.5rem;
}

.agendamento-info h3,
.forma-pagamento h3 {
  font-size: 1.1rem;
  color: #e63946;
  margin-bottom: 1rem;
  margin-top: 0;
}

.required {
  color: #e63946;
}

.info-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #0a0a0a;
  border-radius: 8px;
  border: 1px solid #333;
}

.info-item .label {
  color: #a0a0a0;
  font-weight: 500;
}

.info-item .value {
  color: #ffffff;
  font-weight: 600;
}

.valor-destaque .value {
  color: #4CAF50;
  font-size: 1.1rem;
}

/* Payment Options */
.payment-options {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.payment-option {
  display: block;
  cursor: pointer;
}

.payment-option input[type="radio"] {
  display: none;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 8px;
  transition: all 0.3s;
}

.payment-option:hover .option-content {
  border-color: #e63946;
  background: rgba(230, 57, 70, 0.05);
}

.payment-option.selected .option-content {
  border-color: #e63946;
  background: rgba(230, 57, 70, 0.1);
}

.payment-option input:disabled~.option-content {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-content .icon {
  font-size: 1.5rem;
}

.option-content .text {
  color: #ffffff;
  font-weight: 500;
  font-size: 1rem;
}

/* Alerts */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.alert-error {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  color: #ff4444;
}

.alert-success {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4CAF50;
  color: #4CAF50;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #333;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #333;
  color: #ffffff;
}

.btn-secondary:hover:not(:disabled) {
  background: #444;
}

.btn-primary {
  background: linear-gradient(135deg, #e63946, #c0392b);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #c0392b, #9d0208);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.4);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
