import { randomUUID } from 'node:crypto'

interface Coordinate {
  x: number
  y: number
}

interface Move {
  coordinate: Coordinate
  playerId: string
  timestamp: number
}

const logger = useLogger('server::api::game-ws')

const MAX_PLAYERS = 2

const WINNING_COMBINATIONS = [
  // rows
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  // columns
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  // diagonals
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
] as const

const clients = new WeakMap<WebSocket, Client>()
const gameRooms = new Map<string, GameRoom>()

export default defineWebSocketHandler({
  error(peer, error) {
    logger.info('[ws] error', peer.ctx.node.req.url, error)
  },
  close(peer) {
    logger.info('[ws] close', peer.ctx.node.req.url)

    const ws = peer.ctx.node.ws
    const client = clients.get(ws)

    if (client?.room) {
      client.room.removePlayer(client)

      if (client.room.isEmpty)
        gameRooms.delete(client.room.id)

      peer.unsubscribe(client.room.id)
    }

    clients.delete(ws)
  },
  upgrade(req) {
    logger.info('[ws] upgrade', req.url)
  },
  open(peer) {
    logger.info('[ws] open', peer.ctx.node.req.url)

    const ws = peer.ctx.node.ws as WebSocket
    const client = new Client(ws)

    clients.set(ws, client)
  },
  message(peer, message) {
    logger.info('[ws] message', peer.ctx.node.req.url, message)

    const ws = peer.ctx.node.ws
    const client = clients.get(ws)

    if (!client)
      return console.error('Client not found')

    const text = message.text()
    let data: any

    try {
      data = JSON.parse(text)
    }
    catch (error) {
      if (text === 'ping')
        peer.send('pong')

      return
    }

    switch (data.type) {
      case 'join': {
        let room = gameRooms.get(data.roomId)

        if (!room) {
          room = new GameRoom(data.roomId)

          gameRooms.set(data.roomId, room)
        }

        room.addPlayer(client)
        peer.subscribe(client.room!.id)
        peer.send({ type: 'joined', roomId: room.id, board: room.getBoardWithSymbols(), playerId: client.id })

        if (room.isFull)
          peer.publish(data.roomId, { type: 'start' })

        break
      }

      case 'move': {
        if (!client.room)
          throw createError('Not in a room')

        const move = client.room.makeMove(client, data.coordinates.x, data.coordinates.y)

        if (move)
          peer.publish(data.roomId, { type: 'move', move, board: client.room.getBoardWithSymbols() })

        break
      }

      default:
        break
    }
  },
})

class Client {
  readonly #id: string = randomUUID()

  public room: GameRoom | null = null

  get id() {
    return this.#id
  }

  constructor(public ws: WebSocket) {}
}

class GameRoom {
  #currentPlayerIndex = 0
  #moves: Move[] = []

  #players: Client[] = []

  get currentPlayer() {
    if (!this.isFull)
      return null

    return this.#players[this.#currentPlayerIndex]!
  }

  get isFull() {
    return this.#players.length >= MAX_PLAYERS
  }

  get isEmpty() {
    return this.#players.length === 0
  }

  constructor(public id: string = randomUUID()) {}

  addPlayer(client: Client) {
    if (this.#players.length >= MAX_PLAYERS)
      throw createError('Room is full')

    client.room = this

    this.#players.push(client)
  }

  removePlayer(client: Client) {
    this.#players = this.#players.filter(player => player !== client)
  }

  makeMove(player: Client, x: number, y: number) {
    if (this.currentPlayer === player && this.isValidMove(x, y)) {
      const move: Move = {
        coordinate: { x, y },
        playerId: player.id,
        timestamp: Date.now(),
      }

      this.#moves.push(move)
      this.#togglePlayer()

      return move
    }

    return null
  }

  #togglePlayer() {
    this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) % 2
  }

  isValidMove(x: number, y: number) {
    return x >= 0 && x < 3 && y >= 0 && y < 3 && !this.#moves.some(move => move.coordinate.x === x && move.coordinate.y === y)
  }

  getBoardState() {
    const board = Array.from({ length: 3 }, () => Array<null | string>(3).fill(null))

    this.#moves.forEach((move) => {
      board[move.coordinate.x]![move.coordinate.y] = move.playerId
    })

    return board
  }

  getBoardWithSymbols() {
    const board = this.getBoardState()

    return board.map(row => row.map((cell) => {
      if (cell === this.#players[0]?.id)
        return 'O'

      if (cell === this.#players[1]?.id)
        return 'X'

      return null
    }))
  }

  checkWinner() {
    const board = this.getBoardState()

    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination

      if (board[a[0]]?.[a[1]] && board[a[0]]?.[a[1]] === board[b[0]]?.[b[1]] && board[a[0]]?.[a[1]] === board[c[0]]?.[c[1]])
        return board[a[0]]?.[a[1]] as 'O' | 'X'
    }

    return null
  }
}
