# 🐍 Canvas Snake Arcade

A grid-locked, retro arcade classic built with vanilla JavaScript and the HTML5 Canvas 2D rendering context. The engine
uses a discrete interval time step loop to move the snake sequentially from tile to tile across a coordinate matrix.

---

## 🛠️ Features

- **Matrix Grid System:** Core logic maps coordinates out to a structured grid based on `tileCount` rules, preventing
  the game state from relying on floating-point canvas coordinates.
- **Self-Collision Array Tracking:** The snake's trailing tail is managed via a coordinate array. Moving into any active
  coordinate sector triggers a clean game-over state.
- **Counter-Movement Control Guards:** Keyboard listeners include guard logic that blocks immediate 180-degree
  turnarounds (e.g., trying to shift Left while actively crawling Right), preventing accidental self-eating.

---

## 📂 Directory Map

```text
snake/
├── index.html        # Main app view port structure & layout descriptions
├── package.json      # Dependencies and execution commands
└── src/
    ├── game.js       # Grid logic loops, snake array manipulation, and collision tracking
    ├── main.js       # Vite Hot Module Replacement (HMR) entry point
    └── style.css     # Game container formatting and card styles
```

## How To Play

1. Run the local development server from your terminal inside the snake/ folder:

```bash
npm run dev
```

2. Click the game window viewport inside your browser.
3. Use the Arrow Keys or W, A, S, D to choose your starting direction and begin.
4. Collect the neon orange food nodes to grow your snake tail and score +10 points per item. 5.Crashing into the outer
   borders or your own tail results in a game-over. Tap anywhere on the active black canvas grid window to clear the
   state arrays and spin up a brand new run!
