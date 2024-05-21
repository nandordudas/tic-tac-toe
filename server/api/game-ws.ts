import { randomUUID } from 'node:crypto'

type Message =
  | { command: 'new-game', message: string }
  | { command: 'join', gameId: string }

const logger = useLogger('server::api::game-ws')

const clients = new WeakMap<WebSocket, Client>()
const gameRooms = new Map<string, GameRoom>()

export default defineWebSocketHandler({
  error(peer, error) {
    logger.info('[ws] error', peer.ctx.node.req.url, error)
  },
  close(peer) {
    logger.info('[ws] close', peer.ctx.node.req.url)

    const client = clients.get(peer.ctx.node.ws as WebSocket)

    if (!client)
      throw createError('Client not found')

    if (client.room) {
      peer.unsubscribe(client.room.id)
      client.room.removePlayer(client)

      if (client.room.isEmpty)
        gameRooms.delete(client.room.id)
    }

    clients.delete(client.ws)
  },
  upgrade(req) {
    logger.info('[ws] upgrade', req.url)
  },
  open(peer) {
    logger.info('[ws] open', peer.ctx.node.req.url)

    const client = new Client(peer.ctx.node.ws as WebSocket)

    clients.set(client.ws, client)
  },
  message(peer, message) {
    logger.info('[ws] message', peer.ctx.node.req.url, message)

    const data = safeParse<Message>(message.text())
    const client = clients.get(peer.ctx.node.ws as WebSocket)

    if (!client)
      throw createError('Client not found')

    switch (data?.command) {
      case 'new-game': {
        peer.send({ command: 'new-game', gameId: randomUUID() })
        break
      }

      case 'join': {
        peer.send({ command: 'join', gameId: data.gameId })

        const room = gameRooms.get(data.gameId) ?? new GameRoom(data.gameId)

        peer.subscribe(room.id)
        gameRooms.set(room.id, room)
        room.addPlayer(client)

        if (room.isFull) {
          peer.publish(room.id, { command: 'x-start' }) // INFO: publish method is not working as expected
          room.players.forEach(player => player.ws.send(JSON.stringify({ command: 'start' })))
        }

        break
      }

      default:
        logger.info('[ws] unknown message', peer.ctx.node.req.url, message)
        break
    }
  },
})

function safeParse<T>(data: unknown): T | undefined {
  try {
    return JSON.parse(data as string) as T
  }
  catch {
    return undefined
  }
}

class GameRoom {
  static readonly MAX_PLAYERS = 2

  players: Client[] = []

  get isEmpty() {
    return false
  }

  get isFull() {
    return this.players.length >= GameRoom.MAX_PLAYERS
  }

  constructor(public readonly id: string = randomUUID()) { }

  addPlayer(client: Client) {
    if (this.players.length >= GameRoom.MAX_PLAYERS)
      throw createError('Room is full')

    client.room = this

    this.players.push(client)
  }

  removePlayer(client: Client) {
    this.players = this.players.filter(player => player !== client)
  }
}

class Client {
  isOnline = true

  #id: string = randomUUID()

  public room: GameRoom | null = null

  get id() {
    return this.#id
  }

  constructor(public ws: WebSocket) {}
}
