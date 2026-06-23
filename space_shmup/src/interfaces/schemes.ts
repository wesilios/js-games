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
  playerX: number;
  playerWidth: number;
  playerHeight: number;
  enemies: Enemy[];
  projectiles: Projectile[];
}

export interface Game {
  state: GameState;
  checkCollision: (rect1: Entity, rect2: Entity): boolean;
  enemyTypeLogic: (row: number): EnemyType; 
  enemyPointValue: (row: number): number;
  spawnEnemyFleet: (): void;
  init: (): void;
} 
