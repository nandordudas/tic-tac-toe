<script setup lang="ts">
const isDev = import.meta.dev
const faviconHref = isDev ? '/favicon-dev.svg' : '/favicon.svg'

const logger = useLogger('app')
const { name, version } = useRuntimeConfig().public.app

useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: faviconHref }],
  meta: [{ name: 'color-scheme', content: 'light dark' }],
  titleTemplate: title => isDev ? `${title} · ${name}@${version}` : `${title} · TicTacToe`,
})

onMounted(() => {
  logger.info('mounted')
})
</script>

<template>
  <NuxtLoadingIndicator />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="postcss">
.btn {
  @apply rounded px-2 py-1;

  &-primary {
    @apply bg-teal-400 hover:bg-teal-600 dark:text-gray-800;
  }
}
</style>
