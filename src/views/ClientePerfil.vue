<template>
<section>
    <h1>Perfil Cliente</h1>
    <Agendamentos role="CLIENTE" :email="emailLogado"/>
</section>
</template>

<script setup>
const emailLogado = localStorage.getItem('emailCliente');
</script>

<style scoped>

</style>