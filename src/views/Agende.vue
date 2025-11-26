<template>
  <section class="agendamento">
    <h1>Novo Agendamento</h1>
    <form>
      <label>
        Serviço
        <select required></select>
      </label>
      <label>
        Barbeiro
        <select required></select>
      </label>
      <label>
        Data
        <input type="date" required />
      </label>
      <label>
        Hora
        <input type="time" required />
      </label>
      <button type="submit" class="btn">Agendar</button>
    </form>
  </section>
</template>
<script setup>
// Ainda sem lógica
</script>
<style scoped>
.agendamento {
  padding: 20px;
  background-color: #111;
  color: #eee;
  font-family: Arial, sans-serif;
}
label {
  display: block;
  margin-bottom: 12px;
}
select,
input[type="date"],
input[type="time"] {
  display: block;
  margin-top: 4px;
  padding: 8px;
  width: 250px;
  border-radius: 5px;
  border: 1px solid #444;
  background-color: #222;
  color: #fff;
}
.btn {
  margin-top: 10px;
  background-color: #f90;
  color: #222;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
}
.btn:hover {
  background-color: #e68a00;
}
.success {
  margin-top: 10px;
  color: #5ac95a;
}
.error {
  margin-top: 10px;
  color: #ff4444;
}
</style>
