<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

interface Message {
  type: string
  coordinates?: { x: number, y: number }
  roomId?: string
  playerId?: string
}

const logger = useLogger('components::Game')
const { status, data, send } = useCustomWebSocket<Message>()!
const roomId = ref<string | null>(null)
const playerId = ref<string | null>(null)

onMounted(() => {
  logger.info('mounted')
  send({ type: 'join' })
})

watch(data, (value) => {
  logger.info('[ws] received', value)

  if (value?.type === 'joined') {
    roomId.value = value.roomId
    playerId.value = value.playerId

    send({ type: 'move', coordinates: { x: 0, y: 0 }, roomId: value.roomId, playerId: value.playerId })
  }
})

function onClick() {
  const x = Math.floor(Math.random() * 3)
  const y = Math.floor(Math.random() * 3)
  // @ts-expect-error asd
  send({ type: 'move', coordinates: { x, y }, roomId: roomId.value, playerId: playerId.value })
}
</script>

<template>
  <div @click="onClick">
    home

    {{ status }} {{ data }}
  </div>
</template>
