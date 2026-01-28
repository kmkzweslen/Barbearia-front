<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <h1>💈 Painel Administrativo</h1>
        <button @click="handleLogout" class="btn-logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>
    </div>

    <div class="dashboard-container">
      <!-- Quick Access Cards -->
      <div class="quick-access">
        <router-link to="/admin/agendamentos" class="quick-card">
          <div class="quick-icon" style="background: rgba(42, 157, 143, 0.2); color: #2a9d8f;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <div class="quick-content">
            <h3>Agendamentos</h3>
            <p>Gerencie os agendamentos da barbearia</p>
          </div>
          <svg class="quick-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </router-link>

        <router-link to="/admin/financeiro" class="quick-card">
          <div class="quick-icon" style="background: rgba(234, 179, 8, 0.2); color: #eab308;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="quick-content">
            <h3>Financeiro</h3>
            <p>Consultas, despesas e relatórios</p>
          </div>
          <svg class="quick-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </router-link>
      </div>
      <!-- Navigation Tabs -->
      <div class="nav-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['nav-tab', { active: selected === tab.id }]"
          @click="selectTab(tab.id)"
        >
          <component :is="tab.icon" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Serviços -->
      <div v-if="selected === 'servicos'" class="tab-content">
        <div class="section-header">
          <h2>Gerenciar Serviços</h2>
        </div>

        <div class="form-card">
          <h3>{{ isEditingServico ? 'Editar Serviço' : 'Novo Serviço' }}</h3>
          <form @submit.prevent="handleServicoSubmit" class="modern-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nome do Serviço</label>
                <input v-model="formServico.nome" placeholder="Ex: Corte Masculino" required />
              </div>
              <div class="form-group">
                <label>Preço (R$)</label>
                <input type="number" step="0.01" v-model.number="formServico.preco" placeholder="0.00" required />
              </div>
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <textarea v-model="formServico.descricao" placeholder="Descrição do serviço" required rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="isSavingServico">
                {{ isSavingServico ? 'Salvando...' : (isEditingServico ? 'Atualizar' : 'Cadastrar') }}
              </button>
              <button v-if="isEditingServico" type="button" @click="cancelEditServico" class="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div class="list-card">
          <h3>Serviços Cadastrados</h3>
          <div v-if="isLoadingServicos" class="loading">Carregando...</div>
          <div v-else-if="servicos.length === 0" class="empty">Nenhum serviço cadastrado</div>
          <div v-else class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="servico in servicos" :key="servico.id">
                  <td>{{ servico.nome }}</td>
                  <td>R$ {{ servico.preco.toFixed(2) }}</td>
                  <td>{{ servico.descricao }}</td>
                  <td class="actions">
                    <button @click="editServico(servico)" class="btn-icon btn-edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button @click="removerServico(servico.id)" class="btn-icon btn-delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Clientes -->
      <div v-if="selected === 'clientes'" class="tab-content">
        <div class="section-header">
          <h2>Gerenciar Clientes</h2>
        </div>

        <div class="form-card">
          <h3>{{ isEditingCliente ? 'Editar Cliente' : 'Novo Cliente' }}</h3>
          <form @submit.prevent="handleClienteSubmit" class="modern-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nome Completo</label>
                <input v-model="formCliente.nome" placeholder="Nome do cliente" required />
              </div>
              <div class="form-group">
                <label>Telefone</label>
                <input v-model="formCliente.telefone" placeholder="(00) 00000-0000" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>E-mail</label>
                <input v-model="formCliente.email" type="email" placeholder="email@exemplo.com" required />
              </div>
              <div class="form-group">
                <label>Senha</label>
                <input v-model="formCliente.senha" type="password" placeholder="Mínimo 6 caracteres" :required="!isEditingCliente" minlength="6" />
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="isSavingCliente">
                {{ isSavingCliente ? 'Salvando...' : (isEditingCliente ? 'Atualizar' : 'Cadastrar') }}
              </button>
              <button v-if="isEditingCliente" type="button" @click="cancelEditCliente" class="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div class="list-card">
          <h3>Clientes Cadastrados</h3>
          <div v-if="isLoadingClientes" class="loading">Carregando...</div>
          <div v-else-if="clientes.length === 0" class="empty">Nenhum cliente cadastrado</div>
          <div v-else class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cliente in clientes" :key="cliente.email">
                  <td>{{ cliente.nome }}</td>
                  <td>{{ cliente.telefone }}</td>
                  <td>{{ cliente.email }}</td>
                  <td class="actions">
                    <button @click="editCliente(cliente)" class="btn-icon btn-edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button @click="removerCliente(cliente.email)" class="btn-icon btn-delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Barbeiros -->
      <div v-if="selected === 'barbeiros'" class="tab-content">
        <div class="section-header">
          <h2>Gerenciar Barbeiros</h2>
        </div>

        <div class="form-card">
          <h3>{{ isEditingBarbeiro ? 'Editar Barbeiro' : 'Novo Barbeiro' }}</h3>
          <form @submit.prevent="handleBarbeiroSubmit" class="modern-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nome Completo</label>
                <input v-model="formBarbeiro.nome" placeholder="Nome do barbeiro" required />
              </div>
              <div class="form-group">
                <label>E-mail</label>
                <input v-model="formBarbeiro.email" type="email" placeholder="email@exemplo.com" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Telefone</label>
                <input v-model="formBarbeiro.telefone" placeholder="(00) 00000-0000" required />
              </div>
              <div class="form-group">
                <label>Especialidade</label>
                <input v-model="formBarbeiro.especialidade" placeholder="Ex: Corte e Barba" required />
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="isSavingBarbeiro">
                {{ isSavingBarbeiro ? 'Salvando...' : (isEditingBarbeiro ? 'Atualizar' : 'Cadastrar') }}
              </button>
              <button v-if="isEditingBarbeiro" type="button" @click="cancelEditBarbeiro" class="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div class="list-card">
          <h3>Barbeiros Cadastrados</h3>
          <div v-if="isLoadingBarbeiros" class="loading">Carregando...</div>
          <div v-else-if="barbeiros.length === 0" class="empty">Nenhum barbeiro cadastrado</div>
          <div v-else class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Especialidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="barbeiro in barbeiros" :key="barbeiro.email">
                  <td>{{ barbeiro.nome }}</td>
                  <td>{{ barbeiro.email }}</td>
                  <td>{{ barbeiro.telefone }}</td>
                  <td>{{ barbeiro.especialidade }}</td>
                  <td class="actions">
                    <button @click="editBarbeiro(barbeiro)" class="btn-icon btn-edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button @click="removerBarbeiro(barbeiro.email)" class="btn-icon btn-delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, h } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useApiServicos } from '@/composables/useApiServicos';
import { useApiClientes } from '@/composables/useApiClientes';
import { useApiBarbeiros } from '@/composables/useApiBarbeiro';

const router = useRouter();
const { logout } = useAuth();
const { buscarTodosServicos, criarServico, editarServico, excluirServico } = useApiServicos();
const { buscarTodosClientes, criarCliente, editarCliente, excluirCliente } = useApiClientes();
const { buscarTodosBarbeiros, criarBarbeiro, editarBarbeiro, excluirBarbeiro } = useApiBarbeiros();

// Icons as components
const IconScissors = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M6 6l12 12M6 18L18 6' })
]);

const IconUsers = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: '9', cy: '7', r: '4' }),
  h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
  h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
]);

const IconUser = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: '12', cy: '7', r: '4' })
]);

const tabs = [
  { id: 'servicos', label: 'Serviços', icon: IconScissors },
  { id: 'clientes', label: 'Clientes', icon: IconUsers },
  { id: 'barbeiros', label: 'Barbeiros', icon: IconUser }
];

const selected = ref('servicos');

const isLoadingServicos = ref(false);
const isLoadingClientes = ref(false);
const isLoadingBarbeiros = ref(false);
const isSavingServico = ref(false);
const isSavingCliente = ref(false);
const isSavingBarbeiro = ref(false);

const servicos = ref([]);
const clientes = ref([]);
const barbeiros = ref([]);

const formServico = ref({ id: null, nome: '', preco: 0, descricao: '' });
const isEditingServico = ref(false);

const formCliente = ref({ nome: '', telefone: '', email: '', senha: '' });
const isEditingCliente = ref(false);

const formBarbeiro = ref({ nome: '', email: '', telefone: '', especialidade: '' });
const isEditingBarbeiro = ref(false);

const fetchAllServicos = async () => {
  isLoadingServicos.value = true;
  try {
    const { data, error } = await buscarTodosServicos();
    if (!error && data) servicos.value = data;
  } catch (error) {
    console.error('Erro ao carregar serviços:', error);
  } finally {
    isLoadingServicos.value = false;
  }
};

const fetchAllClientes = async () => {
  isLoadingClientes.value = true;
  try {
    const { data, error } = await buscarTodosClientes();
    if (!error && data) clientes.value = data;
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
  } finally {
    isLoadingClientes.value = false;
  }
};

const fetchAllBarbeiros = async () => {
  isLoadingBarbeiros.value = true;
  try {
    const { data, error } = await buscarTodosBarbeiros();
    if (!error && data) barbeiros.value = data;
  } catch (error) {
    console.error('Erro ao carregar barbeiros:', error);
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

const handleServicoSubmit = async () => {
  isSavingServico.value = true;
  try {
    if (isEditingServico.value) {
      await editarServico(formServico.value);
    } else {
      await criarServico(formServico.value);
    }
    await fetchAllServicos();
    cancelEditServico();
  } catch (error) {
    alert('Erro ao salvar serviço');
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
};

const removerServico = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
  isSavingServico.value = true;
  try {
    await excluirServico(id);
    await fetchAllServicos();
  } catch (error) {
    alert('Erro ao excluir serviço');
  } finally {
    isSavingServico.value = false;
  }
};

const handleClienteSubmit = async () => {
  isSavingCliente.value = true;
  try {
    if (isEditingCliente.value) {
      await editarCliente(formCliente.value);
    } else {
      await criarCliente(formCliente.value);
    }
    await fetchAllClientes();
    cancelEditCliente();
  } catch (error) {
    alert('Erro ao salvar cliente');
  } finally {
    isSavingCliente.value = false;
  }
};

const editCliente = (cliente) => {
  formCliente.value = { ...cliente, senha: '' };
  isEditingCliente.value = true;
  window.scrollTo(0, 0);
};

const cancelEditCliente = () => {
  formCliente.value = { nome: '', telefone: '', email: '', senha: '' };
  isEditingCliente.value = false;
};

const removerCliente = async (email) => {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
  isSavingCliente.value = true;
  try {
    await excluirCliente(email);
    await fetchAllClientes();
  } catch (error) {
    alert('Erro ao excluir cliente');
  } finally {
    isSavingCliente.value = false;
  }
};

const handleBarbeiroSubmit = async () => {
  isSavingBarbeiro.value = true;
  try {
    if (isEditingBarbeiro.value) {
      await editarBarbeiro(formBarbeiro.value);
    } else {
      await criarBarbeiro(formBarbeiro.value);
    }
    await fetchAllBarbeiros();
    cancelEditBarbeiro();
  } catch (error) {
    alert('Erro ao salvar barbeiro');
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
  formBarbeiro.value = { nome: '', email: '', telefone: '', especialidade: '' };
  isEditingBarbeiro.value = false;
};

const removerBarbeiro = async (email) => {
  if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;
  isSavingBarbeiro.value = true;
  try {
    await excluirBarbeiro(email);
    await fetchAllBarbeiros();
  } catch (error) {
    alert('Erro ao excluir barbeiro');
  } finally {
    isSavingBarbeiro.value = false;
  }
};

const handleLogout = () => {
  if (confirm('Deseja realmente sair?')) {
    logout();
  }
};
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #000 0%, #0a0a0a 100%);
  color: #fff;
}

.dashboard-header {
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

.dashboard-header h1 {
  font-size: 1.8rem;
  margin: 0;
  letter-spacing: 2px;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #e63946, #c1121f);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: linear-gradient(135deg, #c1121f, #9d0208);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.4);
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
}

/* Quick Access Cards */
.quick-access {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px 25px;
  text-decoration: none;
  color: #fff;
  transition: all 0.3s ease;
}

.quick-card:hover {
  background: #222;
  border-color: #e63946;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.quick-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-content {
  flex: 1;
}

.quick-content h3 {
  margin: 0 0 5px 0;
  font-size: 1.2rem;
  color: #fff;
}

.quick-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #999;
}

.quick-arrow {
  color: #666;
  transition: all 0.3s ease;
}

.quick-card:hover .quick-arrow {
  color: #e63946;
  transform: translateX(4px);
}

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

.section-header {
  margin-bottom: 25px;
}

.section-header h2 {
  font-size: 1.8rem;
  color: #fff;
  margin: 0;
}

.form-card, .list-card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid #333;
}

.form-card h3, .list-card h3 {
  margin: 0 0 20px 0;
  color: #e63946;
  font-size: 1.3rem;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
.form-group textarea {
  background: #222;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 12px 15px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
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

@media (max-width: 768px) {
  .dashboard-container {
    padding: 20px 15px;
  }
  
  .nav-tabs {
    flex-direction: column;
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
  
  .table-container {
    font-size: 0.85rem;
  }
  
  th, td {
    padding: 10px;
  }
}
</style>
