// ===== ENVIRONMENT ELEMENTS =====

class Environment {
    constructor(scene, biome, terrain) {
        this.scene = scene;
        this.biome = biome;
        this.terrain = terrain;
        this.objects = [];
        this.clouds = [];
        this.placedObjects = new Set();
    }

    initialize() {
        this.createSkybox();
        this.createClouds();
    }

    createSkybox() {
        // Create gradient skybox
        const skyGeo = new THREE.SphereGeometry(500, 32, 15);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(this.biome.colors.sky.top) },
                bottomColor: { value: new THREE.Color(this.biome.colors.sky.bottom) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
        this.skybox = sky;
    }

    createClouds() {
        const cloudCount = 20;
        const cloudGeometry = new THREE.SphereGeometry(5, 8, 8);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            roughness: 1
        });

        for (let i = 0; i < cloudCount; i++) {
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 400,
                random(30, 60),
                (Math.random() - 0.5) * 400
            );
            cloud.scale.set(
                random(1, 3),
                random(0.5, 1),
                random(1, 2)
            );
            this.scene.add(cloud);
            this.clouds.push(cloud);
        }
    }

    updateClouds(deltaTime) {
        this.clouds.forEach(cloud => {
            cloud.position.x += deltaTime * 2;
            if (cloud.position.x > 200) {
                cloud.position.x = -200;
            }
        });
    }

    populateArea(centerX, centerZ, radius) {
        const gridSize = 10;
        const startX = Math.floor((centerX - radius) / gridSize) * gridSize;
        const endX = Math.floor((centerX + radius) / gridSize) * gridSize;
        const startZ = Math.floor((centerZ - radius) / gridSize) * gridSize;
        const endZ = Math.floor((centerZ + radius) / gridSize) * gridSize;

        for (let x = startX; x <= endX; x += gridSize) {
            for (let z = startZ; z <= endZ; z += gridSize) {
                const key = `${x},${z}`;
                if (this.placedObjects.has(key)) continue;

                // Check if we should place objects here
                if (this.biome.environment.trees && this.biome.environment.trees.enabled) {
                    if (shouldPlaceProp(this.biome, 'trees', x, z, 1234)) {
                        this.createTree(x, z);
                        this.placedObjects.add(key);
                    }
                }

                if (this.biome.environment.buildings && this.biome.environment.buildings.enabled) {
                    if (shouldPlaceProp(this.biome, 'buildings', x, z, 5678)) {
                        this.createBuilding(x, z);
                        this.placedObjects.add(key);
                    }
                }

                if (this.biome.environment.rocks && this.biome.environment.rocks.enabled) {
                    if (shouldPlaceProp(this.biome, 'rocks', x, z, 9012)) {
                        this.createRock(x, z);
                        this.placedObjects.add(key);
                    }
                }
            }
        }
    }

    createTree(x, z) {
        const group = new THREE.Group();
        const y = this.terrain.getHeightAt(x, z);

        // Tree trunk
        const trunkHeight = random(3, 6);
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        group.add(trunk);

        // Tree foliage
        const foliageGeometry = new THREE.SphereGeometry(2, 8, 8);
        const foliageColor = this.biome.environment.trees.type === 'pine' ? 0x2d5016 : 0x3a7d44;
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: foliageColor });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = trunkHeight + 1;
        foliage.scale.set(1, 1.5, 1);
        foliage.castShadow = true;
        group.add(foliage);

        group.position.set(x, y, z);
        group.userData.collisionRadius = 2; // Collision radius for trees
        this.scene.add(group);
        this.objects.push(group);
    }

    createBuilding(x, z) {
        const y = this.terrain.getHeightAt(x, z);
        const config = this.biome.environment.buildings;

        const width = random(5, 10);
        const height = random(config.minHeight, config.maxHeight);
        const depth = random(5, 10);

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.3
        });

        const building = new THREE.Mesh(geometry, material);
        building.position.set(x, y + height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData.collisionRadius = Math.max(width, depth) / 2;

        this.scene.add(building);
        this.objects.push(building);
    }

    createRock(x, z) {
        const y = this.terrain.getHeightAt(x, z);
        const size = random(0.5, 2);

        const geometry = new THREE.DodecahedronGeometry(size, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.1
        });

        const rock = new THREE.Mesh(geometry, material);
        rock.position.set(x, y + size / 2, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        rock.userData.collisionRadius = size;

        this.scene.add(rock);
        this.objects.push(rock);
    }

    update(deltaTime, carPosition) {
        this.updateClouds(deltaTime);
        this.populateArea(carPosition.x, carPosition.z, 100);
    }

    getObjects() {
        return this.objects;
    }

    setBiome(biome) {
        this.biome = biome;

        // Clear existing objects
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        this.objects = [];
        this.placedObjects.clear();

        // Update skybox
        if (this.skybox) {
            this.skybox.material.uniforms.topColor.value = new THREE.Color(biome.colors.sky.top);
            this.skybox.material.uniforms.bottomColor.value = new THREE.Color(biome.colors.sky.bottom);
        }
    }
}
