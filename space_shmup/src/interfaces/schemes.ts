export interface Coordinate {
  x: number;
  y: number;
}

export interface Entity {
  position: Coordinate;
  width: number;
  height: number;
  active: boolean;
}

export interface Player extends Entity {}

export interface Projectile extends Entity {
  velocity: number;
}

export enum EnemyType {
  Scout = 0,
  Bomber = 1,
  Command = 2,
}

export interface Enemy extends Entity {
  type: EnemyType;
  pointsValue: number;
}

export interface GameState {
  score: number;
  lives: number;
  isGameOver: boolean;
  isGameStarted: boolean;
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
}

export interface Game {
  state: GameState;
  enemyDirectionX: number;
  enemyDirectionY: number;
  enemySpeedX: number;
  enemyDropY: 15;
  canvas: HTMLCanvasElement | null;
  canvasContext: CanvasRenderingContext2D | null;
  animationFrameId: any | null;

  firePlayerLaser(): void;
  updatePhysics(): void;
  render(): void;
  gameLoop(time: number): void;
  checkCollision(rect1: Entity, rect2: Entity): boolean;
  enemyTypeLogic(row: number): EnemyType;
  enemyPointValue(row: number): number;
  spawnEnemyFleet(): void;
  handleKeyDown(event: KeyboardEvent): void;
  handleKeyUp(event: KeyboardEvent): void;
  resetFullGameSession(): void;
  hotUpdate(oldState: GameState): void;
  init(): void;
}
