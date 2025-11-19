<template>
  <div class="home-container">
    <h1>Bem-vindo à Barbearia</h1>
    
    <nav class="menu">
      <button class="menu-button" @click="irParaAgendar">Agendar Serviço</button>
      <button class="menu-button" @click="abrirHistorico">Histórico de Serviço</button>
      <button class="menu-button" @click="irParaLogin">Login</button>
    </nav>
    
    <p class="info-text">
      Para acessar seu histórico de serviços, faça login primeiro.
    </p>
  </div>
</template>

<script>
export default {
  methods: {
    abrirHistorico() {
      const tokenCliente = localStorage.getItem('tokenCliente');
      if (tokenCliente) {
        this.$router.push('/historico-servico');
      } else {
        alert('Você precisa estar logado para ver seu histórico.');
        this.$router.push('/login');
      }
    },
    irParaAgendar() {
      this.$router.push('/agendar');
    },
    irParaLogin() {
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  background-color: #222;
  color: white;
  font-family: Arial, sans-serif;
  text-align: center;
  border-radius: 10px;
}

h1 {
  margin-bottom: 24px;
  font-weight: bold;
  font-size: 2rem;
}

.menu {
  margin-bottom: 16px;
}

.menu-button {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 12px 24px;
  margin: 8px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-button:hover {
  background-color: #0056b3;
}

.info-text {
  font-size: 0.9rem;
  color: #bbb;
}
</style>
