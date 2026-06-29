import { describe, it, expect, beforeEach, vi } from 'vitest';
import { game, keysPressed } from './game';
import { EnemyType } from './interfaces/schemes';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SPEED,
  PROJECTILE_SPEED,
  ENEMY_ROW_COUNT,
  ENEMY_COL_COUNT,
} from './constant';
import * as helper from './helper';

// Spy on rendering helper functions to prevent runtime DOM errors
vi.mock('./helper', () => ({
  renderRect: vi.fn(),
  drawScreenOverlay: vi.fn(),
}));

describe('Space Shmup Complete Core Engine Suite', () => {
  beforeEach(() => {
    // Reset state configuration metrics cleanly to baseline defaults before every pass
    game.state.score = 0;
    game.state.lives = 3;
    game.state.isGameOver = false;
    game.state.isGameStarted = false;
    game.state.player.position.x = CANVAS_WIDTH / 2 - 25;
    game.state.player.position.y = CANVAS_HEIGHT - 30 - 10;
    game.state.player.active = true;
    game.state.enemies = [];
    game.state.projectiles = [];
    game.enemySpeedX = 1;
    game.enemyDirectionX = 1;

    // Clear tracking map inputs keys
    Object.keys(keysPressed).forEach((key) => delete keysPressed[key]);
    vi.clearAllMocks();
  });

  // ============================================================================
  // PURE LOGIC METRIC MATRIX TESTS
  // ============================================================================
  describe('Static Lookups & Pure Mechanics Logic', () => {
    it('should evaluate AABB intersections correctly across footprints', () => {
      const rect1 = { position: { x: 10, y: 10 }, width: 20, height: 20, active: true };
      const rect2 = { position: { x: 25, y: 25 }, width: 20, height: 20, active: true };
      const rect3 = { position: { x: 100, y: 100 }, width: 20, height: 20, active: true };

      expect(game.checkCollision(rect1, rect2)).toBe(true);
      expect(game.checkCollision(rect1, rect3)).toBe(false);
    });

    it('should accurately resolve score weight distributions per row', () => {
      expect(game.enemyPointValue(0)).toBe(400);
      expect(game.enemyPointValue(1)).toBe(300);
      expect(game.enemyPointValue(3)).toBe(100);
    });

    it('should assign correct variant types to grid index ranks', () => {
      expect(game.enemyTypeLogic(0)).toBe(EnemyType.Scout);
      expect(game.enemyTypeLogic(2)).toBe(EnemyType.Bomber);
      expect(game.enemyTypeLogic(3)).toBe(EnemyType.Command);
    });
  });

  // ============================================================================
  // GRID SPATIALLY BALANCED GENERATION TESTS
  // ============================================================================
  describe('Fleet Grid Spawning Mechanics', () => {
    it('should build a perfect row-column matrix array block layout', () => {
      game.spawnEnemyFleet();
      const expectedTotal = ENEMY_ROW_COUNT * ENEMY_COL_COUNT;

      expect(game.state.enemies.length).toBe(expectedTotal);
      expect(game.state.enemies[0].position.x).toBe(50);
      expect(game.state.enemies[0].position.y).toBe(60);
    });
  });

  // ============================================================================
  // WEAPONS SYSTEM SYSTEM OPERATION TESTS
  // ============================================================================
  describe('Player Offensive Fire Array', () => {
    it('should spawn a tracking laser vector centered above player node', () => {
      game.state.isGameStarted = true;
      game.firePlayerLaser();

      expect(game.state.projectiles.length).toBe(1);

      const laser = game.state.projectiles[0];
      expect(laser.velocity).toBe(-PROJECTILE_SPEED);
      expect(laser.active).toBe(true);
    });

    it('should enforce ammo limit thresholds to block weapon spamming', () => {
      game.state.isGameStarted = true;

      // Attempt to fire 5 lasers in rapid succession
      game.firePlayerLaser();
      game.firePlayerLaser();
      game.firePlayerLaser();
      game.firePlayerLaser();
      game.firePlayerLaser();

      expect(game.state.projectiles.length).toBe(3); // Hard-capped throttled line
    });
  });

  // ============================================================================
  // PHYSICS KINEMATICS & COLLISION DYNAMICS
  // ============================================================================
  describe('Core Physics Translators', () => {
    it('should stay idle if game flag indicators are marked inactive', () => {
      game.state.isGameStarted = false;
      keysPressed['ArrowLeft'] = true;

      game.updatePhysics();
      expect(game.state.player.position.x).toBe(CANVAS_WIDTH / 2 - 25);
    });

    it('should step player left position tracking bounded by edge constraints', () => {
      game.state.isGameStarted = true;
      keysPressed['ArrowLeft'] = true;

      game.updatePhysics();
      expect(game.state.player.position.x).toBe(CANVAS_WIDTH / 2 - 25 - PLAYER_SPEED);

      // Force boundary clip override to test edge constraint clamping
      game.state.player.position.x = 2;
      game.updatePhysics();
      expect(game.state.player.position.x).toBe(0);
    });

    it('should step player right position tracking bounded by edge constraints', () => {
      game.state.isGameStarted = true;
      keysPressed['d'] = true;

      game.updatePhysics();
      expect(game.state.player.position.x).toBe(CANVAS_WIDTH / 2 - 25 + PLAYER_SPEED);
    });

    it('should drop fleet down and invert path headings upon hitting frame margins', () => {
      game.state.isGameStarted = true;
      game.state.enemies.push({
        position: { x: CANVAS_WIDTH - 20, y: 100 },
        width: 40,
        height: 30,
        type: EnemyType.Scout,
        pointsValue: 100,
        active: true,
      });

      game.updatePhysics();

      expect(game.enemyDirectionX).toBe(-1); // Heading vector flipped
      expect(game.state.enemies[0].position.y).toBe(100 + game.enemyDropY); // Dropped down
    });

    it('should compute intersection impacts, adjust metrics, and sweep spent arrays', () => {
      game.state.isGameStarted = false;
      game.state.isGameOver = false;

      game.state.enemies.push({
        position: { x: 100, y: 100 },
        width: 40,
        height: 30,
        type: EnemyType.Scout,
        pointsValue: 400,
        active: true,
      });
      game.state.projectiles.push({
        position: { x: 110, y: 105 },
        width: 4,
        height: 15,
        velocity: -PROJECTILE_SPEED,
        active: true,
      });

      game.state.isGameStarted = true;
      game.updatePhysics();

      game.state.isGameStarted = true;

      expect(game.state.score).toBe(400);
      expect(game.state.projectiles.length).toBe(1);
      expect(game.state.enemies.length).toBe(32);
    });

    it('should flag a Game Over state if invaders penetrate defensive margins', () => {
      game.state.isGameStarted = true;
      game.state.enemies.push({
        position: { x: CANVAS_WIDTH - 10, y: CANVAS_HEIGHT - 60 },
        width: 40,
        height: 30,
        type: EnemyType.Scout,
        pointsValue: 100,
        active: true,
      });

      game.updatePhysics();
      expect(game.state.isGameOver).toBe(true);
    });
  });

  // ============================================================================
  // PRESENTATION PIPELINES & USER INPUT
  // ============================================================================
  describe('UI Presenter & User Inputs Lifecycle', () => {
    it('should prevent rendering passes if canvas drawing contexts are missing', () => {
      game.canvasContext = null;
      expect(() => game.render()).not.toThrow();
    });

    it('should call rendering operations when canvas elements are assigned', () => {
      const mockCtx = {
        fillStyle: '',
        font: '',
        fillRect: vi.fn(),
        fillText: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      game.canvasContext = mockCtx;
      game.state.isGameStarted = true;
      game.state.enemies.push({ position: { x: 1, y: 1 }, width: 1, height: 1, type: 1, pointsValue: 1, active: true });

      game.render();

      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
      expect(helper.renderRect).toHaveBeenCalled();
    });

    it('should start game states cleanly upon first valid movement input stroke', () => {
      const mockEvent = { key: 'ArrowRight', preventDefault: vi.fn() } as unknown as KeyboardEvent;

      game.handleKeyDown(mockEvent);

      expect(game.state.isGameStarted).toBe(true);
      expect(keysPressed['ArrowRight']).toBe(true);
    });

    it('should flush configurations completely down to initial settings on reboot', () => {
      game.state.score = 5000;
      game.state.isGameOver = true;

      game.resetFullGameSession();

      expect(game.state.score).toBe(0);
      expect(game.state.isGameOver).toBe(false);
      expect(game.state.enemies.length).toBe(ENEMY_ROW_COUNT * ENEMY_COL_COUNT);
    });
  });
});
