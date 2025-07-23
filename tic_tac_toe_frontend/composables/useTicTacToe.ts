import { ref, computed, watch } from 'vue'

type Cell = 'X' | 'O' | ''

// PUBLIC_INTERFACE
/**
 * Composable for Tic Tac Toe game logic.
 * Provides board state, move logic, winner detection, and AI move generation.
 */
export function useTicTacToe(modeRef: any) {
  const board = ref<Cell[]>(Array(9).fill(''))
  const currentPlayer = ref<'X'|'O'>('X')
  const winner = ref<''|'X'|'O'|'draw'>('')
  const winnerLine = ref<number[]|null>(null)
  const status = ref<string>('')

  watch(modeRef, () => {
    reset()
  })

  function checkWinner(boardArr: Cell[]): {winner: ''|'X'|'O', line?: number[]} {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (const line of lines) {
      const [a, b, c] = line
      if (boardArr[a] && boardArr[a] === boardArr[b] && boardArr[a] === boardArr[c]) {
        return { winner: boardArr[a], line }
      }
    }
    if (!boardArr.includes('')) return { winner: 'draw' }
    return { winner: '' }
  }

  // PUBLIC_INTERFACE
  /**
   * Make a move at index
   * @param idx Cell index [0-8]
   */
  function makeMove(idx: number) {
    if (board.value[idx] || winner.value) return
    board.value[idx] = currentPlayer.value
    const res = checkWinner(board.value)
    if (res.winner) {
      winner.value = res.winner === 'draw' ? 'draw' : (res.winner as 'X'|'O')
      winnerLine.value = res.line ?? null
    } else {
      currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X'
    }
  }

  // Dumb AI - pick first available
  function computeAIMove(): number|null {
    // Simple: Win if possible, then block opponent, else random
    const b = board.value.slice()
    // Try win or block
    for (const side of ['O', 'X'] as const) {
      for (let i = 0; i < 9; ++i) {
        if (!b[i]) {
          b[i] = side
          if (checkWinner(b).winner === side) return i
          b[i] = ''
        }
      }
    }
    // Center, Corner, Side preference
    const prefs = [4, 0, 2, 6, 8, 1, 3, 5, 7]
    const empty = prefs.filter(i => !board.value[i])
    return empty.length ? empty[0] : null
  }

  // PUBLIC_INTERFACE
  /**
   * Makes the AI move if game is ongoing and it's O's turn
   */
  function aiMove() {
    if (winner.value || currentPlayer.value !== 'O') return
    const aiIdx = computeAIMove()
    if (aiIdx != null) makeMove(aiIdx)
  }

  // PUBLIC_INTERFACE
  /**
   * Reset the board and state
   */
  function restart() {
    board.value = Array(9).fill('')
    currentPlayer.value = 'X'
    winner.value = ''
    winnerLine.value = null
    status.value = ''
  }

  // PUBLIC_INTERFACE
  /**
   * Alias for restart (Nuxt composables convention)
   */
  function reset() { restart() }

  return {
    board,
    currentPlayer,
    winner,
    winnerLine,
    status,
    makeMove,
    aiMove,
    restart,
    reset,
  }
}
