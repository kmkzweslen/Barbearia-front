<template>
  <div class="perfil-cliente">
    <h2>Perfil Cliente</h2>

    <p v-if="emailLogado" class="email">
      Logado como: <strong>{{ emailLogado }}</strong>
    </p>

    <button class="btn" @click="mostrarHistorico = !mostrarHistorico">
      {{ mostrarHistorico ? 'Esconder histórico' : 'Ver histórico de serviços' }}
    </button>

    <ul v-if="mostrarHistorico && historico.length" class="lista">
      <li v-for="item in historico" :key="item.id" class="item">
        <span class="linha-principal">
          {{ item.data }} - {{ item.servico }}
        </span>
        <span class="linha-secundaria">
          Barbeiro: {{ item.barbeiro }}
        </span>
      </li>
    </ul>

    <p v-if="mostrarHistorico && !historico.length">
      Você ainda não realizou ou não tem serviços registrados.
    </p>
  </div>
</template>

<script>
import { api } from '@/utils/api';

export default {
  name: 'ClientePerfil',
  data() {
    return {
      emailLogado: localStorage.getItem('emailCliente') || '',
      mostrarHistorico: false,
      historico: []
    };
  },
  async mounted() {
    const token = localStorage.getItem('tokenCliente');
    if (!token) {
      this.$router.push('/login');
      return;
    }

    try {
      // ajuste a rota conforme o backend quando existir
      const data = await api('/cliente/historicoServicos', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      this.historico = Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Erro ao carregar histórico do cliente', e);
      this.historico = [];
    }
  }
};
</script>

<style scoped>
.perfil-cliente {
  max-width: 700px;
  margin: 40px auto;
  padding: 24px;
  background-color: #111;
  color: #eee;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  text-align: left;
}

h2 {
  text-align: center;
  margin-bottom: 16px;
}

.email {
  text-align: center;
  margin-bottom: 16px;
}

.btn {
  display: block;
  margin: 0 auto 20px auto;
  padding: 10px 20px;
  background-color: #1e90ff;
  color: #fff;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.btn:hover {
  background-color: #1874d1;
}

.lista {
  list-style: none;
  padding: 0;
}

.item {
  padding: 10px 12px;
  margin-bottom: 10px;
  background-color: #222;
  border-radius: 6px;
}

.linha-principal {
  display: block;
  font-weight: bold;
}

.linha-secundaria {
  display: block;
  font-size: 0.9rem;
  color: #bbb;
}
</style>
