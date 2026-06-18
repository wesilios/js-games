// Standard Tetris constants
const COLS = 16;
const ROWS = 22;
const BLOCK_SIZE = 40;

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

// Tetromino shapes and their corresponding color palette
export let state: GameState = {
  score: 0,
  lineCleared: 0,
  isGameOver: false,
  isGameStarted: true,
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
let dropCounter: number = 0;
let lastTime: number = 0;
let animationFrameId: any;

/**
 * ============================================================================
 * CORE MECHANICS & COLLISION LOGIC
 * ============================================================================
 */

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

const hasCollision = (piece: Piece, grid: Matrix): boolean => {
  const pieceMatrix = piece.matrix;
  const piecePosition = piece.position;

  for (let y = 0; y < pieceMatrix.length; y++) {
    for (let x = 0; x < pieceMatrix[y].length; x++) {
      if (pieceMatrix[y][x] !== 0) {
        const nextX = piecePosition.x + x;
        const nextY = piecePosition.y + y;

        if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
          return true;
        }

        if (nextY >= 0 && grid[nextY][nextX] !== 0) {
          return true;
        }
      }
    }
  }

  return false;
};

const mergePieceToGrid = (): void => {
  if (!state.currentPiece) return;
  const pieceMatrix = state.currentPiece.matrix;
  const piecePosition = state.currentPiece.position;

  for (let y = 0; y < pieceMatrix.length; y++) {
    for (let x = 0; x < pieceMatrix[y].length; x++) {
      if (pieceMatrix[y][x] !== 0) {
        if (piecePosition.y + y < 0) {
          state.isGameOver = true;
          return;
        }

        state.grid[piecePosition.y + y][piecePosition.x + x] = 1;
      }
    }
  }
};

const clearLines = (): void => {
  let lineCount = 0;

  state.grid = state.grid.reduce<Matrix>((acc, row) => {
    if (row.every((cell) => cell !== 0)) {
      lineCount++;
      acc.unshift(Array(COLS).fill(0));
    } else {
      acc.push(row);
    }

    return acc;
  }, []);

  if (lineCount > 0) {
    const scoreMap = [0, 100, 300, 500, 800];
    state.score += scoreMap[lineCount] || 1000;
    state.lineCleared += lineCount;
  }
};

const dropPiece = (): void => {
  if (!state.currentPiece || state.isGameOver || !state.isGameStarted) return;

  state.currentPiece.position.y++;

  if (hasCollision(state.currentPiece, state.grid)) {
    state.currentPiece.position.y--; // Back out of the floor/block
    mergePieceToGrid();
    clearLines();

    if (!state.isGameOver) {
      state.currentPiece = createPiece();
    }
  }
};

/**
 * Rotates a 2D matrix 90 degrees clockwise safely.
 */
const rotateMatrix = (matrix: Matrix): Matrix => {
  const yCount = matrix.length;
  const xCount = matrix[0].length;

  const rotatedMatrix = Array.from({ length: xCount }, () => Array(yCount).fill(0));
  for (let y = 0; y < yCount; y++) {
    for (let x = 0; x < xCount; x++) {
      rotatedMatrix[x][yCount - 1 - y] = matrix[y][x];
    }
  }

  return rotatedMatrix;
};

const playerRotate = (): void => {
  if (!state.currentPiece) return;
  const currentPiece = state.currentPiece;
  const oldMatrix = currentPiece.matrix;
  const newMatrix = rotateMatrix(currentPiece.matrix);
  if (newMatrix) {
    currentPiece.matrix = newMatrix;
  }

  let offset = 1;
  const originX = currentPiece.position.x;
  while (hasCollision(state.currentPiece, state.grid)) {
    currentPiece.position.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (Math.abs(offset) > currentPiece.matrix[0].length) {
      currentPiece.matrix = oldMatrix;
      currentPiece.position.x = originX;
      return;
    }
  }
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

const drawGrid = (): void => {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (state.grid[y][x] !== 0) {
        canvasContext.fillStyle = '#555';
        canvasContext.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
      }
    }
  }
};

/**
 * ============================================================================
 * ENGINE LOOPS & RENDER ENGINE
 * ============================================================================
 */

const draw = (): void => {
  if (!canvas || !canvasContext) return;

  // Render Background Field
  canvasContext.fillStyle = '#111';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  // Render Static/Locked Board Blocks
  drawGrid();

  // Render Active Falling Piece
  drawCurrentPiece();

  // UI Text Overlays
  drawUIOverlay();
};

const gameLoop = (time: number): void => {
  const deltaTime = time - lastTime;
  lastTime = time;

  if (state.isGameStarted && !state.isGameOver) {
    dropCounter += deltaTime;
    console.log(dropCounter);
    console.log(deltaTime);
    if (dropCounter > 1000) {
      dropPiece();
      dropCounter = 0;
    }
  }

  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
};

/**
 * ============================================================================
 * CONTROLLERS & EVENT ATTACHMENTS
 * ============================================================================
 */

const handleKeyDown = (event: KeyboardEvent): void => {
  if (state.isGameOver) return;

  if (
    !state.isGameStarted &&
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'd', 'a'].includes(event.key)
  ) {
    state.isGameStarted = true;
  }

  if (!state.currentPiece) return;

  switch (event.key) {
    case 'ArrowLeft':
    case 'a':
      state.currentPiece.position.x--;
      if (hasCollision(state.currentPiece, state.grid)) state.currentPiece.position.x++;
      break;
    case 'ArrowRight':
    case 'd':
      state.currentPiece.position.x++;
      if (hasCollision(state.currentPiece, state.grid)) state.currentPiece.position.x--;
      break;
    case 'ArrowDown':
    case 's':
      dropPiece();
      dropCounter = 0;
      break;
    case 'ArrowUp':
    case 'w':
      playerRotate();
      break;
  }
};

const handleCanvasClick = (): void => {
  if (!state.isGameOver) return;

  // Full game wipe/restart reset state
  state.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  state.score = 0;
  state.lineCleared = 0;
  state.isGameOver = false;
  state.isGameStarted = false;
  state.currentPiece = createPiece();
};

export const hotUpdate = (oldState: GameState): void => {
  if (oldState) state = oldState;
  window.removeEventListener('keydown', handleKeyDown);
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

  dropCounter = 0;
  lastTime = performance.now();

  animationFrameId = requestAnimationFrame(gameLoop);
};
