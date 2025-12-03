<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo">
        <router-link to="/">
          <span class="brand-name">💈 BARBEARIA</span>
        </router-link>
      </div>
      
      <ul class="navbar-menu">
        <li><router-link to="/" exact>HOME</router-link></li>
        <li v-if="!isAuthenticated"><router-link to="/login">LOGIN</router-link></li>
        <li v-if="isCliente"><router-link to="/cliente">PERFIL</router-link></li>
        <li v-if="isAdmin"><router-link to="/admin">ADMIN</router-link></li>
        <li v-if="isAdmin"><router-link to="/admin/agendamentos">AGENDAMENTOS</router-link></li>
        <li><router-link to="/agende">AGENDE</router-link></li>
        <li v-if="isAuthenticated">
          <button @click="handleLogout" class="logout-btn">SAIR</button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { useAuth } from '@/composables/useAuth';
import { computed } from 'vue';

export default {
  name: 'NavBar',
  setup() {
    const { isAuthenticated, isAdmin, isCliente, logout } = useAuth();
    
    const handleLogout = () => {
      if (confirm('Deseja realmente sair?')) {
        logout();
      }
    };
    
    return {
      isAuthenticated,
      isAdmin: computed(() => isAdmin.value),
      isCliente: computed(() => isCliente.value),
      handleLogout
    };
  }
};
</script>

<style scoped>
.navbar {
  background-color: #000;
  padding: 15px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.brand-name:hover {
  color: #e63946;
}

.navbar-menu {
  list-style-type: none;
  display: flex;
  gap: 30px;
  margin: 0;
  padding: 0;
  align-items: center;
}

.navbar-menu li {
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 1px;
}

.navbar-menu a {
  color: #fff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.navbar-menu a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #e63946, #457b9d);
  transition: width 0.3s ease;
}

.navbar-menu a:hover::after,
.navbar-menu a.router-link-exact-active::after {
  width: 80%;
}

.navbar-menu a.router-link-exact-active {
  color: #e63946;
}

.navbar-menu a:hover {
  color: #e63946;
  transform: translateY(-2px);
}

.logout-btn {
  background: linear-gradient(135deg, #e63946, #c1121f);
  color: #fff;
  border: none;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 1px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #c1121f, #9d0208);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.4);
}

@media (max-width: 768px) {
  .navbar-menu {
    gap: 15px;
    font-size: 12px;
  }
  
  .navbar-logo .logo {
    height: 40px;
  }
}
</style>
