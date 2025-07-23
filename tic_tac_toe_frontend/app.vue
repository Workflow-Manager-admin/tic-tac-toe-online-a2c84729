<template>
  <div class="container">
    <h1 class="title">Tic Tac Toe</h1>
    <div class="mode-switch">
      <button
        :class="['mode-btn', { active: mode === 'pvp' }]"
        @click="setMode('pvp')"
      >Player vs Player</button>
      <button
        :class="['mode-btn', { active: mode === 'ai' }]"
        @click="setMode('ai')"
      >Player vs AI</button>
    </div>
    <div class="scoreboard">
      <div class="score" :style="{color: colorPrimary}">
        X Wins: <span class="score-num">{{ winCounts.x }}</span>
      </div>
      <div class="score" :style="{color: colorAccent}">
        O Wins: <span class="score-num">{{ winCounts.o }}</span>
      </div>
    </div>
    <div class="status" :style="{color: statusColor}">
      <span>{{ statusMessage }}</span>
    </div>
    <div class="board">
      <div
        v-for="(cell, idx) in board"
        :key="idx"
        class="cell"
        :class="{ clickable: !!cell === false && !winner, highlight: winnerLine?.includes(idx) }"
        @click="handleCellClick(idx)"
      >
        <span :class="cell === 'X' ? 'xmark' : cell === 'O' ? 'omark' : ''">{{ cell }}</span>
      </div>
    </div>
    <div class="actions">
      <button class="restart-btn" @click="restartGame">Restart Game</button>
    </div>
    <footer class="footer">
      <span>Made with Nuxt • Minimal UI</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
// PUBLIC_INTERFACE
/**
 * Tic Tac Toe: Minimal, responsive web game
 * - Player vs Player & Player vs AI
 * - Session-based win tracking
 * - Responsive centered layout
 */
import { ref, watch, computed } from 'vue'
import { useTicTacToe } from './composables/useTicTacToe'

const colorPrimary = '#1976d2'
const colorSecondary = '#424242'
const colorAccent = '#ffb300'

const mode = ref<'pvp'|'ai'>('pvp')

// Win counters, persistent in-session
const winCounts = ref<{x: number, o: number}>({
  x: Number(sessionStorage.getItem('winX') || 0),
  o: Number(sessionStorage.getItem('winO') || 0),
})

const { board, currentPlayer, winner, winnerLine, status, makeMove, restart, aiMove } = useTicTacToe(mode)

watch(winner, (w) => {
  if (w === 'X' || w === 'O') {
    winCounts.value[w.toLowerCase() as 'x'|'o']++
    sessionStorage.setItem('winX', winCounts.value.x.toString())
    sessionStorage.setItem('winO', winCounts.value.o.toString())
  }
})

function setMode(newMode: 'pvp'|'ai') {
  if (mode.value !== newMode) {
    mode.value = newMode
    restart()
  }
}

function handleCellClick(idx: number) {
  if (winner.value || board.value[idx]) return
  makeMove(idx)
  // For AI mode, let AI move after human if game not over
  if (mode.value === 'ai' && !winner.value && currentPlayer.value === 'O') {
    setTimeout(() => {
      aiMove()
    }, 380)
  }
}

function restartGame() {
  restart()
}

const statusMessage = computed(() => {
  if (winner.value === 'draw') return 'It\'s a draw! 🤝'
  if (winner.value === 'X') return 'X wins! 🎉'
  if (winner.value === 'O') return 'O wins! 🎉'
  return mode.value === 'ai'
    ? (currentPlayer.value === 'X' ? 'Your turn (X)' : 'AI thinking…')
    : `Current turn: ${currentPlayer.value}`
})

const statusColor = computed(() => {
  if (winner.value === 'X') return colorPrimary
  if (winner.value === 'O') return colorAccent
  if (winner.value === 'draw') return colorSecondary
  return colorSecondary
})
</script>

<style scoped>
:root {
  --color-primary: #1976d2;
  --color-secondary: #424242;
  --color-accent: #ffb300;
  --color-bg: #fbfbfb;
  --color-border: #d2dbe4;
}
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--color-bg);
  padding: 2rem 0 1.2rem 0;
}
.title {
  font-size: 2.3rem;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 10px;
  text-align: center;
}
.mode-switch {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.7rem;
}
.mode-btn {
  appearance: none;
  background: none;
  border: 2px solid var(--color-border);
  color: var(--color-secondary);
  padding: 0.4rem 1.1rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 999px;
  transition: all 0.16s;
  font-weight: 500;
}
.mode-btn.active,
.mode-btn:focus-visible {
  border-color: var(--color-accent);
  color: var(--color-primary);
  background: #fbe9c1;
}
.scoreboard {
  display: flex;
  gap: 2.2rem;
  margin: 0.1rem auto 0.85rem;
  font-size: 1.12rem;
  justify-content: center;
}
.score-num {
  font-weight: bold;
  font-size: 1.15em;
}

.status {
  margin-bottom: 0.7rem;
  font-size: 1.12rem;
  min-height: 1.4em;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 70px);
  grid-template-rows: repeat(3, 70px);
  gap: 7px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 32px 0 rgba(25, 118, 210, 0.09);
  margin-bottom: 1.05rem;
  padding: 11px;
  user-select: none;
}
.cell {
  width: 70px;
  height: 70px;
  background: #f7f7f9;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.6rem;
  color: var(--color-primary);
  cursor: default;
  border: 2.1px solid transparent;
  transition: border-color 0.13s, background 0.13s;
  box-sizing: border-box;
}
.cell.clickable {
  cursor: pointer;
  border-color: var(--color-border);
}
.cell.clickable:hover {
  background: #f2f9fd;
  border-color: var(--color-primary);
}
.cell.highlight {
  background: #fff8e1 !important;
  border-color: var(--color-accent);
}
.xmark {
  color: var(--color-primary);
  font-weight: bold;
}
.omark {
  color: var(--color-accent);
  font-weight: bold;
}
.actions {
  margin: 0.2rem 0 0.6rem;
}
.restart-btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 99px;
  padding: 0.5rem 1.4rem;
  font-size: 1.02rem;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 14px 0 #d2dbe410;
  transition: background 0.13s, box-shadow 0.13s;
}
.restart-btn:hover, .restart-btn:focus-visible {
  background: var(--color-accent);
  color: var(--color-secondary);
  box-shadow: 0 2px 18px 0 #ffd45e25;
}
.footer {
  font-size: 0.98em;
  color: #9693a3;
  margin-top: 14px;
  letter-spacing: 0.01em;
}
/* Responsive styles */
@media (max-width: 610px) {
  .board {
    grid-template-columns: repeat(3, 20vw);
    grid-template-rows: repeat(3, 20vw);
    min-width: 0;
    max-width: 97vw;
    padding: 3vw;
    gap: 2vw;
  }
  .cell {
    width: 20vw !important;
    height: 20vw !important;
    font-size: 7vw;
    border-radius: 5vw;
  }
  .container {
    padding: 2vw 0 2vw 0;
  }
  .title {
    font-size: 2.1em;
  }
}
</style>
