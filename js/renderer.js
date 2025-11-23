// ===== THREE.JS RENDERER SETUP =====

class GameRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lights = {};
        this.timeOfDay = 0.5; // 0 = midnight, 0.5 = noon, 1 = midnight
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        // Create renderer
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Setup lighting
        this.setupLighting();

        // Setup fog
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 300);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        return this;
    }

    setupLighting() {
        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.lights.ambient);

        // Directional light (sun)
        this.lights.sun = new THREE.DirectionalLight(0xffffff, 0.8);
        this.lights.sun.position.set(50, 100, 50);
        this.lights.sun.castShadow = true;

        // Shadow settings
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 500;
        this.lights.sun.shadow.camera.left = -100;
        this.lights.sun.shadow.camera.right = 100;
        this.lights.sun.shadow.camera.top = 100;
        this.lights.sun.shadow.camera.bottom = -100;

        this.scene.add(this.lights.sun);

        // Hemisphere light for better ambient lighting
        this.lights.hemisphere = new THREE.HemisphereLight(0x87ceeb, 0x7cb342, 0.3);
        this.scene.add(this.lights.hemisphere);
    }

    updateLighting(biome) {
        // Update fog color based on biome
        const fogColor = new THREE.Color(biome.colors.fog);
        this.scene.fog.color = fogColor;
        this.scene.background = fogColor;

        // Update hemisphere light colors
        const skyColor = new THREE.Color(biome.colors.sky.top);
        const groundColor = new THREE.Color(biome.colors.ground);
        this.lights.hemisphere.color = skyColor;
        this.lights.hemisphere.groundColor = groundColor;
    }

    updateDayNightCycle(deltaTime) {
        // Cycle through day and night (very slow)
        this.timeOfDay += deltaTime * 0.01;
        if (this.timeOfDay > 1) this.timeOfDay = 0;

        // Calculate sun intensity based on time of day
        const sunIntensity = Math.max(0.2, Math.sin(this.timeOfDay * Math.PI * 2) * 0.6 + 0.4);
        this.lights.sun.intensity = sunIntensity;

        // Calculate sun position
        const angle = this.timeOfDay * Math.PI * 2;
        this.lights.sun.position.x = Math.cos(angle) * 100;
        this.lights.sun.position.y = Math.sin(angle) * 100;

        // Adjust ambient light
        this.lights.ambient.intensity = Math.max(0.2, sunIntensity * 0.5);

        // Update sun color (warmer at sunrise/sunset)
        const sunHeight = Math.sin(angle);
        if (sunHeight < 0.3 && sunHeight > -0.3) {
            // Sunrise/sunset - orange tint
            this.lights.sun.color.setHex(0xffaa66);
        } else {
            // Day - white light
            this.lights.sun.color.setHex(0xffffff);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}
