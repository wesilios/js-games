# 🧱 Canvas Brick Breaker

A classic arcade breakout game built entirely on top of the HTML5 Canvas 2D engine using vanilla ECMAScript modules.
This project transitions away from single-target physics to managing a full 2D matrix array collection of destructible
tile elements.

---

## 🛠️ Features

- **2D Matrix Brick Layouts:** Bricks are initialized into a nested column-and-row array matrix. Each block instance
  tracks its structural boundaries and visibility parameters: `{ x, y, width, height, active: true }`.
- **Axis-Aligned Bounding Box (AABB) Collisions:** The update routine runs collision passes against all active bricks.
  If an interception occurs, the ball isolates the closest collision axis to toggle the block off and invert the correct
  directional physics vectors.
- **Dynamic Paddle Surface Deflection:** Similar to the Canvas Tennis engine, bouncing the ball off the outer edges of
  the paddle platform shifts the horizontal velocity components, allowing players to slice shots at sharp angles across
  the screen grid.

---

## 📂 Directory Map

```text
brick_breaker/
├── index.html        # Viewport framework structure and layout descriptions
├── package.json      # Vite dependency parameters and run scripts
└── src/
    ├── game.js       # Brick destruction matrices, vector reflections, and canvas buffers
    ├── main.js       # Vite Hot Module Replacement (HMR) state engine entry
    └── style.css     # Interface alignment rules and media styling# Bricker Breaker
```

This game takes what you learned from the Tennis game's ball-and-paddle system and combines it with a 2D matrix array.

```text
+-------------------------+
| [X] [X] [X] [X] [X] [X] |  <-- 2D Array Grid of Bricks
| [X] [X] [X] [X] [X] [X] |      (Active vs Inactive)
|                         |
|            O            |  <-- Ball checks every brick's
|           / \           |      bounding box boundaries
|                         |
|       [=======]         |  <-- Player Paddle
+-------------------------+
```

Concept:

- Multi-Entity Tracking: You will store rows and columns of bricks as a 2D array of objects, where each brick has
  coordinates and an active status flag: `{ x: 50, y: 20, active: true }`.
- Advanced Bounding Box (AABB) Collisions: Instead of just checking if the ball hits a solid wall, your loop will check
  if the ball intersects with any active brick. If it does, you reverse the ball's Y-velocity and toggle
  `brick.active = false`.
