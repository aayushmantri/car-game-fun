// ===== CAR CONTROLLER =====

class Car {
    constructor(scene, carType, colorIndex = 0) {
        this.scene = scene;
        this.carType = carType;
        this.model = getCarModel(carType);

        // Create 3D model
        this.mesh = createCarModel(carType, colorIndex);
        this.scene.add(this.mesh);

        // Physics
        this.position = new THREE.Vector3(0, 2, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = 0; // Y-axis rotation
        this.speed = 0;
        this.steering = 0;
        this.wheelRotation = 0;

        // Physics properties
        this.maxSpeed = this.model.stats.maxSpeed / 3.6; // Convert km/h to m/s
        this.acceleration = this.model.stats.acceleration;
        this.braking = this.model.stats.braking;
        this.handling = this.model.stats.handling;
        this.friction = 0.98; // Higher friction for better control
        this.airResistance = 0.99;

        // Suspension settings
        this.suspensionHeight = 0.5;
        this.suspensionRestLength = 0.5;
        this.suspensionStiffness = 20.0;
        this.suspensionDamping = 2.0;
        this.verticalVelocity = 0;

        // Control state
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        // Terrain and road references
        this.terrain = null;
        this.road = null;

        // Road-following settings
        this.roadFollowStrength = 0.3; // How strongly car is pulled to road
        this.offRoadPenalty = 0.7; // Speed reduction when off-road

        // Collision detection
        this.collisionRadius = Math.max(this.model.dimensions.width, this.model.dimensions.length) / 2;
        this.isColliding = false;
    }

    setTerrain(terrain) {
        this.terrain = terrain;
    }

    setRoad(road) {
        this.road = road;
    }

    setControls(controls) {
        this.controls = controls;
    }

    update(deltaTime) {
        // 1. Handle Acceleration & Braking
        if (this.controls.forward) {
            this.speed += this.acceleration * deltaTime;
        }
        if (this.controls.backward) {
            if (this.speed > 0) {
                this.speed -= this.braking * deltaTime;
            } else {
                this.speed -= this.acceleration * 0.5 * deltaTime;
            }
        }

        // 2. Apply Friction & Air Resistance
        if (!this.controls.forward && !this.controls.backward) {
            this.speed *= this.friction;
        }
        this.speed *= this.airResistance;

        // Clamp speed
        this.speed = clamp(this.speed, -this.maxSpeed * 0.5, this.maxSpeed);

        // 3. Handle Steering
        if (Math.abs(this.speed) > 0.1) {
            const turnFactor = Math.min(Math.abs(this.speed) / 5, 1.0); // Less steering at very low speeds
            if (this.controls.left) {
                this.steering = this.handling * turnFactor;
            } else if (this.controls.right) {
                this.steering = -this.handling * turnFactor;
            } else {
                this.steering *= 0.9; // Smooth return to center
            }

            // Apply steering
            this.rotation += this.steering * (this.speed / this.maxSpeed) * deltaTime * 60;
        } else {
            this.steering *= 0.9;
        }

        // 4. Update Horizontal Position
        const moveX = Math.sin(this.rotation) * this.speed * deltaTime;
        const moveZ = Math.cos(this.rotation) * this.speed * deltaTime;

        this.position.x += moveX;
        this.position.z += moveZ;

        // 5. Suspension & Vertical Physics
        let groundHeight = 0;
        if (this.terrain) {
            groundHeight = this.terrain.getHeightAt(this.position.x, this.position.z);
        }

        // Raycast down to find ground
        const currentHeight = this.position.y;
        const compression = (groundHeight + this.suspensionRestLength) - currentHeight;

        // Spring force: F = k * x
        const springForce = compression * this.suspensionStiffness;

        // Damping force: F = -c * v
        const dampingForce = -this.verticalVelocity * this.suspensionDamping;

        const totalVerticalForce = springForce + dampingForce - 9.81; // Gravity

        this.verticalVelocity += totalVerticalForce * deltaTime;
        this.position.y += this.verticalVelocity * deltaTime;

        // Hard floor constraint to prevent falling through world
        if (this.position.y < groundHeight) {
            this.position.y = groundHeight;
            this.verticalVelocity = 0;
        }

        // 6. Road-Following Logic
        if (this.road && this.speed > 0.1) {
            const onRoad = this.road.isOnRoad(this.position);

            if (!onRoad) {
                // Apply off-road penalty
                this.speed *= this.offRoadPenalty;

                // Gently steer car back to road
                const closestPoint = this.road.getClosestPointOnRoad(this.position);
                const toRoad = new THREE.Vector3().subVectors(closestPoint, this.position);

                if (toRoad.length() > 0.1) {
                    toRoad.normalize();
                    const roadAngle = Math.atan2(toRoad.x, toRoad.z);
                    const angleDiff = roadAngle - this.rotation;

                    // Normalize angle difference to -PI to PI
                    let normalizedDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;

                    // Gently adjust rotation towards road
                    this.rotation += normalizedDiff * this.roadFollowStrength * deltaTime;
                }
            }
        }

        // 7. Calculate Chassis Tilt (Pitch & Roll)
        if (this.terrain) {
            // Sample terrain at 4 points around the car
            const offset = 1.0;
            const hF = this.terrain.getHeightAt(this.position.x + Math.sin(this.rotation) * offset, this.position.z + Math.cos(this.rotation) * offset);
            const hB = this.terrain.getHeightAt(this.position.x - Math.sin(this.rotation) * offset, this.position.z - Math.cos(this.rotation) * offset);
            const hL = this.terrain.getHeightAt(this.position.x + Math.sin(this.rotation + Math.PI / 2) * offset, this.position.z + Math.cos(this.rotation + Math.PI / 2) * offset);
            const hR = this.terrain.getHeightAt(this.position.x - Math.sin(this.rotation + Math.PI / 2) * offset, this.position.z - Math.cos(this.rotation + Math.PI / 2) * offset);

            // Pitch (Forward/Backward tilt)
            const targetPitch = Math.atan2(hB - hF, offset * 2);

            // Roll (Left/Right tilt)
            const targetRoll = Math.atan2(hL - hR, offset * 2);

            // Add dynamic tilt from acceleration/steering
            const accelPitch = (this.speed / this.maxSpeed) * 0.05;
            const steerRoll = this.steering * (this.speed / this.maxSpeed) * 0.2;

            // Smoothly interpolate rotation
            this.mesh.rotation.x = lerp(this.mesh.rotation.x, targetPitch - accelPitch, 0.1);
            this.mesh.rotation.z = lerp(this.mesh.rotation.z, targetRoll + steerRoll, 0.1);
        }

        // Update mesh position and rotation
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;

        // Rotate wheels
        this.wheelRotation += this.speed * deltaTime * 2;
        const wheels = this.mesh.userData.wheels;
        if (wheels) {
            wheels.forEach((wheel, index) => {
                wheel.rotation.x = this.wheelRotation;

                // Front wheels steering
                if (index < 2) {
                    wheel.rotation.y = this.steering * 0.5;
                }
            });
        }
    }

    getPosition() {
        return this.position.clone();
    }

    getRotation() {
        return this.rotation;
    }

    getSpeed() {
        return this.speed;
    }

    getSpeedKmh() {
        return Math.abs(this.speed * 3.6); // Convert m/s to km/h
    }

    getForwardDirection() {
        return new THREE.Vector3(
            Math.sin(this.rotation),
            0,
            Math.cos(this.rotation)
        );
    }

    reset(position, rotation = 0) {
        this.position.copy(position);
        this.rotation = rotation;
        this.speed = 0;
        this.velocity.set(0, 0, 0);
        this.steering = 0;
        this.wheelRotation = 0;
        this.isColliding = false;
    }

    checkCollision(environmentObjects) {
        if (!environmentObjects || environmentObjects.length === 0) {
            this.isColliding = false;
            return false;
        }

        // Simple sphere collision detection
        for (const obj of environmentObjects) {
            if (!obj.position) continue;

            const distance = this.position.distanceTo(obj.position);
            const minDistance = this.collisionRadius + (obj.userData?.collisionRadius || 2);

            if (distance < minDistance) {
                this.isColliding = true;

                // Push car away from object
                const pushDirection = new THREE.Vector3()
                    .subVectors(this.position, obj.position)
                    .normalize();

                this.position.add(pushDirection.multiplyScalar(0.2));
                this.speed *= 0.5; // Reduce speed on collision

                return true;
            }
        }

        this.isColliding = false;
        return false;
    }

    isOnRoad() {
        if (!this.road) return true;
        return this.road.isOnRoad(this.position);
    }

    getDistanceFromRoad() {
        if (!this.road) return 0;
        return this.road.getDistanceFromRoad(this.position);
    }
}
