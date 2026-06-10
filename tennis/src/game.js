/**
 * ============================================================================
 * GAME CONFIGURATION & STATE
 * ============================================================================
 */

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const SCORING_DELAY_MS = 1500; // 1.5-second pause after a goal
const WINNING_SCORE = 3;

export let state = {
  ballX: 400,
  ballY: 300,
  ballSpeedX: 5,
  ballSpeedY: 5,
  playerOne: {
    y: 250,
    score: 0,
  },
  playerTwo: {
    y: 250,
    score: 0,
  },
  // Game Flow States
  isGameStarted: false,
  isDelayActive: false,
  countdownNumber: 0,
  winner: null,
  isPlayerTwoAI: true,
};

let canvasContext;
let canvas;
let animationFrameId;
let countdownIntervalId;

/**
 * ============================================================================
 * GAME MECHANICS & LOGIC
 * ============================================================================
 */

/**
 * Triggers a 5-second ticking countdown before releasing the ball into play.
 */

const startCountDown = () => {
  state.isDelayActive = true;
  state.countdownNumber = 3;

  clearInterval(countdownIntervalId);

  countdownIntervalId = setInterval(() => {
    state.countdownNumber--;
    if (state.countdownNumber <= 0) {
      clearInterval(countdownIntervalId);
      state.isDelayActive = false;
    }
  }, 1000);
};

/**
 * Resets the ball to the center and pauses the game briefly before releasing it.
 */
const ballReset = () => {
  state.ballX = canvas.width / 2;
  state.ballY = canvas.height / 2;

  state.ballSpeedX = -state.ballSpeedX;

  if (state.playerOne.score >= WINNING_SCORE || state.playerTwo.score >= WINNING_SCORE) {
    // Assign the winner immediately so the logic loop handles the state transition cleanly
    state.winner = state.playerOne.score >= WINNING_SCORE ? 1 : 2;
    state.isGameStarted = false;
    return;
  }
  startCountDown();
};

/**
 * Simple tracking AI that moves Player Two's paddle toward the ball's vertical alignment.
 */
const runComputerAI = () => {
  if (!state.isPlayerTwoAI) return;

  const paddleCenterY = state.playerTwo.y + PADDLE_HEIGHT / 2;
  const aiSpeedLimit = 4.5;
  const deadZone = 15;

  if (state.ballY > paddleCenterY - deadZone) {
    state.playerTwo.y += aiSpeedLimit;
  } else if (state.ballY < paddleCenterY - deadZone) {
    state.playerTwo.y -= aiSpeedLimit;
  }

  if (state.playerTwo.y < 0) {
    state.playerTwo.y = 0;
  } else if (state.playerTwo.y > canvas.height - PADDLE_HEIGHT) {
    state.playerTwo.y = canvas.height - PADDLE_HEIGHT;
  }
};

/**
 * Executes the core game physics, collision tracking, and score updates.
 */
const updateLogic = () => {
  // Freeze ball physics if the game hasn't started or we are in a post-score delay
  if (!state.isGameStarted || state.isDelayActive) {
    return;
  }

  // Check for win condition
  if (state.playerOne.score >= WINNING_SCORE) {
    state.winner = 1;
    state.isGameStarted = false;
    return;
  }
  if (state.playerTwo.score >= WINNING_SCORE) {
    state.winner = 2;
    state.isGameStarted = false;
    return;
  }

  // Run the AI tracking movements before updating ball vectors
  runComputerAI();

  // Update ball position based on current velocity vectors
  state.ballX += state.ballSpeedX;
  state.ballY += state.ballSpeedY;

  // Ceiling and Floor collision tracking
  if (state.ballY - BALL_RADIUS < 0 || state.ballY + BALL_RADIUS > canvas.height) {
    state.ballSpeedY = -state.ballSpeedY;
  }

  // Left Boundary: Player One Paddle Collision & Scoring
  if (state.ballX - BALL_RADIUS <= PADDLE_WIDTH) {
    if (state.ballY >= state.playerOne.y && state.ballY <= state.playerOne.y + PADDLE_HEIGHT) {
      state.ballSpeedX = -state.ballSpeedX;
      state.ballX = PADDLE_WIDTH + BALL_RADIUS;

      var deltaY = state.ballY - (state.playerOne.y + PADDLE_HEIGHT / 2);
      state.ballSpeedY = deltaY * 0.35;
      return;
    }

    if (state.ballX < 0) {
      state.playerTwo.score += 1;
      ballReset();
    }
  }

  // Right Boundary: Player Two Paddle Collision & Scoring
  if (state.ballX + BALL_RADIUS >= canvas.width - PADDLE_WIDTH) {
    if (state.ballY >= state.playerTwo.y && state.ballY <= state.playerTwo.y + PADDLE_HEIGHT) {
      state.ballSpeedX = -state.ballSpeedX;
      state.ballX = canvas.width - PADDLE_WIDTH - BALL_RADIUS;
      var deltaY = state.ballY - (state.playerTwo.y + PADDLE_HEIGHT / 2);
      state.ballSpeedY = deltaY * 0.35;
      return;
    }

    if (state.ballX > canvas.width) {
      state.playerOne.score += 1;
      ballReset();
    }
  }
};

/**
 * ============================================================================
 * RENDERING ENGINE (CANVAS 2D)
 * ============================================================================
 */

const drawPaddle = (x, y) => {
  canvasContext.fillStyle = '#fff';
  canvasContext.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
};

const drawNet = () => {
  canvasContext.strokeStyle = '#fff';
  canvasContext.setLineDash([10, 10]);
  canvasContext.beginPath();
  canvasContext.moveTo(canvas.width / 2, 0);
  canvasContext.lineTo(canvas.width / 2, canvas.height);
  canvasContext.stroke();
};

const drawBall = () => {
  // Only draw the ball if the game has explicitly begun
  if (!state.isGameStarted) return;

  canvasContext.fillStyle = '#0f0';
  canvasContext.beginPath();
  canvasContext.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2, false);
  canvasContext.fill();
};

const drawScore = () => {
  canvasContext.fillStyle = '#fff';
  canvasContext.font = '18px monospace';
  canvasContext.fillText(`${state.playerOne.score}`, canvas.width / 4, 50);
  canvasContext.fillText(`${state.playerTwo.score}`, canvas.width / 2 + canvas.width / 4, 50);
};

/**
 * Renders the Start Overlay text and button box on the center screen.
 */
const drawStartScreen = () => {
  if (state.isGameStarted) return;

  // Dim the background background slightly
  canvasContext.fillStyle = 'rgba(0, 0, 0, 0.75)';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  canvasContext.textAlign = 'center';

  if (state.winner !== null) {
    // Game Over / Winning Screen Header
    canvasContext.fillStyle = '#ff00ff';
    canvasContext.font = 'bold 48px monospace';
    canvasContext.fillText(
      `PLAYER ${state.winner === 1 ? 'ONE' : 'TWO'} WINS!`,
      canvas.width / 2,
      canvas.height / 2 - 60
    );

    canvasContext.fillStyle = '#fff';
    canvasContext.font = '18px monospace';
    canvasContext.fillText('Final Score match completed', canvas.width / 2, canvas.height / 2 - 20);
  } else {
    // Normal Fresh Start Title Text
    canvasContext.fillStyle = '#0f0';
    canvasContext.font = 'bold 48px monospace';
    canvasContext.fillText('CANVAS TENNIS', canvas.width / 2, canvas.height / 2 - 60);
  }

  // --- BUTTON 1: VS COMPUTER (LEFT SIDE) ---
  canvasContext.fillStyle = '#4CAF50'; // Green button
  canvasContext.fillRect(canvas.width / 2 - 210, canvas.height / 2 + 10, 200, 50);

  canvasContext.fillStyle = '#fff';
  canvasContext.font = 'bold 16px monospace';
  canvasContext.fillText('VS COMPUTER', canvas.width / 2 - 110, canvas.height / 2 + 41);

  // --- BUTTON 2: 2 PLAYERS (RIGHT SIDE) ---
  canvasContext.fillStyle = '#008CBA'; // Blue button
  canvasContext.fillRect(canvas.width / 2 + 10, canvas.height / 2 + 10, 200, 50);

  canvasContext.fillStyle = '#fff';
  canvasContext.font = 'bold 16px monospace';
  canvasContext.fillText('2 PLAYERS', canvas.width / 2 + 110, canvas.height / 2 + 41);

  canvasContext.textAlign = 'left';
};

/**
 * Renders the active countdown text overlay in the center court window.
 */
const drawCountdown = () => {
  if (!state.isDelayActive || state.countdownNumber <= 0) return;

  canvasContext.fillStyle = '#ff00ff'; // Vibrant pink/magenta color for visibility
  canvasContext.font = 'bold 20px monospace';
  canvasContext.textAlign = 'center';
  canvasContext.fillText(`Game starts in ${state.countdownNumber}...`, canvas.width / 2, canvas.height / 2 + 30);

  // Revert back to standard alignment for other rendering actions
  canvasContext.fillStyle = '#0f0';
  canvasContext.textAlign = 'left';
  canvasContext.textAlign = 'center';
  canvasContext.font = 'bold 12px monospace';
  canvasContext.fillText(`Hit ${WINNING_SCORE} point(s) to win`, canvas.width / 2, canvas.height / 2 + 50);

  // Revert back to standard alignment for other rendering actions
  canvasContext.textAlign = 'left';
};

const draw = () => {
  // Clear the active canvas buffer viewport
  canvasContext.fillStyle = '#111';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  drawNet();
  drawBall();
  drawPaddle(0, state.playerOne.y);
  drawPaddle(canvas.width - PADDLE_WIDTH, state.playerTwo.y);
  drawScore();
  drawCountdown();
  drawStartScreen(); // Overlay renders on top of the court layout
};

const gameLoop = () => {
  updateLogic();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
};

/**
 * ============================================================================
 * INPUT CONTROLS & EVENT HANDLERS
 * ============================================================================
 */

const trackMousePosition = (event) => {
  const rect = canvas.getBoundingClientRect();
  const root = document.documentElement;

  return {
    x: event.clientX - rect.left - root.scrollLeft,
    y: event.clientY - rect.top - root.scrollTop,
  };
};

/**
 * Constrains a number between a minimum and maximum boundary limit.
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const handleMouseMove = (event) => {
  const mousePosition = trackMousePosition(event);
  // Calculate the raw desired position centering the paddle on the cursor
  const targetY = mousePosition.y - PADDLE_HEIGHT / 2;

  // Define the safe bounds to prevent the paddle drawing outside the canvas viewport
  const minLimit = 0;
  const maxLimit = canvas.height - PADDLE_HEIGHT;

  if (state.isPlayerTwoAI) {
    // VS Computer Mode: Mouse moves the left paddle anywhere on screen safely
    state.playerOne.y = clamp(targetY, minLimit, maxLimit);
    return;
  }
  // 2-Player Local Multiplayer Mode: Split-screen bounding logic
  if (mousePosition.x < canvas.width / 2) {
    state.playerOne.y = clamp(targetY, minLimit, maxLimit);
    return;
  }
  state.playerTwo.y = clamp(targetY, minLimit, maxLimit);
};

/**
 * Monitors UI clicks to detect if the user clicked inside the Start Button bounding box.
 */
const handleCanvasClick = (event) => {
  if (state.isGameStarted) return;

  const mousePosition = trackMousePosition(event);

  // Shared button layout dimensions
  const btnY = canvas.height / 2 + 10;
  const btnWidth = 200;
  const btnHeight = 50;

  // Exact boundaries for both buttons
  const aiBtnX = canvas.width / 2 - 210;
  const p2BtnX = canvas.width / 2 + 10;

  // 1. Check Click inside "VS COMPUTER" Button
  if (
    mousePosition.x >= aiBtnX &&
    mousePosition.x <= aiBtnX + btnWidth &&
    mousePosition.y >= btnY &&
    mousePosition.y <= btnY + btnHeight
  ) {
    if (state.winner !== null) resetMatchState();

    state.isPlayerTwoAI = true; // Lock in AI mode
    state.isGameStarted = true;
    startCountDown();
    return;
  }

  // 2. Check Click inside "2 PLAYERS" Button
  if (
    mousePosition.x >= p2BtnX &&
    mousePosition.x <= p2BtnX + btnWidth &&
    mousePosition.y >= btnY &&
    mousePosition.y <= btnY + btnHeight
  ) {
    if (state.winner !== null) resetMatchState();

    state.isPlayerTwoAI = false; // Lock out AI mode completely
    state.isGameStarted = true;
    startCountDown();
    return;
  }
};

/**
 * Clean helper function to wipe scores when transitioning out of a victory overlay.
 */
const resetMatchState = () => {
  state.playerOne.score = 0;
  state.playerTwo.score = 0;
  state.winner = null;

  state.ballX = canvas.width / 2;
  state.ballY = canvas.height / 2;
  state.ballSpeedY = 5;
};

/**
 * ============================================================================
 * VITE HOT MODULE REPLACEMENT (HMR) & LIFE CYCLE
 * ============================================================================
 */

export const hotUpdate = (oldState) => {
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

export const init = () => {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('click', handleCanvasClick);

  gameLoop();
};
