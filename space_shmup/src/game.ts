import { Entity, Player, Enemy, EnemyType, Game, GameState, Projectile, Coordinate } from './interfaces/schemes';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SPEED,
  PROJECTILE_SPEED,
  ENEMY_ROW_COUNT,
  ENEMY_COL_COUNT,
  ENEMY_WIDTH,
  ENEMY_HEIGHT,
} from './constant';
import * as helper from './helper';

export const keysPressed: Record<string, boolean> = {};

export let game: Game = {
  state: {
    score: 0,
    lives: 3,
    isGameOver: false,
    isGameStarted: false,
    player: {
      position: {
        x: CANVAS_WIDTH / 2 - 25,
        y: CANVAS_HEIGHT - 30 - 10,
      } as Coordinate,
      width: 50,
      height: 30,
      active: true,
    } as Player,
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
  } as GameState,
  enemyDirectionX: 1,
  enemyDirectionY: 1.5,
  enemySpeedX: 1,
  enemyDropY: 15,
  canvas: null as HTMLCanvasElement | null,
  canvasContext: null as CanvasRenderingContext2D | null,
  animationFrameId: null as any | null,

  checkCollision(rect1: Entity, rect2: Entity): boolean {
    return (
      rect1.position.x < rect2.position.x + rect2.width &&
      rect1.position.x + rect1.width > rect2.position.x &&
      rect1.position.y < rect2.position.y + rect2.height &&
      rect1.position.y + rect1.height > rect2.position.y
    );
  },
  enemyTypeLogic(row: number): EnemyType {
    return row === 0 ? EnemyType.Scout : row < 3 ? EnemyType.Bomber : EnemyType.Command;
  },
  enemyPointValue(row: number): number {
    return (4 - row) * 100;
  },
  spawnEnemyFleet(): void {
    this.state.enemies = [];
    for (let r = 0; r < ENEMY_ROW_COUNT; r++) {
      for (let c = 0; c < ENEMY_COL_COUNT; c++) {
        this.state.enemies.push({
          position: { x: c * 60 + 50, y: r * 50 + 60 },
          width: ENEMY_WIDTH,
          height: ENEMY_HEIGHT,
          type: this.enemyTypeLogic(r),
          pointsValue: this.enemyPointValue(r),
          active: true,
        });
      }
    }
  },
  firePlayerLaser(): void {
    const activePlayerLasers = this.state.projectiles.filter((projectile: Projectile) => projectile.velocity < 0);

    if (activePlayerLasers.length >= 3) return;

    this.state.projectiles.push({
      position: {
        x: this.state.player.position.x + this.state.player.width / 2 - -2,
        y: CANVAS_HEIGHT - this.state.player.height - 10,
      },
      width: 4,
      height: 15,
      velocity: -PROJECTILE_SPEED,
      active: true,
    });
  },
  updatePhysics(): void {
    if (!this.state.isGameStarted || this.state.isGameOver) return;

    if (keysPressed['ArrowLeft'] || keysPressed['a']) {
      this.state.player.position.x = Math.max(0, this.state.player.position.x - PLAYER_SPEED);
    }

    if (keysPressed['ArrowRight'] || keysPressed['d']) {
      this.state.player.position.x = Math.min(
        CANVAS_WIDTH - this.state.player.width,
        this.state.player.position.x + PLAYER_SPEED
      );
    }

    this.state.projectiles.forEach((projectile: Projectile) => {
      projectile.position.y += projectile.velocity;
      if (projectile.position.y < 0 || projectile.position.y > CANVAS_HEIGHT) projectile.active = false;
    });
    this.state.projectiles = this.state.projectiles.filter((projectile: Projectile) => projectile.active);

    // 3. Translate Fleet Kinematics & Check Screen Margins
    let changeDirection = false;
    this.state.enemies.forEach((enemy: Enemy) => {
      enemy.position.x += this.enemySpeedX * this.enemyDirectionX;

      // Check if any alive alien touches left/right bounding box edges
      if (enemy.position.x <= 0 || enemy.position.x + enemy.width >= CANVAS_WIDTH) {
        changeDirection = true;
      }
    });

    if (changeDirection) {
      this.enemyDirectionX *= -1;
      this.state.enemies.forEach((enemy: Enemy) => {
        enemy.position.y += this.enemyDropY;
        // Game Over Condition: Fleet breaks through defensive line baseline
        if (enemy.position.y + enemy.height >= CANVAS_HEIGHT - this.state.player.height - 20) {
          this.state.isGameOver = true;
        }
      });
    }

    // 4. Resolve Overlap Matrix Hits (AABB Resolution)
    for (let projectile of this.state.projectiles) {
      if (!projectile.active || projectile.velocity > 0) continue; // Skip enemy lasers for this pass

      for (let enemy of this.state.enemies) {
        if (!enemy.active) continue;

        if (this.checkCollision(projectile, enemy)) {
          projectile.active = false;
          enemy.active = false;
          this.state.score += enemy.pointsValue;
          break; // Projectile spent, move to next
        }
      }
    }

    // Clean out dead enemies from state arrays
    this.state.enemies = this.state.enemies.filter((enemy: Enemy) => enemy.active);

    // Victory Check: Fleet eliminated completely
    if (this.state.isGameStarted && this.state.enemies.length === 0) {
      this.spawnEnemyFleet(); // Advance to next round wave
      this.enemySpeedX += 0.5; // Scale difficulty scaling acceleration
    }
  },
  render(): void {
    if (!this.canvasContext) return;
    // Clear screen canvas context elements
    this.canvasContext.fillStyle = '#050508';
    this.canvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.canvasContext.fillStyle = '#ffffff';
    this.canvasContext.font = 'bold 14px monospace';

    this.canvasContext.fillText(`Score: ${this.state.score}`, (CANVAS_WIDTH * 12) / 100, 25);
    this.canvasContext.fillText(`Lives: ${this.state.lives}`, (CANVAS_WIDTH * 88) / 100, 25);

    // Draw Player Ship Unit
    this.canvasContext.fillStyle = '#39ff14'; // Neon Green
    helper.renderRect(this.state.player, this.canvasContext);

    // Draw Enemy Fleet Cells
    this.state.enemies.forEach((enemy: Enemy) => {
      switch (enemy.type) {
        case EnemyType.Command:
          this.canvasContext!.fillStyle = '#00f0f0'; // Cyan
          break;
        case EnemyType.Bomber:
          this.canvasContext!.fillStyle = '#ff9800'; // Orange
          break;
        default:
          this.canvasContext!.fillStyle = '#ff5500'; // Red
          break;
      }

      helper.renderRect(enemy, this.canvasContext);
    });

    // Draw Laser Objects
    this.canvasContext.fillStyle = '#ffff00'; // Bright Yellow Laser beams
    this.state.projectiles.forEach((projectile: Projectile) => {
      helper.renderRect(projectile, this.canvasContext);
    });

    // Handle Overlay Screens
    if (!this.state.isGameStarted) {
      helper.drawScreenOverlay('PRESS ANY ARROW KEY TO START DEFENSE', '#00f0f0', this.canvasContext);
      return;
    }

    if (this.state.isGameOver) {
      helper.drawScreenOverlay('GAME OVER - SPACEBAR TO RESTART', '#ff0000', this.canvasContext);
    }
  },
  gameLoop(time: number): void {
    this.updatePhysics();
    this.render();

    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  },
  handleKeyDown(event: KeyboardEvent): void {
    // 1. Trap scrolling defaults
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) {
      event.preventDefault();
    }

    if (this.state.isGameOver && event.key === ' ') {
      this.resetFullGameSession();
      return;
    }

    // Start game on first intentional directional keystroke
    if (!this.state.isGameStarted && ['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(event.key)) {
      this.state.isGameStarted = true;
    }

    keysPressed[event.key] = true;

    if (event.key === ' ' || event.key === 'Spacebar') {
      this.firePlayerLaser();
    }
  },

  handleKeyUp(event: KeyboardEvent): void {
    keysPressed[event.key] = false;
  },

  resetFullGameSession(): void {
    this.state.score = 0;
    this.state.lives = 3;
    this.state.isGameOver = false;
    this.state.isGameStarted = false;
    this.state.player.position.x = CANVAS_WIDTH / 2 - 25;
    this.state.projectiles = [];
    this.enemySpeedX = 1.5;
    this.spawnEnemyFleet();
  },
  hotUpdate(oldState: GameState): void {
    if (oldState) {
      this.state = oldState;
    }

    window.removeEventListener('keydown', (event: KeyboardEvent) => this.handleKeyDown(event));
    window.removeEventListener('keyup', (event: KeyboardEvent) => this.handleKeyUp(event));

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.init();
  },
  init(): void {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!this.canvas) return;

    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.canvasContext = this.canvas.getContext('2d');

    window.addEventListener('keydown', (event: KeyboardEvent) => this.handleKeyDown(event));
    window.addEventListener('keyup', (event: KeyboardEvent) => this.handleKeyUp(event));

    if (this.state.enemies.length === 0) this.spawnEnemyFleet();
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  },
};
