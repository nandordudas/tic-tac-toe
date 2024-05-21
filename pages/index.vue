<script setup lang="ts">
const logger = useLogger('pages::index')

useHead({
  title: 'Home',
})

onMounted(() => {
  logger.info('mounted')
})
</script>

<template>
  <article>
    <h1>home</h1>

    <Suspense>
      <Game />
    </Suspense>
  </article>
</template>
