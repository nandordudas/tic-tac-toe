<script setup lang="ts">
definePageMeta({
  pathname: '/game/:id',
  validate: () => true,
})

useHead({
  title: 'Game',
})

const logger = useLogger('pages::game')
const route = useRoute()

onMounted(() => {
  logger.info('mounted')
})
</script>

<template>
  <article>
    <h1>game</h1>

    <Suspense>
      <Game :game-id="route.params.id as string" />
    </Suspense>
  </article>
</template>
