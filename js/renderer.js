// ===== THREE.JS RENDERER SETUP =====

class GameRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lights = {};
        this.timeOfDay = 0; // 0 = night, 0.5 = day (noon)
        this.targetTimeOfDay = 0;
        this.isDayMode = false;
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
        this.scene.fog = new THREE.Fog(0x0a0e27, 50, 300);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        return this;
    }

    setupLighting() {
        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(this.lights.ambient);

        // Directional light (sun/moon)
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
        this.lights.hemisphere = new THREE.HemisphereLight(0x0a0e27, 0x000000, 0.5);
        this.scene.add(this.lights.hemisphere);
    }

    updateLighting(biome) {
        this.biome = biome;
        this.updateDayNightCycle(0); // Force update
    }

    setTimeOfDay(isDay) {
        this.isDayMode = isDay;
        this.targetTimeOfDay = isDay ? 0.5 : 0;
    }

    updateDayNightCycle(deltaTime) {
        // Smoothly transition time
        const diff = this.targetTimeOfDay - this.timeOfDay;
        if (Math.abs(diff) > 0.001) {
            this.timeOfDay += diff * deltaTime * 2; // Transition speed
        } else {
            this.timeOfDay = this.targetTimeOfDay;
        }

        // Calculate sun intensity based on time of day
        // 0 = Night, 0.5 = Noon
        // Simple interpolation for now

        let sunIntensity, ambientIntensity;
        let skyColorTop, skyColorBottom, fogColor, groundColor;

        if (this.biome) {
            if (this.timeOfDay > 0.25) {
                // DAY
                sunIntensity = 1.0;
                ambientIntensity = 0.6;
                skyColorTop = new THREE.Color(this.biome.colors.sky.top);
                skyColorBottom = new THREE.Color(this.biome.colors.sky.bottom);
                fogColor = new THREE.Color(this.biome.colors.fog);
                groundColor = new THREE.Color(this.biome.colors.ground);

                this.lights.sun.color.setHex(0xffffff);
            } else {
                // NIGHT
                sunIntensity = 0.2;
                ambientIntensity = 0.2;
                skyColorTop = new THREE.Color(0x0f172a);
                skyColorBottom = new THREE.Color(0x1e293b);
                fogColor = new THREE.Color(0x0f172a);
                groundColor = new THREE.Color(0x050505);

                this.lights.sun.color.setHex(0xa5b4fc); // Blueish moonlight
            }
        } else {
            return;
        }

        // Apply values
        this.lights.sun.intensity = sunIntensity;
        this.lights.ambient.intensity = ambientIntensity;
        this.scene.fog.color.lerp(fogColor, 0.1);
        this.scene.background = this.scene.fog.color;

        this.lights.hemisphere.color.lerp(skyColorTop, 0.1);
        this.lights.hemisphere.groundColor.lerp(groundColor, 0.1);

        // Move sun/moon
        const angle = (this.timeOfDay - 0.25) * Math.PI * 2; // Adjust so 0.5 is top
        this.lights.sun.position.x = Math.cos(angle) * 100;
        this.lights.sun.position.y = Math.sin(angle) * 100;
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
