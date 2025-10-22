<template>
  <div>
    <Header />
    <NavBar />
    <router-view />
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
import NavBar from './components/NavBar.vue';
</script>
