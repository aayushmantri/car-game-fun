// ===== BIOME CONFIGURATIONS =====

const BIOMES = {
    city: {
        name: 'City',
        terrain: {
            heightScale: 0.5,        // Mostly flat
            frequency: 0.02,         // Large, gentle variations
            octaves: 2,
            baseHeight: 0
        },
        colors: {
            ground: '#2c3e50',       // Dark asphalt
            road: '#34495e',         // Slightly lighter road
            roadMarkings: '#f39c12', // Yellow lines
            sky: {
                top: '#1a2332',
                bottom: '#34495e'
            },
            fog: '#2c3e50'
        },
        roads: {
            type: 'grid',            // Grid-based city streets
            width: 12,
            lanes: 4,
            spacing: 100             // Distance between parallel roads
        },
        environment: {
            buildings: {
                enabled: true,
                density: 0.3,
                minHeight: 20,
                maxHeight: 100,
                colors: ['#34495e', '#2c3e50', '#7f8c8d', '#95a5a6']
            },
            trees: {
                enabled: true,
                density: 0.05,
                type: 'urban'        // Small decorative trees
            },
            streetlights: {
                enabled: true,
                spacing: 30
            },
            props: ['traffic_lights', 'billboards', 'benches']
        }
    },

    countryside: {
        name: 'Countryside',
        terrain: {
            heightScale: 8,          // Rolling hills
            frequency: 0.05,
            octaves: 4,
            baseHeight: 0
        },
        colors: {
            ground: '#7cb342',       // Grass green
            road: '#5d4037',         // Brown dirt/gravel
            roadMarkings: '#ffffff', // White lines
            sky: {
                top: '#87ceeb',
                bottom: '#b0e0e6'
            },
            fog: '#c8e6c9'
        },
        roads: {
            type: 'winding',         // Curved country roads
            width: 8,
            lanes: 2,
            curviness: 0.3           // How curvy the roads are
        },
        environment: {
            buildings: {
                enabled: true,
                density: 0.02,
                minHeight: 5,
                maxHeight: 15,
                colors: ['#d32f2f', '#8d6e63', '#ffffff'],
                type: 'barns'
            },
            trees: {
                enabled: true,
                density: 0.2,
                type: 'deciduous'    // Oak, maple style trees
            },
            fences: {
                enabled: true,
                spacing: 50
            },
            props: ['windmills', 'haystacks', 'cows', 'fields']
        }
    },

    hilly: {
        name: 'Hilly',
        terrain: {
            heightScale: 25,         // Steep mountains
            frequency: 0.08,
            octaves: 5,
            baseHeight: 5
        },
        colors: {
            ground: '#4e342e',       // Rocky brown
            road: '#37474f',         // Dark mountain road
            roadMarkings: '#ffeb3b', // Bright yellow for visibility
            sky: {
                top: '#0d47a1',
                bottom: '#64b5f6'
            },
            fog: '#90a4ae'
        },
        roads: {
            type: 'mountain',        // Winding mountain roads
            width: 7,
            lanes: 2,
            curviness: 0.5,          // Very curvy
            switchbacks: true        // Include hairpin turns
        },
        environment: {
            buildings: {
                enabled: false
            },
            trees: {
                enabled: true,
                density: 0.15,
                type: 'pine'         // Coniferous trees
            },
            rocks: {
                enabled: true,
                density: 0.3,
                sizes: [1, 5]
            },
            cliffs: {
                enabled: true,
                threshold: 15        // Height difference for cliff
            },
            props: ['boulders', 'peaks', 'waterfalls']
        }
    }
};

// Get biome configuration
function getBiome(biomeName) {
    return BIOMES[biomeName] || BIOMES.countryside;
}

// Get terrain height for a biome at given coordinates
function getBiomeHeight(biome, x, z, noiseGenerator) {
    const config = biome.terrain;
    let height = config.baseHeight;
    let amplitude = config.heightScale;
    let frequency = config.frequency;

    // Multiple octaves for more natural terrain
    for (let i = 0; i < config.octaves; i++) {
        height += noiseGenerator.noise(x * frequency, z * frequency) * amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }

    return height;
}

// Check if position should have a building/prop
function shouldPlaceProp(biome, propType, x, z, seed) {
    const config = biome.environment[propType];
    if (!config || !config.enabled) return false;

    // Use deterministic random based on position
    const hash = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453;
    const random = hash - Math.floor(hash);

    return random < config.density;
}
