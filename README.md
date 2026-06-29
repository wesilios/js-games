# 🕹️ Web Games Collection

A repository dedicated to lightweight, state-driven browser games built with raw vanilla JavaScript, HTML5 Canvas, and
Vite.

---

## 📂 Project Structure

```text
.
├── README.md             # Multi-game collection guide
└── tennis/               # Game 1: Canvas Tennis Arcade
    ├── index.html        # Viewport layout & metadata
    ├── public/           # Static assets (hero.png, sponsor SVGs)
    └── src/
        ├── game.js       # Core physics, AI tracking, & collision logic
        ├── main.js       # Hot Module Replacement (HMR) state engine
        └── style.css     # Game styling & responsive layout
```

## Current Games

1. 🎾 Canvas Tennis (/tennis) A modern recreation of the arcade classic Pong.

- Features: 5-second match countdowns, edge-of-paddle angle deflection slices, victory screen checks at 3 points.
- Game Modes: `* VS COMPUTER`: Play solo against a tracking AI opponent.
  - `2 PLAYERS`: Local split-screen multiplayer sharing a single mouse workspace.

Details: [README](/tennis/README.md)

2. 🐍 Canvas Snake arcade (/snake) A grid-locked, retro arcade classic

- **Matrix Grid System:** Core logic maps coordinates out to a structured grid based on `tileCount` rules, preventing
  the game state from relying on floating-point canvas coordinates.
- **Self-Collision Array Tracking:** The snake's trailing tail is managed via a coordinate array. Moving into any active
  coordinate sector triggers a clean game-over state.
- **Counter-Movement Control Guards:** Keyboard listeners include guard logic that blocks immediate 180-degree
  turnarounds (e.g., trying to shift Left while actively crawling Right), preventing accidental self-eating.

Details: [README](/snake/README.md)

3. 🧱 Canvas Brick Breaker (/brick_breaker) A classic arcade breakout game

- **2D Matrix Brick Layouts:** Bricks are initialized into a nested column-and-row array matrix. Each block instance
  tracks its structural boundaries and visibility parameters: `{ x, y, width, height, active: true }`.
- **Axis-Aligned Bounding Box (AABB) Collisions:** The update routine runs collision passes against all active bricks.
  If an interception occurs, the ball isolates the closest collision axis to toggle the block off and invert the correct
  directional physics vectors.
- **Dynamic Paddle Surface Deflection:** Similar to the Canvas Tennis engine, bouncing the ball off the outer edges of
  the paddle platform shifts the horizontal velocity components, allowing players to slice shots at sharp angles across
  the screen grid.

Details: [README](/brick_breaker/README.md)

4. Tetris

The engine runs on a deterministic tick cycle divided into three distinct pipeline steps:

`[ User Input / Gravity ] ──> [Collision Verification ] ──> [ Grid Modification / Render ]`

1. Collision Verification Function (`hasCollision`): Before any movement or rotation is finalized on the state instance,
   the engine projects the new coordinates onto the 2D grid matrix. If any cell containing a 1 in the piece matrix
   overlaps with a 1 on the static board, or exceeds the `0 <= x < 10 or y < 20 bounds`, the movement is canceled.
2. Matrix Rotation Math: Rotation rotates the index rows of a square matrix clockwise:
   ```text
   Rotated[c][n - 1 - r] = Matrix[r][c]
   ```
3. Wall-Kicking: If a rotation occurs right next to a wall or a locked block, the collision logic kicks in. The engine
   attempts to adjust the position.x by stepping it left or right slightly to "kick" it into a valid vacant space rather
   than failing the rotation completely.

Details: [README](/tetris/README.md)

5. Space Shmup

Defend the outer orbital grid from a descending wave-based invader grid fleet.

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

Details: [README](/space_shmup/README.md)

## Adding New Games

To add a new game to this collection:

1. Create a new directory at the root level (e.g., /snake or /tetris).
2. Scaffold a fast vanilla setup running an older Vite build to support Node 18 environments:

```bash
npm create vite@5 . -- --template vanilla
```

3. Link your main state objects to preserve runtime states during codechanges!
