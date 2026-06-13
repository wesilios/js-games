// Standard Tetris constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

export type Matrix = number[][];
export interface Coordinate {
  x: number;
  y: number;
}
export interface Piece {
  matrix: Matrix;
  position: Coordinate;
  color: string;
}
export interface GameState {
  score: number;
  lineCleared: number;
  isGameOver: boolean;
  isGameStarted: boolean;
  grid: Matrix;
  currentPiece: Piece | null;
}

export let state: GameState = {
  score: 0,
  lineCleared: 0,
  isGameOver: false,
  isGameStarted: false,
  grid: Array.from(
    {
      length: ROWS,
    },
    () => Array(COLS).fill(0)
  ),
  currentPiece: null,
};

const SHAPES = {
  I: [[1, 1, 1, 1]],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
};

const COLORS = {
  I: '#00f0f0', // Cyan
  J: '#0000f0', // Blue
  L: '#f0a000', // Orange
  O: '#f0f000', // Yellow
  S: '#00f000', // Green
  T: '#a000f0', // Purple
  Z: '#f00000', // Red
};

let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let dropCounter = 0;
let lastTime = 0;
let animationFrameId: number;

const createPiece = (): Piece => {
  const keys = Object.keys(SHAPES) as (keyof typeof SHAPES)[];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const matrix = SHAPES[randomKey];

  return {
    matrix,
    color: COLORS[randomKey],
    position: { x: Math.floor((COLS - matrix[0].length) / 2), y: 0 },
  };
};

const drawOverlay = (text: string, color: string): void => {
  if (!canvas || !canvasContext) return;
  canvasContext.fillStyle = 'rgba(0, 0, 0, 0.75)';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  canvasContext.fillStyle = color;
  canvasContext.font = 'bold 12px monospace';
  canvasContext.textAlign = 'center';
  canvasContext.fillText(text, canvas.width / 2, canvas.height / 2);
  canvasContext.textAlign = 'left';
};

const drawUIOverlay = (): void => {
  canvasContext.fillStyle = '#fff';
  canvasContext.font = 'bold 14px monospace';
  canvasContext.fillText(`Score: ${state.score}`, 15, 25);

  if (!state.isGameStarted) {
    drawOverlay('PRESS ANY ARROW KEY TO START', '#00f0f0');
  } else if (state.isGameOver) {
    drawOverlay('GAME OVER - CLICK TO RESET', '#f00000');
  }
};

const drawCurrentPiece = (): void => {
  if (state.currentPiece) {
    canvasContext.fillStyle = state.currentPiece.color;
    const matrix = state.currentPiece.matrix;
    const position = state.currentPiece.position;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          canvasContext.fillRect(
            (position.x + c) * BLOCK_SIZE,
            (position.y + r) * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1
          );
        }
      }
    }
  }
};

const draw = (): void => {
  if (!canvas || !canvasContext) return;

  // Render Background Field
  canvasContext.fillStyle = '#111';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  // Render Static/Locked Board Blocks

  // Render Active Falling Piece
  drawCurrentPiece();

  // UI Text Overlays
  drawUIOverlay();
};

const gameLoop = (time: 0): void => {
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
};

const handleKeyDown = (event: KeyboardEvent): void => {
  if (state.isGameOver) return;

  if (
    !state.isGameStarted &&
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'd', 'a'].includes(event.key)
  ) {
    state.isGameStarted = true;
  }
};

const handleCanvasClick = (): void => {
  if (!state.isGameOver) return;

  // Full game wipe/restart reset state
  state.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  state.score = 0;
  state.linesCleared = 0;
  state.isGameOver = false;
  state.isGameStarted = false;
  state.currentPiece = createPiece();
};

export const hotUpdate = (oldState: GameState): void => {
  if (oldState) state = oldState;
  windown.removeEventListener('keydown', handleKeyDown);
  if (canvas) canvas.removeEventListener('click', handleCanvasClick);
  cancelAnimationFrame(animationFrameId);
  init();
};

export const init = (): void => {
  canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  // Perfect dimensions for our 10x20 playground grid
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;

  canvasContext = canvas.getContext('2d');

  window.addEventListener('keydown', handleKeyDown);
  canvas.addEventListener('click', handleCanvasClick);

  if (!state.currentPiece) {
    state.currentPiece = createPiece();
  }

  gameLoop();
};
