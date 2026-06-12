const gridSize: number = 20;
let tileCount: number;

let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let gameLoopTimeoutId: any;

export interface Coordinate {
  x: number;
  y: number;
}

export interface GameState {
  snake: Coordinate[];
  food: Coordinate;
  speedX: number;
  speedY: number;
  score: number;
  isGameOver: boolean;
  isGameStarted: boolean;
}

export let state: GameState = {
  snake: [
    {
      x: 10,
      y: 10,
    },
  ],
  food: { x: 5, y: 5 },
  speedX: 0,
  speedY: 0,
  score: 0,
  isGameOver: false,
  isGameStarted: false,
};

const spawnFood = (): void => {
  const safetyTileCount = tileCount && !isNaN(tileCount) ? tileCount : 20;

  let foodOnSnake: boolean = true;
  while (foodOnSnake) {
    state.food.x = Math.floor(Math.random() * safetyTileCount);
    state.food.y = Math.floor(Math.random() * safetyTileCount);
    foodOnSnake = state.snake.some((segment: Coordinate) => segment.x === state.food.x && segment.y === state.food.y);
  }
};

/**
 * Steps the positional grid coordinates forward, tracking collision events.
 */
const updateLogic = (): void => {
  if (state.isGameOver || !state.isGameStarted) return;

  const head: Coordinate = {
    x: state.snake[0].x + state.speedX,
    y: state.snake[0].y + state.speedY,
  };

  // Boundary Crash check
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    state.isGameOver = true;
    return;
  }

  // Self collision check
  for (let i = 0; i < state.snake.length; i++) {
    if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
      state.isGameOver = true;
      return;
    }
  }

  state.snake.unshift(head);

  // Food Consumption Check
  if (head.x === state.food.x && head.y === state.food.y) {
    state.score += 10;
    spawnFood();
  } else {
    state.snake.pop();
  }
};

/**
 * ============================================================================
 * RENDERING ENGINE (CANVAS 2D)
 * ============================================================================
 */

const draw = (): void => {
  if (!canvas || !canvasContext) return;
  // Clear Active Viewport Background Grid
  canvasContext.fillStyle = '#111';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  // Render Food Node
  canvasContext.fillStyle = '#ff9800'; // Bright neon orange
  canvasContext.fillRect(state.food.x * gridSize, state.food.y * gridSize, gridSize - 2, gridSize - 2);

  // Render Snake Body Array Elements
  state.snake.forEach((segment, index) => {
    // Make the head a slightly lighter shade of green than the tail body nodes
    canvasContext.fillStyle = index === 0 ? '#8bc34a' : '#4CAF50';
    canvasContext.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });

  // Render Overlays
  if (!state.isGameStarted) {
    drawOverlay('PRESS ARROWS TO START', '#ff9800');
  } else if (state.isGameOver) {
    drawOverlay('GAME OVER - CLICK SCREEN TO RESTART', '#f44336');
  }
};

const drawOverlay = (text: string, textColor: string): void => {
  if (!canvas || !canvasContext) return;
  canvasContext.fillStyle = 'rgba(0, 0, 0, 0.75)';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  canvasContext.fillStyle = textColor;
  canvasContext.font = 'bold 16px monospace';
  canvasContext.textAlign = 'center';
  canvasContext.fillText(text, canvas.width / 2, canvas.height / 2);

  canvasContext.fillStyle = '#ffffff';
  canvasContext.fillText(`Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 30);
  canvasContext.textAlign = 'left';
};

const gameLoop = (): void => {
  updateLogic();
  draw();
  gameLoopTimeoutId = setTimeout(gameLoop, 100);
};

/**
 * ============================================================================
 * INPUT CONTROLS & EVENT HANDLERS
 * ============================================================================
 */
const handleKeyDown = (event: KeyboardEvent): void => {
  const key = event.key;

  // Determine actual physical movement direction based on the body structure
  const hasBody = state.snake.length > 1;
  const physicalGoingDown = hasBody ? state.snake[0].y < state.snake[1].y : false;
  const physicalGoingUp = hasBody ? state.snake[0].y > state.snake[1].y : false;
  const physicalGoingLeft = hasBody ? state.snake[0].x > state.snake[1].x : false;
  const physicalGoingRight = hasBody ? state.snake[0].x < state.snake[1].x : false;

  if ((key === 'ArrowUp' || key === 'w') && !physicalGoingDown) {
    state.speedX = 0;
    state.speedY = -1;
    state.isGameStarted = true;
  }
  if ((key === 'ArrowDown' || key === 's') && !physicalGoingUp) {
    state.speedX = 0;
    state.speedY = 1;
    state.isGameStarted = true;
  }
  if ((key === 'ArrowLeft' || key === 'a') && !physicalGoingRight) {
    state.speedX = -1;
    state.speedY = 0;
    state.isGameStarted = true;
  }
  if ((key === 'ArrowRight' || key === 'd') && !physicalGoingLeft) {
    state.speedX = 1;
    state.speedY = 0;
    state.isGameStarted = true;
  }
};

const handleCanvasClick = (): void => {
  if (!state.isGameOver) return;

  // Clear and reconstruct running parameters on a reset call
  state.snake = [{ x: 10, y: 10 }];
  state.score = 0;
  state.speedX = 0;
  state.speedY = 0;
  state.isGameOver = false;
  state.isGameStarted = false;
  spawnFood();
};

export const hotUpdate = (oldState: GameState) => {
  if (oldState) {
    state = oldState;
  }

  window.removeEventListener('keydown', handleKeyDown);
  if (canvas) {
    canvas.removeEventListener('click', handleCanvasClick);
  }

  clearTimeout(gameLoopTimeoutId);
  init();
};

export const init = (): void => {
  canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;
  canvasContext = canvas.getContext('2d');
  tileCount = canvas.width / gridSize;

  window.addEventListener('keydown', handleKeyDown);
  canvas.addEventListener('click', handleCanvasClick);

  if (state.snake.length === 1 && state.score === 0) {
    spawnFood();
  }

  gameLoop();
};
