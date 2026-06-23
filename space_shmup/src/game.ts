import { Entity, Enemy, EnemyType, GameState, Projectile, Coordinate } from './interfaces/schemes';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 700;

const PLAYER_SPEED = 6;
const PROJECTILE_SPEED = 8;
export const ENEMY_ROW_COUNT = 4;
export const ENEMY_COL_COUNT = 8;

export const ENEMY_WIDTH = 40;
export const ENEMY_HEIGHT = 30;

let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let animationFrameId: any;
let lastTime: number = 0;

// Fleet horizontal direction tracker: 1 means right, -1 means left
let enemyDirectionX = 1;
let enemySpeedX = 1;

export let game: Game = {
  state: {
    score: 0,
    lives: 3,
    isGameOver: false,
    isGameStarted: false,
    playerX: CANVAS_WIDTH / 2 - 25,
    playerWidth: 50,
    playerHeight: 30,
    enemies: [],
    projectiles: [],
  },
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
          pointValue: this.enemyPointValue(r),
          active: true,
        });
      }
    }
  },
  draw(): void {},
  gameLoop(): void {},
  hotUpdate(oldState: GameState): void {
    if (oldState) {
      this.state = oldState;
    }
  },
  init(): void {
    this.spawnEnemyFleet();
    this.gameLoop();
  },
};
