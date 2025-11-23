# Open Road - Drive Anywhere 🚗

A fun, interactive 3D open-world car driving game with procedurally generated terrain, multiple vehicles, and diverse environments. Built with Three.js and vanilla JavaScript.

## Features

### 🚗 Multiple Vehicles
- **Sports Car** - Fast & agile (200 km/h)
- **SUV** - Sturdy & powerful (140 km/h)
- **Classic Car** - Vintage style (160 km/h)

### 🌍 Three Unique Environments
- **City** - Urban streets with grid roads and buildings
- **Countryside** - Rolling hills with winding roads and farms
- **Hilly** - Mountain terrain with challenging switchbacks

### 🎮 Game Features
- Infinite procedurally generated terrain
- Dynamic road system with biome-specific styles
- Realistic car physics with road-following AI
- Collision detection with environment objects
- Three camera modes (Follow, First-Person, Top-Down)
- Day/night cycle with dynamic lighting
- Full keyboard and mobile touch controls
- Speedometer and minimap HUD
- Play/pause functionality

## Controls

### Desktop (Keyboard)
- **W / ↑** - Accelerate
- **S / ↓** - Brake / Reverse
- **A / ←** - Steer Left
- **D / →** - Steer Right
- **C** - Switch Camera Mode
- **P** - Pause/Resume

### Mobile (Touch)
- Virtual joystick for steering
- Buttons for accelerate, brake, and camera

## How to Play

1. Open `index.html` in your web browser
2. Select your car (Sports Car, SUV, or Classic Car)
3. Choose your environment (City, Countryside, or Hilly)
4. Click "Start Driving" and enjoy!

## Technology Stack

- **Three.js** - 3D rendering engine
- **Vanilla JavaScript** - No framework dependencies
- **Simplex Noise** - Procedural terrain generation
- **CSS3** - Modern styling with glassmorphism effects

## Project Structure

```
car-game-fun/
├── index.html          # Main HTML file
├── style.css           # Styles and responsive design
└── js/
    ├── game.js         # Main game controller
    ├── renderer.js     # Three.js scene and lighting
    ├── car.js          # Car physics and movement
    ├── terrain.js      # Procedural terrain generation
    ├── road.js         # Dynamic road system
    ├── environment.js  # Skybox, clouds, and props
    ├── camera.js       # Camera controller
    ├── controls.js     # Input handling
    ├── ui.js           # HUD updates
    ├── menu.js         # Menu system
    ├── physics.js      # Physics simulation
    ├── biomes.js       # Biome configurations
    ├── carModels.js    # Car definitions
    └── utils.js        # Utility functions
```

## Features Implemented

✅ Car selection menu with 3 vehicle types  
✅ Environment selection with 3 biomes  
✅ Procedural infinite terrain generation  
✅ Dynamic road system with road-following AI  
✅ Collision physics with environment objects  
✅ Multiple camera angles  
✅ Day/night cycle  
✅ Mobile-friendly responsive design  
✅ Play/pause functionality  
✅ Premium glassmorphism UI  

## License

MIT License - Feel free to use and modify!

## Credits

Created with ❤️ using Three.js and modern web technologies.
