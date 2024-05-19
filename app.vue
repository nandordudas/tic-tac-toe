<script setup lang="ts">
const isDev = import.meta.dev
const faviconHref = isDev ? '/favicon-dev.svg' : '/favicon.svg'

const logger = useLogger('app.vue')
const { name, version } = useRuntimeConfig().public.app

useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: faviconHref }],
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
