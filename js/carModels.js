// ===== CAR MODEL DEFINITIONS =====

const CAR_MODELS = {
    sports: {
        name: 'Sports Car',
        description: 'Fast & Agile',
        stats: {
            maxSpeed: 200,
            acceleration: 15,
            handling: 0.08,
            braking: 12
        },
        dimensions: {
            width: 1.8,
            height: 1.2,
            length: 4.2
        },
        colors: ['#e74c3c', '#3498db', '#f39c12', '#9b59b6'],
        wheelOffset: 0.9,
        suspensionHeight: 0.3
    },

    suv: {
        name: 'SUV',
        description: 'Sturdy & Powerful',
        stats: {
            maxSpeed: 140,
            acceleration: 10,
            handling: 0.05,
            braking: 8
        },
        dimensions: {
            width: 2.0,
            height: 1.8,
            length: 4.8
        },
        colors: ['#2c3e50', '#27ae60', '#7f8c8d', '#34495e'],
        wheelOffset: 1.1,
        suspensionHeight: 0.5
    },

    classic: {
        name: 'Classic Car',
        description: 'Vintage Style',
        stats: {
            maxSpeed: 160,
            acceleration: 12,
            handling: 0.06,
            braking: 10
        },
        dimensions: {
            width: 1.9,
            height: 1.5,
            length: 4.5
        },
        colors: ['#16a085', '#c0392b', '#f1c40f', '#8e44ad'],
        wheelOffset: 1.0,
        suspensionHeight: 0.4
    }
};

// Create 3D car model
function createCarModel(type, colorIndex = 0) {
    const model = CAR_MODELS[type];
    if (!model) return null;

    const group = new THREE.Group();
    const color = model.colors[colorIndex % model.colors.length];

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(
        model.dimensions.width,
        model.dimensions.height,
        model.dimensions.length
    );
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.6,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = model.dimensions.height / 2 + model.suspensionHeight;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Car roof (cabin)
    const roofHeight = model.dimensions.height * 0.6;
    const roofWidth = model.dimensions.width * 0.9;
    const roofLength = model.dimensions.length * 0.5;
    const roofGeometry = new THREE.BoxGeometry(roofWidth, roofHeight, roofLength);
    const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
    roof.position.y = model.dimensions.height + model.suspensionHeight + roofHeight / 2;
    roof.position.z = -model.dimensions.length * 0.1;
    roof.castShadow = true;
    group.add(roof);

    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.6
    });

    // Front windshield
    const windshieldGeometry = new THREE.BoxGeometry(roofWidth * 0.95, roofHeight * 0.8, 0.1);
    const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
    windshield.position.y = roof.position.y;
    windshield.position.z = roofLength / 2;
    group.add(windshield);

    // Rear window
    const rearWindow = windshield.clone();
    rearWindow.position.z = -roofLength / 2;
    group.add(rearWindow);

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffffaa,
        emissiveIntensity: 0.5
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(model.dimensions.width / 2 - 0.3, model.suspensionHeight + 0.5, model.dimensions.length / 2);
    group.add(leftHeadlight);

    const rightHeadlight = leftHeadlight.clone();
    rightHeadlight.position.x = -leftHeadlight.position.x;
    group.add(rightHeadlight);

    // Taillights
    const taillightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xaa0000,
        emissiveIntensity: 0.3
    });

    const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
    leftTaillight.position.set(model.dimensions.width / 2 - 0.3, model.suspensionHeight + 0.5, -model.dimensions.length / 2);
    group.add(leftTaillight);

    const rightTaillight = leftTaillight.clone();
    rightTaillight.position.x = -leftTaillight.position.x;
    group.add(rightTaillight);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.3,
        roughness: 0.7
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.2
    });

    const wheels = [];
    const wheelPositions = [
        { x: model.dimensions.width / 2 + 0.2, z: model.wheelOffset },
        { x: -model.dimensions.width / 2 - 0.2, z: model.wheelOffset },
        { x: model.dimensions.width / 2 + 0.2, z: -model.wheelOffset },
        { x: -model.dimensions.width / 2 - 0.2, z: -model.wheelOffset }
    ];

    wheelPositions.forEach((pos, index) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, model.suspensionHeight, pos.z);
        wheel.castShadow = true;

        // Rim
        const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.35, 16);
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.z = Math.PI / 2;
        rim.position.copy(wheel.position);

        group.add(wheel);
        group.add(rim);
        wheels.push(wheel);
    });

    // Store references
    group.userData = {
        model: model,
        body: body,
        wheels: wheels,
        headlights: [leftHeadlight, rightHeadlight],
        taillights: [leftTaillight, rightTaillight]
    };

    return group;
}

// Get car model configuration
function getCarModel(type) {
    return CAR_MODELS[type] || CAR_MODELS.sports;
}
