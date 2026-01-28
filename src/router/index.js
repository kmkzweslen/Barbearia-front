import { createRouter, createWebHistory } from 'vue-router';

import Home from '../views/Home.vue';
import Agende from '../views/Agende.vue';
import Login from '../views/Login.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import AgendamentosAdmin from '../views/AgendamentosAdmin.vue';
import Financeiro from '../views/Financeiro.vue';
import ClientePerfil from '../views/ClientePerfil.vue';
import Cadastro from '../views/Cadastro.vue';

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/agende', name: 'agende', component: Agende, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: Login },
  { path: '/cadastro', name: 'cadastro', component: Cadastro },
  { path: '/admin', name: 'admin', component: AdminDashboard, meta: { requiresAdmin: true } },
  { path: '/admin/agendamentos', name: 'adminAgendamentos', component: AgendamentosAdmin, meta: { requiresAdmin: true } },
  { path: '/admin/financeiro', name: 'adminFinanceiro', component: Financeiro, meta: { requiresAdmin: true } },
  { path: '/cliente', name: 'cliente', component: ClientePerfil, meta: { requiresCliente: true } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAdmin = to.meta.requiresAdmin;
  const requiresCliente = to.meta.requiresCliente;
  const requiresAuth = to.meta.requiresAuth;

  const tokenAdmin = localStorage.getItem('tokenAdmin');
  const tokenCliente = localStorage.getItem('tokenCliente');

  // Verificar se requer admin
  if (requiresAdmin && !tokenAdmin) {
    alert('Acesso negado. Faça login como administrador!');
    next('/login');
    return;
  }

  // Verificar se requer cliente
  if (requiresCliente && !tokenCliente) {
    alert('Acesso negado. Faça login como cliente!');
    next('/login');
    return;
  }

  // Verificar se requer qualquer autenticação
  if (requiresAuth && !tokenAdmin && !tokenCliente) {
    alert('Você precisa estar logado para acessar esta página!');
    next('/login');
    return;
  }

  next();
});

export default router;
