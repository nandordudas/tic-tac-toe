export function useCustomWebSocket<T>() {
  if (import.meta.server)
    return

  const url = `wss://${location.host}/api/game-ws`

  const { status, data, close, open, send, ws } = useWebSocket<T>(url, {
    protocols: ['game-ws'],
  })

  return {
    status,
    // @ts-expect-error converting error
    data: computed(() => JSON.parse(data.value)),
    close,
    open,
    // should throw an error
    send: (data: T) => send(JSON.stringify(data)),
    ws,
  }
}
