<script setup lang="ts">
import GameWorker from '~/utils/game.worker?worker'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  gameId?: string
}>()

type Message =
  | { type: 'status', status: 'OPEN' | 'CONNECTING' | 'CLOSED' }
  | { type: 'data', data: { command: 'new-game', gameId: string } }

const logger = useLogger('[components/Game]')
const { data, post } = useWebWorker(new GameWorker())
const { start, finish } = useLoadingIndicator()

const status = ref<'OPEN' | 'CONNECTING' | 'CLOSED'>('CLOSED')

start()

watch(status, (value) => {
  if (value === 'CONNECTING')
    start()
  else
    finish()
})

watch(data, async (value) => {
  const data = safeParse<Message>(value)

  switch (data?.type) {
    case 'status': {
      status.value = data.status
      break
    }

    case 'data': {
      logger.info('new-game', data)

      if (data.data.command === 'new-game')
        await navigateTo(`/game/${data.data.gameId}`)

      break
    }

    default:
      logger.info('unknown message', data)
      break
  }
})

onMounted(() => {
  logger.info('mounted')
})

if (props.gameId)
  post({ command: 'join', gameId: props.gameId })

function onClickNewGame() {
  logger.info('onClickNewGame')
  post({ command: 'new-game' })
}
</script>

<template>
  <main>
    <div v-if="status === 'CONNECTING'">
      Connecting...
    </div>

    <div v-else-if="status === 'CLOSED'">
      Disconnected
    </div>

    <div v-else>
      <button v-if="!props.gameId" type="button" class="btn btn-primary" @click="onClickNewGame">
        New Game
      </button>
    </div>
  </main>
</template>
