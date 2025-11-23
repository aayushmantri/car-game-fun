// ===== PROCEDURAL TERRAIN GENERATION =====

class Terrain {
    constructor(scene, biome) {
        this.scene = scene;
        this.biome = biome;
        this.noise = new SimplexNoise(Math.random());
        this.chunks = new Map();
        this.chunkSize = 50;
        this.chunkResolution = 32;
        this.viewDistance = 3; // Number of chunks in each direction
    }

    getHeightAt(x, z) {
        return getBiomeHeight(this.biome, x, z, this.noise);
    }

    getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    updateChunks(centerX, centerZ) {
        const centerChunkX = Math.floor(centerX / this.chunkSize);
        const centerChunkZ = Math.floor(centerZ / this.chunkSize);

        const chunksToKeep = new Set();

        // Generate chunks around player
        for (let x = -this.viewDistance; x <= this.viewDistance; x++) {
            for (let z = -this.viewDistance; z <= this.viewDistance; z++) {
                const chunkX = centerChunkX + x;
                const chunkZ = centerChunkZ + z;
                const key = this.getChunkKey(chunkX, chunkZ);

                chunksToKeep.add(key);

                if (!this.chunks.has(key)) {
                    this.createChunk(chunkX, chunkZ);
                }
            }
        }

        // Remove far chunks
        for (const [key, chunk] of this.chunks.entries()) {
            if (!chunksToKeep.has(key)) {
                this.scene.remove(chunk);
                chunk.geometry.dispose();
                chunk.material.dispose();
                this.chunks.delete(key);
            }
        }
    }

    createChunk(chunkX, chunkZ) {
        const geometry = new THREE.PlaneGeometry(
            this.chunkSize,
            this.chunkSize,
            this.chunkResolution - 1,
            this.chunkResolution - 1
        );

        const vertices = geometry.attributes.position.array;
        const offsetX = chunkX * this.chunkSize;
        const offsetZ = chunkZ * this.chunkSize;

        // Generate terrain heights
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i] + offsetX;
            const z = vertices[i + 1] + offsetZ;
            const height = this.getHeightAt(x, z);
            vertices[i + 2] = height;
        }

        geometry.computeVertexNormals();

        // Create material based on biome
        const material = new THREE.MeshStandardMaterial({
            color: this.biome.colors.ground,
            roughness: 0.8,
            metalness: 0.2,
            flatShading: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(offsetX, 0, offsetZ);
        mesh.receiveShadow = true;

        this.scene.add(mesh);
        this.chunks.set(this.getChunkKey(chunkX, chunkZ), mesh);
    }

    setBiome(biome) {
        this.biome = biome;
        // Clear all chunks to regenerate with new biome
        for (const [key, chunk] of this.chunks.entries()) {
            this.scene.remove(chunk);
            chunk.geometry.dispose();
            chunk.material.dispose();
        }
        this.chunks.clear();
    }
}
