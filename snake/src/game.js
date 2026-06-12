const gridSize = 20;
let tileCount;

let canvasContext;
let canvas;
let gameLoopTimeoutId;

export let state = {
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

const spawnFood = () => {
  state.food.x = Math.floor(Math.random() * tileCount);
  state.food.y = Math.floor(Math.random() * tileCount);

  for (let segment of state.snake) {
    if (segment.x === state.food.x && segment.y === state.food.y) {
      spawnFood();
      break;
    }
  }
};

/**
 * Steps the positional grid coordinates forward, tracking collision events.
 */
const updateLogic = () => {
  if (state.isGameOver || !state.isGameStarted) return;

  const head = {
    x: state.snake[0].x + state.speedX,
    y: state.snake[0].y + state.speedY,
  };

  // Boundary Crash check
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    state.isGameOver = true;
    return;
  }

  // Self collision check
  for (let segment of state.snake) {
    if (head.x === segment.x && head.y === segment.y) {
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
    // If food wasn't eaten, pop the trailing tail segment off to keep normal length
    state.snake.pop();
  }
};

/**
 * ============================================================================
 * RENDERING ENGINE (CANVAS 2D)
 * ============================================================================
 */

const draw = () => {
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

const drawOverlay = (text, textColor) => {
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

const gameLoop = () => {
  updateLogic();
  draw();
  gameLoopTimeoutId = setTimeout(gameLoop, 100);
};

/**
 * ============================================================================
 * INPUT CONTROLS & EVENT HANDLERS
 * ============================================================================
 */
const handleKeyDown = (event) => {
  const key = event.key;
  const goingUp = state.speedY === -1;
  const goingDown = state.speedY === 1;
  const goingRight = state.speedX === 1;
  const goingLeft = state.speedX === -1;

  if ((key === 'ArrowUp' || key === 'w') && !goingDown) {
    state.speedX = 0;
    state.speedY = -1;
    state.isGameStarted = true;
  }
  if ((key === 'ArrowDown' || key === 's') && !goingUp) {
    state.speedX = 0;
    state.speedY = 1;
    state.isGameStarted = true;
  }
  if ((key === 'ArrowLeft' || key === 'a') && !goingRight) {
    state.speedX = -1;
    state.speedY = 0;
    state.isGameStarted = true;
  }
  if ((key === 'ArrowRight' || key === 'd') && !goingLeft) {
    state.speedX = 1;
    state.speedY = 0;
    state.isGameStarted = true;
  }
};

const handleCanvasClick = () => {
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

export const hotUpdate = (oldState) => {
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

export const init = () => {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');
  tileCount = canvas.width / gridSize;

  window.addEventListener('keydown', handleKeyDown);
  canvas.addEventListener('click', handleCanvasClick);

  if (state.snake.length === 1 && state.score === 0) {
    spawnFood();
  }

  gameLoop();
};
