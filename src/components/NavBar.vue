<template>
  <nav class="navbar">
    <ul>
      <li><router-link to="/" exact>Home</router-link></li>
      <li><router-link to="/nossa-marca">Nossa Marca</router-link></li>
      <li><router-link to="/barba-cabelo">Barba & Cabelo</router-link></li>
      <li><router-link to="/agende">Agende</router-link></li>
      <li><router-link to="/login">Login</router-link></li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
};
</script> 

<style scoped>
.navbar {
  background-color: #222;
  padding: 10px;
}

ul {
  list-style-type: none;
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
}

li {
  font-weight: bold;
}

a {
  color: #5599ff;
  text-decoration: none;
}

a.router-link-exact-active {
  color: #ffcc00;
}
</style>
