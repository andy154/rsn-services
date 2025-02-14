<script setup lang="ts">
</script>

<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-title>Россувенир</v-app-bar-title>

    <v-btn @click="$router.push('/')">Рабочий стол</v-btn>
    <v-btn @click="$router.push('/taxcalc')">Калькулятор</v-btn>
  </v-app-bar>
</template>

<style scoped>

</style>