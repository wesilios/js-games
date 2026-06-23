import { describe, it, expect, beforeEach } from 'vitest';
import { game, ENEMY_ROW_COUNT, ENEMY_COL_COUNT, ENEMY_WIDTH, ENEMY_HEIGHT } from './game';
import { EnemyType } from './interfaces/schemes';

describe('Space Shmup Logic Suites', () => {
  beforeEach(() => {
    game.state.score = 0;
    game.state.lives = 3;
    game.state.enemies = [];
    game.state.projectiles = [];
    game.state.isGameOver = false;
  });

  it('enemyTypeLogic() should assign Scout type to row 0', () => {
    expect(game.enemyTypeLogic(0)).toBe(EnemyType.Scout);
  });

  it('enemyTypeLogic() should assign Bomber type to rows 1 and 2', () => {
    expect(game.enemyTypeLogic(1)).toBe(EnemyType.Bomber);
    expect(game.enemyTypeLogic(2)).toBe(EnemyType.Bomber);
  });

  it('enemyTypeLogic() should assign Command type to rows higher than 2', () => {
    expect(game.enemyTypeLogic(3)).toBe(EnemyType.Command);
  });

  it('enemyPointValue() should scale points exponentially based on high rows', () => {
    expect(game.enemyPointValue(0)).toBe(400);
    expect(game.enemyPointValue(1)).toBe(300);
    expect(game.enemyPointValue(3)).toBe(100);
  });

  const entityA = { position: { x: 10, y: 10 }, width: ENEMY_WIDTH, height: ENEMY_HEIGHT, active: true };
  it('checkCollision() should return true when entities structurally overlap', () => {
    const entityB = { position: { x: 20, y: 20 }, width: ENEMY_WIDTH, height: ENEMY_HEIGHT, active: true };
    const entityC = { position: { x: 10, y: 25 }, width: 20, height: 90, active: true };

    expect(game.checkCollision(entityA, entityB)).toBe(true);
    expect(game.checkCollision(entityA, entityC)).toBe(true);
  });

  it('checkCollision() should return false when entities are completely separate', () => {
    const entityA = { position: { x: 10, y: 10 }, width: 20, height: 20, active: true };
    const entityB = { position: { x: 50, y: 50 }, width: 20, height: 20, active: true };

    expect(game.checkCollision(entityA, entityB)).toBe(false);
  });

  it('should populate the game state with a perfect fleet grid arrangement', () => {
    game.spawnEnemyFleet();
    const expectedTotalEnemies = ENEMY_ROW_COUNT * ENEMY_COL_COUNT;
    expect(game.state.enemies.length).toBe(expectedTotalEnemies);
  });

  it('should guarantee that all spawned entites are set to active', () => {
    game.spawnEnemyFleet();
    const allActive = game.state.enemies.every((enemy) => enemy.active === true);
    expect(allActive).toBe(true);
  });

  it("should guarantee that all enemy's types are spawned", () => {
    game.spawnEnemyFleet();
    const hasScout = game.state.enemies.some((enemy) => enemy.type === EnemyType.Scout);
    const hasBomber = game.state.enemies.some((enemy) => enemy.type === EnemyType.Bomber);
    const hasCommand = game.state.enemies.some((enemy) => enemy.type === EnemyType.Command);

    expect(hasScout).toBe(true);
    expect(hasBomber).toBe(true);
    expect(hasCommand).toBe(true);
  });
});
