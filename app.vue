<script setup lang="ts">
const isDev = import.meta.dev

const logger = useLogger('app.vue')
const { name, version } = useRuntimeConfig().public.app

useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: isDev ? '/favicon-dev.svg' : '/favicon.svg' }],
  titleTemplate: title => isDev ? `${title} · ${name}@${version}` : `${title} · TicTacToe`,
})

onMounted(() => {
  logger.ready('application is ready')
})
</script>

<template>
  <NuxtLoadingIndicator />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
