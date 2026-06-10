# 🎾 Canvas Tennis Engine

A lightweight, pixel-perfect arcade tennis game built with raw vanilla JavaScript and the HTML5 Canvas API. The
development workflow features blazing-fast live feedback loops using Vite's Hot Module Replacement (HMR) API to update
internal math parameters without losing current match scores or states.

![Canvas Tennis Banner](public/hero.png)

## ⚡ Tech Stack & Tools

- **Core Engine:** Vanilla JavaScript (ES6+ Modules)
- **Graphics:** HTML5 Canvas 2D Vector Context
- **Development Build Pipeline:** Vite 5 / Vite Latest
- **State Interceptor Router:** Native `import.meta.hot` API

---

## 🛠️ Features

- **Advanced State Preservation:** Tweak ball velocity limits, change color codes, or edit scoring guidelines inside
  your editor and see updates reflected _live_ in the browser viewport without zeroing out your running score or
  resetting the frame loop.
- **Smart Adaptive Controller Hooks:** Choose between standard **VS Computer AI** mode (featuring tracking velocity
  damping thresholds) or **2 Players** local multiplayer split-screen inputs.
- **Pixel-Perfect Paddle Controls:** Player paddle trackers include positioning mathematical `clamp` guards to prevent
  display boundaries from slipping past view windows.
- **Dynamic Ball Deflection Vectors:** Ball bounces aren't just standard angle reflections; hitting the ball with the
  outer edge of a paddle slices the ball down court lines at sharper angles based on contact offset distance (`deltaY`).

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone or download this project codebase to your local storage.
2. Open your terminal application and step directly into your root project path:
   ```bash
   cd tennis-game
   ```
3. Fetch the required developer engine dependencies:

```bash
npm install
```

Running the Live Engine Workstation Launch your local Vite development instance:

```bash
npm run dev
```

Open your web browser and navigate directly to the displayed terminal local network port link (typically
`http://localhost:5173`).

## How To Play

1. Run the local dev channel and press VS Computer or 2 Players.
2. VS Computer Mode: Hover your cursor anywhere on the canvas workspace window. The left paddle tracks your vertical
   mouse position cleanly.
3. 2 Players Mode: The screen divides mathematically down the mid-court net:
   - Moving your mouse cursor over the Left Half Space moves Player One.
   - Moving your mouse cursor over the Right Half Space shifts Player Two.
4. Matches operate cleanly under a competitive first-to-3 (WINNING_SCORE) game limit. Tap the interface overlay button
   on the victory screen to refresh scores and begin a rematch!
