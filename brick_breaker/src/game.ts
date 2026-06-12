/**
 * ============================================================================
 * TYPE DEFINITIONS & CONTRASTS
 * ============================================================================
 */

export interface BrickCell {
  x: number;
  y: number;
  active: boolean;
}

export interface BrickConfig {
  height: number;
  width: number;
  padding: number;
  topOffset: number;
  leftOffset: number;
  rows: number;
  cols: number;
}

export const GameStatus = {
  notStart: 0,
  starting: 1,
  started: 2,
  ended: 3,
} as const;

export type GameStatusType = (typeof GameStatus)[keyof typeof GameStatus];

export interface GameState {
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  paddleX: number;
  paddleY: number;
  bricks: BrickCell[][];
  status: GameStatusType;
  countdownNumber: number;
  time: number;
  score: number;
  lives: number;
}
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 10;

export let state: GameState = {
  ballX: 400,
  ballY: 575,
  ballSpeedX: 4,
  ballSpeedY: -4,
  paddleX: 350,
  paddleY: 585,
  bricks: [],
  status: GameStatus.notStart,
  countdownNumber: 0,
  time: 0,
  score: 0,
  lives: 3,
};

let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let animationFrameId: number;
let countdownIntervalId: any; // Using standard interval timers

/**
 * ============================================================================
 * GAME MECHANICS & LOGIC
 * ============================================================================
 */

/**
 * Triggers a 5-second ticking countdown before releasing the ball into play.
 */

const startCountDown = (): void => {
  state.status = GameStatus.starting;
  state.countdownNumber = 3;

  clearInterval(countdownIntervalId);

  countdownIntervalId = setInterval((): void => {
    state.countdownNumber--;
    if (state.countdownNumber <= 0) {
      clearInterval(countdownIntervalId);
      state.status = GameStatus.started;
    }
  }, 1000);
};

const brickConfiguration: BrickConfig = {
  height: 20,
  width: 80,
  rows: 0,
  cols: 0,
  padding: 10,
  topOffset: 50,
  leftOffset: 35,
};

/**
 * Automatically computes the maximum columns and rows that can fit the canvas.
 * @param {HTMLCanvasElement} canvasObj - The active canvas DOM instance
 * @param {Object} config - Your brickConfiguration object
 * @returns {Object} { cols: number, rows: number }
 */
const calculateMaxGridDimensions = (canvasObj: HTMLCanvasElement, config: BrickConfig): void => {
  // Available horizontal space math:
  // Total Width = (cols * brickWidth) + ((cols - 1) * padding) + leftOffset + rightOffset
  // Let's assume symmetric margins for safety (leftOffset on both sides)
  const availableWidth = canvasObj.width - config.leftOffset * 2;

  // Solve for columns: (cols * (width + padding)) - padding <= availableWidth
  const maxCols = Math.floor((availableWidth + config.padding) / (config.width + config.padding));

  // Available vertical space math (leaving room for the player down low):
  // Let's restrict bricks to only occupy the top 40% of the canvas height
  const playableHeightLimit = canvasObj.height * 0.4;
  const availableHeight = playableHeightLimit - config.topOffset;

  const maxRows = Math.floor((availableHeight + config.padding) / (config.height + config.padding));

  return {
    cols: Math.max(1, maxCols), // Guarantee at least 1 column minimum
    rows: Math.max(1, maxRows), // Guarantee at least 1 row minimum
  };
};

const createBrickGrid = (): void => {
  state.bricks = [];
  for (let c = 0; c < brickConfiguration.cols; c++) {
    state.bricks[c] = [];
    for (let r = 0; r < brickConfiguration.rows; r++) {
      const brickX = c * (brickConfiguration.width + brickConfiguration.padding) + brickConfiguration.leftOffset;
      const brickY = r * (brickConfiguration.height + brickConfiguration.padding) + brickConfiguration.topOffset;

      state.bricks[c][r] = {
        x: brickX,
        y: brickY,
        active: true,
      };
    }
  }
};

const resetBallOnPaddle = (): void => {
  state.ballX = state.paddleX + PADDLE_WIDTH / 2;
  state.ballY = state.paddleY - BALL_RADIUS - 2;
  state.ballSpeedY = -4; // Reset moving upward
  state.ballSpeedX = Math.random() * 4 - 2; // Slight random angle variation
};

const drawBall = (): void => {
  // Only draw the ball if the game has explicitly begun
  if (state.status !== GameStatus.started) return;

  canvasContext.fillStyle = '#ffff00';
  canvasContext.beginPath();
  canvasContext.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2, false);
  canvasContext.fill();
};

const drawScoreBoard = (): void => {
  canvasContext.fillStyle = '#ff00ff'; // Vibrant pink/magenta color for visibility
  canvasContext.font = 'bold 12px monospace';
  canvasContext.textAlign = 'left';
  canvasContext.fillText(`Lives: ${state.lives} - Score: ${state.score}`, 35, 30);
  // Revert back to standard alignment for other rendering actions
  canvasContext.textAlign = 'left';
};

const drawStartScreen = (): void => {
  if (state.status === GameStatus.starting || state.status === GameStatus.started) return;

  // Dim the background background slightly
  canvasContext.fillStyle = 'rgba(0, 0, 0, 0.75)';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  canvasContext.textAlign = 'center';

  if (state.status === GameStatus.ended) {
    // Game Over / Winning Screen Header
    canvasContext.fillStyle = '#ff00ff';
    canvasContext.font = 'bold 48px monospace';
    canvasContext.fillText(`Final Score ${state.time}`, canvas.width / 2, canvas.height / 2 - 60);

    canvasContext.fillStyle = '#fff';
    canvasContext.font = '18px monospace';
    canvasContext.fillText('Final Score match completed', canvas.width / 2, canvas.height / 2 - 20);
  } else {
    // Normal Fresh Start Title Text
    canvasContext.fillStyle = '#0f0';
    canvasContext.font = 'bold 48px monospace';
    canvasContext.fillText('Brick Breaker', canvas.width / 2, canvas.height / 2 - 40);
  }

  canvasContext.fillStyle = '#4CAF50'; // Green button
  canvasContext.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 10, 200, 50);

  canvasContext.fillStyle = '#fff';
  canvasContext.font = 'bold 16px monospace';
  canvasContext.fillText('Click to play', canvas.width / 2, canvas.height / 2 + 41);
  canvasContext.textAlign = 'left';
};

/**
 * Renders the active countdown text overlay in the center court window.
 */
const drawCountdown = (): void => {
  if (state.status !== GameStatus.starting || state.countdownNumber <= 0) return;

  canvasContext.fillStyle = '#ff00ff'; // Vibrant pink/magenta color for visibility
  canvasContext.font = 'bold 20px monospace';
  canvasContext.textAlign = 'center';
  canvasContext.fillText(`Game starts in ${state.countdownNumber}...`, canvas.width / 2, canvas.height / 2 + 30);
  // Revert back to standard alignment for other rendering actions
  canvasContext.textAlign = 'left';
};

const drawBricks = (): void => {
  for (let c = 0; c < state.bricks.length; c++) {
    for (let r = 0; r < state.bricks[c].length; r++) {
      const brick = state.bricks[c][r];
      if (brick.active) {
        if (r === 0) canvasContext.fillStyle = '#ff1744';
        else if (r === 1)
          canvasContext.fillStyle = '#ff9100'; // Orange
        else if (r === 2)
          canvasContext.fillStyle = '#ffea00'; // Yellow
        else canvasContext.fillStyle = '#00e676'; // Green bottom tier

        canvasContext.fillRect(brick.x, brick.y, brickConfiguration.width, brickConfiguration.height);
      }
    }
  }
};

const draw = (): void => {
  canvasContext.fillStyle = '#111';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawScoreBoard();
  drawBricks();

  // Draw paddle
  canvasContext.fillStyle = '#fff';
  canvasContext.fillRect(state.paddleX, state.paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);

  drawCountdown();
  drawStartScreen();
};

const updateLogic = (): void => {
  if (state.status !== GameStatus.started) return;

  state.ballX += state.ballSpeedX;
  state.ballY += state.ballSpeedY;

  if (state.ballX - BALL_RADIUS < 0 || state.ballX + BALL_RADIUS > canvas.width) {
    state.ballSpeedX = -state.ballSpeedX;
  }

  if (state.ballY - BALL_RADIUS < 0) {
    state.ballSpeedY = -state.ballSpeedY;
  }

  if (state.ballY + BALL_RADIUS > canvas.height) {
    state.lives--;

    if (state.lives <= 0) {
      state.status = stats.ended;
      return;
    }

    resetBallOnPaddle();
    startCountDown();
    return;
  }

  if (state.ballY + BALL_RADIUS >= state.paddleY - PADDLE_HEIGHT) {
    if (state.ballX >= state.paddleX && state.ballX <= state.paddleX + PADDLE_WIDTH) {
      state.ballSpeedY = -state.ballSpeedY;
      state.ballY = state.paddleY - PADDLE_HEIGHT - BALL_RADIUS;
      var deltaX = state.ballX - (state.paddleX + PADDLE_WIDTH / 2);
      state.ballSpeedX = deltaX * 0.35;
      return;
    }
  }

  let activeBricksLeft = false;

  for (let c = 0; c < state.bricks.length; c++) {
    for (let r = 0; r < state.bricks[c].length; r++) {
      const b = state.bricks[c][r];

      if (b.active) {
        activeBricksLeft = true;

        if (
          state.ballX + BALL_RADIUS >= b.x &&
          state.ballX - BALL_RADIUS <= b.x + brickConfiguration.width &&
          state.ballY + BALL_RADIUS >= b.y &&
          state.ballY - BALL_RADIUS <= b.y + brickConfiguration.height
        ) {
          b.active = false;
          state.score += 10;
          state.ballSpeedY = -state.ballSpeedY; // Deflect ball vertically
          return; // Break frame calculation cycle early on hit
        }
      }
    }
  }

  // Win condition trigger if all grid layers are broken
  if (!activeBricksLeft) {
    state.status = GameStatus.ended;
    return;
  }
};

const gameLoop = (): void => {
  updateLogic();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
};

/**
 * Game Controller
 */

const trachMousePosition = (event): void => {
  const rect = canvas.getBoundingClientRect();
  const root = document.documentElement;
  return {
    x: event.clientX - rect.left - root.scrollLeft,
    y: event.clientY - rect.top - root.scrollTop,
  };
};
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const handleMouseMove = (event: MouseEvent): void => {
  if (state.status !== GameStatus.started || !canvas) return;

  const mousePoistion = trachMousePosition(event);
  const targetX = mousePoistion.x - PADDLE_WIDTH / 2;

  const minLimit = 0;
  const maxLimit = canvas.width - PADDLE_WIDTH;

  state.paddleX = clamp(targetX, minLimit, maxLimit);
};

const handleCanvasClick = (event: MouseEvent): void => {
  if (state.status === GameStatus.starting || state.status === GameStatus.started) return;

  // If starting from scratch or resetting a Game Over screen
  if (state.status === GameStatus.notStart || state.status === GameStatus.ended) {
    state.score = 0;
    state.lives = 3;
    createBrickGrid();
    resetBallOnPaddle();
  }

  startCountDown();
};

export const hotUpdate = (oldState: GameState): void => {
  if (oldState) {
    state = oldState;
  }

  if (canvas) {
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('click', handleCanvasClick);
  }

  clearInterval(countdownIntervalId);
  cancelAnimationFrame(animationFrameId);

  init();
};

export const init = (): void => {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('click', handleCanvasClick);

  const dynamicGrid = calculateMaxGridDimensions(canvas, brickConfiguration);
  brickConfiguration.cols = dynamicGrid.cols;
  brickConfiguration.rows = dynamicGrid.rows;

  createBrickGrid();

  gameLoop();
};
