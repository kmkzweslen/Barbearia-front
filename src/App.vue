<template>
    <Header />
    <NavBar />
    <router-view />
</template>

<script setup>
import Header from './components/Header.vue';
import NavBar from './components/NavBar.vue';
</script>

<style scoped>
 body{
  margin: 0px,
 }
</style>