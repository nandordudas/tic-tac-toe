const url = `wss://${location.host}/api/game-ws`

const { data, send, status } = useWebSocket(url, {
  autoReconnect: true,
})

watch(status, (value) => {
  post({ status: value, type: 'status' })
})

watch(data, (value) => {
  post({ data: safeParse(value), type: 'data' })
})

addEventListener('message', ({ data }) => {
  send(JSON.stringify(data))
})

function post(data: unknown) {
  postMessage(JSON.stringify(data))
}

export {}
