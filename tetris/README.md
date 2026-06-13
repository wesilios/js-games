# etris Game Requirements

## 1. Basic Game Rules

- The Playfield: The game is played on a vertical grid consisting of 10 columns and 20 rows, initially empty.
- The Tetrominoes: Seven distinct geometric shapes (I, J, L, O, S, T, Z), each composed of 4 square blocks, fall from
  the top of the playfield one at a time.
- Movement & Controls:
  - Left/Right: Move the falling piece horizontally by one grid column.
  - Down (Soft Drop): Accelerate the piece downward to position it faster.
  - Up (Rotation): Rotate the piece 90 degrees clockwise.
  - Gravity: The piece automatically moves down by one row at a fixed time interval (e.g., every 1 second).
- Locking & Line Clears: When a piece touches the floor or sits on top of another locked block, it fixes in place
  permanently. If an entire horizontal row is completely filled with blocks, that row is destroyed, and all blocks above
  it shift down by one row.
- Game Over: If a newly spawned piece collides with a locked block immediately at the top of the board, or if blocks
  stack past the upper ceiling grid boundary, the game ends.

## 2. State & Data Structures

To handle this cleanly in TypeScript, the engine breaks down the game data into explicit, decoupled interfaces:

### The Grid Matrix

The 10x20 field is represented as a 2D matrix (array of arrays). A value of 0 represents an empty tile space, while a
value of 1 (or a color string code) represents a locked static block.

```javascript
type Matrix = number[][]; // ROWS x COLS
```

Piece Vector MappingAn active piece needs to track its shape geometry, its current position relative to the grid origin
(top-left 0,0), and its rendering color theme.

```javascript
interface Piece {
  matrix: Matrix;      // The current rotation layout matrix (e.g., 2x2, 3x3, or 4x4)
  position: Coordinate; // Structural coordinate { x, y } mapping top-left anchor point
  color: string;       // Hex or RGB color value
}
```

## 3. Core Engine Workflow

The engine runs on a deterministic tick cycle divided into three distinct pipeline steps:

`[ User Input / Gravity ] ──> [Collision Verification ] ──> [ Grid Modification / Render ]`

1. Collision Verification Function (hasCollision): Before any movement or rotation is finalized on the state instance,
   the engine projects the new coordinates onto the 2D grid matrix. If any cell containing a 1 in the piece matrix
   overlaps with a 1 on the static board, or exceeds the 0 <= x < 10 or y < 20 bounds, the movement is canceled.
2. Matrix Rotation Math: Rotation rotates the index rows of a square matrix clockwise:
   `$$\text{Rotated}[c][n - 1 - r] = \text{Matrix}[r][c]$$`
3. Wall-Kicking: If a rotation occurs right next to a wall or a locked block, the collision logic kicks in. The engine
   attempts to adjust the position.x by stepping it left or right slightly to "kick" it into a valid vacant space rather
   than failing the rotation completely.

## 4. Scoring Tiers

Line clears award points exponentially to reward players for riskier setups (clearing multiple rows simultaneously).

| Lines Cleared   | Multiplier / Base Score |
| --------------- | ----------------------- |
| 1 Row           | 100 points              |
| 2 Rows          | 300 points              |
| 3 Rows          | 500 points              |
| 4 Rows (Tetris) | 800 points              |
