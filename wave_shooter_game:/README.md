# Wave Shooter Game

![Game Screenshot](screenshot.png) *(optional - add a screenshot later)*

A browser-based shooter game with progressive difficulty across 100 waves. Features smooth controls, enemy health scaling, and wave-based gameplay.

## How to Play

### Controls:
- **WASD**: Move player
- **Mouse**: Aim
- **Left Click**: Shoot
- **ESC**: Pause (optional)

### Gameplay:
1. Survive waves of enemies
2. Kill all enemies to advance
3. Enemies get tougher each wave
4. Reach wave 100 to win!

## Installation

### Method 1: Local Play
1. Download the entire folder
2. Open `index.html` in any modern browser (Chrome/Firefox recommended)

### Method 2: Web Hosting
1. Upload all files to your web server
2. Access via `yourdomain.com/game-folder`

### Method 3: GitHub Pages
1. Create new repository
2. Upload all files
3. Enable GitHub Pages in Settings → Pages
4. Game will be live at: `username.github.io/repo-name`

## Features
- 100 progressively difficult waves
- Visual health bars for player and enemies
- Clean UI with wave counter
- Responsive controls
- Victory/Game Over screens

## Files Included
```
wave_shooter/
├── index.html        # Main game file
├── style.css         # Game styling
├── game.js           # Game logic
└── README.md         # This file
```

## Troubleshooting

**Game won't start:**
- Ensure all files are in the same folder
- Check browser console for errors (F12 → Console)
- Try a different browser

**Controls not working:**
- Click the game canvas first to focus it
- Disable any browser extensions that might interfere

## Customization

Want to modify the game? Try changing these in `game.js`:
```js
// Difficulty settings
const baseEnemyStats = {
    radius: 15,        // Enemy size
    speed: 1,          // Base speed
    health: 1          // Starting health
};

// Player settings
const player = {
    speed: 5,          // Movement speed
    health: 100        // Starting health
};
```

## Credits
Developed by [Your Name] using pure HTML/CSS/JavaScript

## License
Free to use and modify (MIT License)