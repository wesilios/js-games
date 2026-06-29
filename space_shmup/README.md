# Space Shmup Game Requirements

## Basic Game RulesThe Playfield:

- A clean vertical scrolling layout running on a locked high-definition 2D viewport canvas.
- The Player Ship: Positioned at the lower baseline of the screen, restricted to horizontal left/right movement across
  the board.
- The Invader Grid Fleet: A multi-layered row array of hostile alien ships positioned at the top of the screen. The
  fleet slides collectively side-to-side; when the leading side touches a boundary margin, the entire row steps downward
  toward the player and reverses direction.
- Weapons System: \* The player can spawn fast, upward-moving vertical projectile elements by pressing the spacebar.
  - The enemy ships randomly trigger downward-moving plasma beams at varying interval steps.
- Collision Rules: \* Player Projectile -> Enemy Ship: Destroys the alien block, triggers a point reward, and clears the
  matching element out of the active rendering pool.
  - Enemy Projectile / Enemy Body $\rightarrow$ Player Ship: Triggers an immediate structural hull destruction life
    deduction event.
- Win/Loss Conditions:
  - Victory: Successfully neutralizing all enemy objects across the nested arrays.
  - Game Over: Remaining hull life pools reach zero, or the descending enemy grid positions slip below the player's
    firing threshold baseline.

```text
(0,0) ------------------------ CANVAS_WIDTH: 600px ------------------------
      |                                                                   |
      |   [ HUD telemetry: SCORE ]                         [ LIVES ]      |
      |                                                                   |
      |      +------+  +------+  +------+  +------+  +------+  +------+   |
      |      | Scout|  | Scout|  | Scout|  | Scout|  | Scout|  | Scout|   | <-- Row 0 (400 pts)
      |      +------+  +------+  +------+  +------+  +------+  +------+   |
      |      +------+  +------+  +------+  +------+  +------+  +------+   |
      |      |Bomber|  |Bomber|  |Bomber|  |Bomber|  |Bomber|  |Bomber|   | <-- Rows 1-2 (300 pts)
      |      +------+  +------+  +------+  +------+  +------+  +------+   |
      |                                                                   |
      |                                  ||                               |
      |                                  || <-- Player Projectile         |
      |                                  \/     (Velocity Y: -7)          |
      |                                                                   |
      |                                                                   |
      |                                                                   |
      |                     +-----------------------+                     |
      |                     |   Player Defense Ship |                     | <-- Baseline Array
      |                     +-----------------------+                     |
      |                                                                   |
(0,700) ------------------------------------------------------------------- (600,700)
```

## System Engineering Analysis

### State Blueprint & Data Schema

To keep this engine lightning fast and scalable, we will track the moving entities as discrete index blocks inside flat
arrays, utilizing coordinate points for precise standard rectangular boundary checks (AABB Collision Detection).

```typescript
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
  velocity: number; // FIXED: Typo corrected from 'velociy'
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
```

### Core Physics Loop Pipelines

Your update step logic will run on a multi-stage vector evaluation routine:

1.  Entity Translation Tick: For every execution loop, the engine iterates over the projectile pool, adjusting
    coordinate values ($Y_{next} = Y_{current} + \text{Velocity}$). If an item's position slips past the upper index
    boundary ($Y < 0$) or lower baseline, it is safely cleared out of memory to stop leaks.
2.  Axis-Aligned Bounding Box (AABB) Calculations: To determine if a laser intercepts an alien sprite hull, we compute
    standard dimensional overlaps:
    `Collision = (X_1 < X_2 + W_2) \land (X_1 + W_1 > X_2) \land (Y_1 < Y_2 + H_2) \land (Y_1 + H_1 > Y_2)$$`
3.  Fleet Kinematics Stepper: Instead of updating every alien entity individually, the engine determines the bounding
    edge of the entire alive collection. Once Max(Enemy.x) >= Canvas.width, the code triggers a macro fleet shift:

    ```typescript
    directionX *= -1;
    enemies.forEach((e) => (e.position.y += rowDropIncrement));
    ```
