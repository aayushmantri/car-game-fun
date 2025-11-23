// ===== MAIN GAME CONTROLLER =====

class Game {
    constructor() {
        this.renderer = null;
        this.car = null;
        this.terrain = null;
        this.road = null;
        this.environment = null;
        this.camera = null;
        this.controls = null;
        this.ui = null;
        this.menu = null;

        this.selectedCar = null;
        this.selectedBiome = null;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.performanceMonitor = new PerformanceMonitor();

        this.init();
    }

    init() {
        // Initialize menu
        this.menu = new Menu((carType, environment) => {
            this.startGame(carType, environment);
        });

        // Initialize UI
        this.ui = new UI();

        // Initialize controls
        this.controls = new Controls();

        // Show menu after brief loading
        setTimeout(() => {
            this.menu.hideLoadingScreen();
            this.menu.showMenu();
        }, 1000);
    }

    startGame(carType, environmentType) {
        this.selectedCar = carType;
        this.selectedBiome = getBiome(environmentType);

        // Initialize renderer
        this.renderer = new GameRenderer();
        this.renderer.init();
        this.renderer.updateLighting(this.selectedBiome);

        // Initialize terrain
        this.terrain = new Terrain(this.renderer.getScene(), this.selectedBiome);

        // Initialize car
        this.car = new Car(this.renderer.getScene(), carType, 0);
        this.car.setTerrain(this.terrain);
        this.car.setRoad(this.road); // Connect road to car for road-following
        this.car.reset(new THREE.Vector3(0, 2, 0), 0);

        // Initialize road
        this.road = new RoadSystem(this.renderer.getScene(), this.selectedBiome);
        this.road.initialize(new THREE.Vector3(0, 0, 0));

        // Initialize environment
        this.environment = new Environment(
            this.renderer.getScene(),
            this.selectedBiome,
            this.terrain
        );
        this.environment.initialize();

        // Initialize camera
        this.camera = new CameraController(this.renderer.getCamera(), this.car);

        // Show HUD
        this.ui.showHUD();

        // Setup play/pause button
        this.setupPlayPauseButton();

        // Start game loop
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    setupPlayPauseButton() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            if (this.isPaused) {
                playPauseBtn.classList.add('paused');
                playPauseBtn.title = 'Play (P)';
            } else {
                playPauseBtn.classList.remove('paused');
                playPauseBtn.title = 'Pause (P)';
                // Reset lastTime to prevent large delta on resume
                this.lastTime = performance.now();
            }
        }
    }

    gameLoop() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.gameLoop());

        // Check for pause toggle
        if (this.controls.isPauseSwitchPressed()) {
            this.togglePause();
        }

        // Skip updates if paused
        if (this.isPaused) {
            return;
        }

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
        this.lastTime = currentTime;

        // Update performance monitor
        this.performanceMonitor.update();

        // Update controls
        const controlState = this.controls.getControls();
        this.car.setControls(controlState);

        // Check for camera switch
        if (this.controls.isCameraSwitchPressed()) {
            const modeName = this.camera.switchMode();
            this.ui.updateCameraMode(modeName);
        }

        // Update car
        this.car.update(deltaTime);

        // Check collisions with environment objects
        this.car.checkCollision(this.environment.getObjects());

        // Update terrain chunks
        const carPos = this.car.getPosition();
        this.terrain.updateChunks(carPos.x, carPos.z);

        // Update road
        this.road.update(carPos);

        // Update environment
        this.environment.update(deltaTime, carPos);

        // Update camera
        this.camera.update();

        // Update day/night cycle
        this.renderer.updateDayNightCycle(deltaTime);

        // Update UI
        this.ui.updateSpeed(this.car.getSpeedKmh());
        this.ui.updateMinimap(carPos, this.road.getRoadPath());

        // Render scene
        this.renderer.render();
    }

    stop() {
        this.isRunning = false;
    }

    restart() {
        // Reset car position
        if (this.car) {
            this.car.reset(new THREE.Vector3(0, 2, 0), 0);
        }

        // Reset camera
        if (this.camera) {
            this.camera.reset();
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new Game();

    // Make game accessible globally for debugging
    window.game = game;
});
