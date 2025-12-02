<template>
  <section class="admin-dashboard">
    <h1>Painel Administrativo</h1>
    <button @click="logout" class="btn logout-btn">Sair</button>
    <div class="options">
      <button @click="selectTab('servicos')" :disabled="isLoadingServicos || isLoadingClientes || isLoadingBarbeiros">Gerenciar Serviços</button>
      <button @click="selectTab('clientes')" :disabled="isLoadingServicos || isLoadingClientes || isLoadingBarbeiros">Gerenciar Clientes</button>
      <button @click="selectTab('barbeiros')" :disabled="isLoadingServicos || isLoadingClientes || isLoadingBarbeiros">Cadastrar Barbeiro</button>
    </div>

    <!-- Serviços -->
    <div v-if="selected === 'servicos'">
      <h2>Serviços</h2>
      <div v-if="validationErrors.servico" class="validation-errors">
        <div v-for="error in validationErrors.servico" :key="error">{{ error[0] }}</div>
      </div>
      <form @submit.prevent="handleServicoSubmit">
        <input v-model="formServico.nome" placeholder="Nome do serviço" required />
        <input type="number" v-model.number="formServico.preco" placeholder="Preço do serviço" required />
        <input v-model="formServico.descricao" placeholder="Descrição do serviço" required />
        <button type="submit" :disabled="isSavingServico">
          {{ isSavingServico ? 'Salvando...' : (isEditingServico ? 'Atualizar Serviço' : 'Cadastrar Serviço') }}
        </button>
        <button v-if="isEditingServico" type="button" @click="cancelEditServico" class="cancel-btn" :disabled="isSavingServico">Cancelar</button>
      </form>
      <div v-if="isLoadingServicos">Carregando serviços...</div>
      <div v-if="errorServicos" class="error-list">{{ errorServicos }}</div>
      <ul>
        <li v-for="servico in servicos" :key="servico.id">
          Nome: {{ servico.nome }}, Preço: R$ {{ servico.preco.toFixed(2) }}, Descrição: {{ servico.descricao }}
          <button @click="editServico(servico)" :disabled="isSavingServico">Editar</button>
          <button @click="removerServico(servico.id)" class="delete-btn" :disabled="isSavingServico">Excluir</button>
        </li>
      </ul>
    </div>

    <!-- Clientes -->
    <div v-if="selected === 'clientes'">
      <h2>Clientes</h2>
      <div v-if="validationErrors.cliente" class="validation-errors">
        <div v-for="error in validationErrors.cliente" :key="error">{{ error[0] }}</div>
      </div>
      <form @submit.prevent="handleClienteSubmit">
        <input v-model="formCliente.nome" placeholder="Nome do cliente" required />
        <input v-model="formCliente.telefone" placeholder="Telefone" required />
        <input v-model="formCliente.email" type="email" placeholder="E-mail" required />
        <button type="submit" :disabled="isSavingCliente">
          {{ isSavingCliente ? 'Salvando...' : (isEditingCliente ? 'Atualizar Cliente' : 'Cadastrar Cliente') }}
        </button>
        <button v-if="isEditingCliente" type="button" @click="cancelEditCliente" class="cancel-btn" :disabled="isSavingCliente">Cancelar</button>
      </form>
      <div v-if="isLoadingClientes">Carregando clientes...</div>
      <div v-if="errorClientes" class="error-list">{{ errorClientes }}</div>
      <ul>
        <li v-for="cliente in clientes" :key="cliente.email">
          {{ cliente.nome }} - {{ cliente.telefone }} - {{ cliente.email }}
          <button @click="editCliente(cliente)" :disabled="isSavingCliente">Editar</button>
          <button @click="removerCliente(cliente.email)" class="delete-btn" :disabled="isSavingCliente">Excluir</button>
        </li>
      </ul>
    </div>

    <!-- Barbeiros -->
    <div v-if="selected === 'barbeiros'">
      <h2>Cadastro de Barbeiro</h2>
      <div v-if="validationErrors.barbeiro" class="validation-errors">
        <div v-for="error in validationErrors.barbeiro" :key="error">{{ error[0] }}</div>
      </div>
      <form @submit.prevent="handleBarbeiroSubmit">
        <input v-model="formBarbeiro.nome" placeholder="Nome" required />
        <input v-model="formBarbeiro.email" type="email" placeholder="E-mail" required />
        <input v-model="formBarbeiro.telefone" placeholder="Telefone" required />
        <input v-model="formBarbeiro.especialidade" placeholder="Especialidade" required />
        <button type="submit" :disabled="isSavingBarbeiro">
          {{ isSavingBarbeiro ? 'Salvando...' : (isEditingBarbeiro ? 'Atualizar' : 'Cadastrar') }}
        </button>
        <button v-if="isEditingBarbeiro" type="button" @click="cancelEditBarbeiro" class="cancel-btn" :disabled="isSavingBarbeiro">Cancelar</button>
      </form>
      <div v-if="isLoadingBarbeiros">Carregando barbeiros...</div>
      <div v-if="errorBarbeiros" class="error-list">{{ errorBarbeiros }}</div>
      <ul>
        <li v-for="barbeiro in barbeiros" :key="barbeiro.email">
          {{ barbeiro.nome }} - {{ barbeiro.email }} - {{ barbeiro.telefone }} - {{ barbeiro.especialidade }}
          <button @click="editBarbeiro(barbeiro)" :disabled="isSavingBarbeiro">Editar</button>
          <button @click="removerBarbeiro(barbeiro.email)" class="delete-btn" :disabled="isSavingBarbeiro">Excluir</button>
        </li>
      </ul>
    </div>

    <div>
      <AgendamentosList role="ADM"/>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useApiServicos } from '@/composables/useApiServicos';
import { useApiClientes } from '@/composables/useApiClientes';
import { useApiBarbeiros } from '@/composables/useApiBarbeiro';
import  AgendamentosList  from '@/components/AgendamentosList.vue';

const { buscarTodosServicos, criarServico, editarServico, excluirServico } = useApiServicos();
const { buscarTodosClientes, criarCliente, editarCliente, excluirCliente } = useApiClientes();
const { buscarTodosBarbeiros, criarBarbeiro, editarBarbeiro, excluirBarbeiro } = useApiBarbeiros();

const selected = ref('servicos');

const isLoadingServicos = ref(false);
const isLoadingClientes = ref(false);
const isLoadingBarbeiros = ref(false);
const isSavingServico = ref(false);
const isSavingCliente = ref(false);
const isSavingBarbeiro = ref(false);

const errorServicos = ref(null);
const errorClientes = ref(null);
const errorBarbeiros = ref(null);
const validationErrors = ref({ servico: null, cliente: null, barbeiro: null });

const servicos = ref([]);
const clientes = ref([]);
const barbeiros = ref([]);

const formServico = ref({ id: null, nome: '', preco: 0, descricao: '' });
const isEditingServico = ref(false);

const formCliente = ref({ nome: '', telefone: '', email: '' });
const isEditingCliente = ref(false);

const formBarbeiro = ref({ nome: '', email: '', telefone: '' });
const isEditingBarbeiro = ref(false);

const fetchAllServicos = async () => {
  isLoadingServicos.value = true;
  errorServicos.value = null;
  try {
    const { data, error } = await buscarTodosServicos();
    if (error) throw error;
    if (data) servicos.value = data;
  } catch (error) {
    errorServicos.value = "Não foi possível carregar os serviços.";
  } finally {
    isLoadingServicos.value = false;
  }
};

const fetchAllClientes = async () => {
  isLoadingClientes.value = true;
  errorClientes.value = null;
  try {
    const { data, error } = await buscarTodosClientes();
    if (error) throw error;
    if (data) clientes.value = data;
  } catch (error) {
    errorClientes.value = "Não foi possível carregar os clientes.";
  } finally {
    isLoadingClientes.value = false;
  }
};

const fetchAllBarbeiros = async () => {
  isLoadingBarbeiros.value = true;
  errorBarbeiros.value = null;
  try {
    const { data, error } = await buscarTodosBarbeiros();
    if (error) throw error;
    if (data) barbeiros.value = data;
  } catch (error) {
    errorBarbeiros.value = "Não foi possível carregar os barbeiros.";
  } finally {
    isLoadingBarbeiros.value = false;
  }
};

onMounted(fetchAllServicos);

watch(selected, (newValue) => {
  if (newValue === 'clientes' && clientes.value.length === 0) {
    fetchAllClientes();
  } else if (newValue === 'barbeiros' && barbeiros.value.length === 0) {
    fetchAllBarbeiros();
  }
});

const selectTab = (tab) => {
  selected.value = tab;
};

const handleApiError = (type, error) => {
  if (error.statusCode === 422 && error.data?.errors) {
    validationErrors.value[type] = error.data.errors;
  } else {
    alert(`Erro: ${error.message || 'Não foi possível salvar.'}`);
  }
};

const handleServicoSubmit = async () => {
  isSavingServico.value = true;
  validationErrors.value.servico = null;
  let response;
  try {
    if (isEditingServico.value) {
      response = await editarServico(formServico.value);
    } else {
      response = await criarServico(formServico.value);
    }
    if (response.error) throw response.error;
    await fetchAllServicos();
    cancelEditServico();
  } catch (error) {
    handleApiError('servico', error);
  } finally {
    isSavingServico.value = false;
  }
};

const editServico = (servico) => {
  formServico.value = { ...servico };
  isEditingServico.value = true;
  window.scrollTo(0, 0);
};

const cancelEditServico = () => {
  formServico.value = { id: null, nome: '', preco: 0, descricao: '' };
  isEditingServico.value = false;
  validationErrors.value.servico = null;
};

const removerServico = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

  isSavingServico.value = true;
  try {
    const { error } = await excluirServico(id);
    if (error) throw error;
    await fetchAllServicos();
  } catch (error) {
    handleApiError('servico', error);
  } finally {
    isSavingServico.value = false;
  }
};

const handleClienteSubmit = async () => {
  isSavingCliente.value = true;
  validationErrors.value.cliente = null;
  let response;
  try {
    if (isEditingCliente.value) {
      response = await editarCliente(formCliente.value);
    } else {
      response = await criarCliente(formCliente.value);
    }
    if (response.error) throw response.error;
    await fetchAllClientes();
    cancelEditCliente();
  } catch (error) {
    handleApiError('cliente', error);
  } finally {
    isSavingCliente.value = false;
  }
};

const editCliente = (cliente) => {
  formCliente.value = { ...cliente };
  isEditingCliente.value = true;
  window.scrollTo(0, 0);
};

const cancelEditCliente = () => {
  formCliente.value = { nome: '', telefone: '', email: '' };
  isEditingCliente.value = false;
  validationErrors.value.cliente = null;
};

const removerCliente = async (email) => {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

  isSavingCliente.value = true;
  try {
    const { error } = await excluirCliente(email);
    if (error) throw error;
    await fetchAllClientes();
  } catch (error) {
    handleApiError('cliente', error);
  } finally {
    isSavingCliente.value = false;
  }
};

const handleBarbeiroSubmit = async () => {
  isSavingBarbeiro.value = true;
  validationErrors.value.barbeiro = null;
  let response;
  try {
    if (isEditingBarbeiro.value) {
      response = await editarBarbeiro(formBarbeiro.value);
    } else {
      response = await criarBarbeiro(formBarbeiro.value);
    }
    if (response.error) throw response.error;
    await fetchAllBarbeiros();
    cancelEditBarbeiro();
  } catch (error) {
    handleApiError('barbeiro', error);
  } finally {
    isSavingBarbeiro.value = false;
  }
};

const editBarbeiro = (barbeiro) => {
  formBarbeiro.value = { ...barbeiro };
  isEditingBarbeiro.value = true;
  window.scrollTo(0, 0);
};

const cancelEditBarbeiro = () => {
  formBarbeiro.value = { nome: '', email: '', telefone: '' };
  isEditingBarbeiro.value = false;
  validationErrors.value.barbeiro = null;
};

const removerBarbeiro = async (email) => {
  if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;

  isSavingBarbeiro.value = true;
  try {
    const { error } = await excluirBarbeiro(email);
    if (error) throw error;
    await fetchAllBarbeiros();
  } catch (error) {
    handleApiError('barbeiro', error);
  } finally {
    isSavingBarbeiro.value = false;
  }
};

const logout = () => {
  localStorage.removeItem('tokenAdmin');
  window.location.href = '/login';
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  background: #111;
  color: #eee;
  max-width: 600px;
  margin: 20px auto;
  text-align: center;
}

.options {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
}

form {
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  font-weight: bold;
  background-color: #5599ff;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  margin-left: 10px;
}

button:hover {
  background-color: #4477cc;
}

button:disabled {
  background-color: #555;
  color: #999;
  cursor: not-allowed;
}

button.delete-btn {
  background-color: #ff5555;
}

button.delete-btn:hover {
  background-color: #cc4444;
}

button.cancel-btn {
  background-color: #777;
}

button.cancel-btn:hover {
  background-color: #555;
}

input {
  padding: 6px;
  margin: 5px 5px 5px 0;
  border-radius: 4px;
  border: none;
  width: 200px;
}

li {
  list-style: none;
  margin-bottom: 10px;
}

.error-list {
  color: #ff6b6b;
  background: #2b1c1c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.validation-errors {
  color: #ffb8b8;
  font-size: 0.9em;
  margin-top: 10px;
  text-align: left;
  padding-left: 5px;
}

.validation-errors div {
  margin-bottom: 5px;
}
</style>
