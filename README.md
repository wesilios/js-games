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

## Adding New Games

To add a new game to this collection:

1. Create a new directory at the root level (e.g., /snake or /tetris).
2. Scaffold a fast vanilla setup running an older Vite build to support Node 18 environments:

```bash
npm create vite@5 . -- --template vanilla
```

3. Link your main state objects to preserve runtime states during codechanges!
