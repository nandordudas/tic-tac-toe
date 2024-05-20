<script setup lang="ts">
useHead({
  title: 'Home',
})

const logger = useLogger('pages::index')

onMounted(() => {
  logger.info('mounted')
})
</script>

<template>
  <div>
    <h1>home</h1>
    <Game />
  </div>
</template>
