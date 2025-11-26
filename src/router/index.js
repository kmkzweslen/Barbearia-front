import { createRouter, createWebHistory } from 'vue-router';

import Home from '../views/Home.vue'; 
import NossaMarca from '../views/NossaMarca.vue';
import BarbaCabelo from '../views/BarbaCabelo.vue';
import Agende from '../views/Agende.vue';
import Login from '../views/Login.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import ClientePerfil from '../views/ClientePerfil.vue';

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/nossa-marca', name: 'nossaMarca', component: NossaMarca },
  { path: '/barba-cabelo', name: 'barbaCabelo', component: BarbaCabelo },
  { path: '/agende', name: 'agende', component: Agende },
  { path: '/login', name: 'login', component: Login },
  { path: '/admin', name: 'admin', component: AdminDashboard,  meta: { requiresAdmin: true }},
  { path: '/cliente', name: 'cliente', component: ClientePerfil},
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAdmin = to.meta.requiresAdmin;
  const tokenAdmin = localStorage.getItem('tokenAdmin');
  if (requiresAdmin && !tokenAdmin) {
    alert('Acesso negado. Faça login como administrador!');
    next('/login');
  } else {
    next();
  }
});

export default router;
