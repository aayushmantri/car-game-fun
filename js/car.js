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

        // Car properties
        this.maxSpeed = this.model.stats.maxSpeed / 3.6; // Convert km/h to m/s
        this.acceleration = this.model.stats.acceleration;
        this.braking = this.model.stats.braking;
        this.handling = this.model.stats.handling;
        this.friction = 0.95;

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
        // Handle acceleration
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

        // Apply friction
        if (!this.controls.forward && !this.controls.backward) {
            this.speed *= this.friction;
        }

        // Clamp speed
        this.speed = clamp(this.speed, -this.maxSpeed * 0.5, this.maxSpeed);

        // Handle steering (only when moving)
        if (Math.abs(this.speed) > 0.1) {
            if (this.controls.left) {
                this.steering = this.handling;
            } else if (this.controls.right) {
                this.steering = -this.handling;
            } else {
                this.steering *= 0.9; // Smooth return to center
            }

            // Apply steering
            this.rotation += this.steering * (this.speed / this.maxSpeed) * deltaTime * 60;
        } else {
            this.steering *= 0.9;
        }

        // Update position based on speed and rotation
        const moveX = Math.sin(this.rotation) * this.speed * deltaTime;
        const moveZ = Math.cos(this.rotation) * this.speed * deltaTime;

        this.position.x += moveX;
        this.position.z += moveZ;

        // Road-following behavior
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

        // Get terrain height at car position
        if (this.terrain) {
            const terrainHeight = this.terrain.getHeightAt(this.position.x, this.position.z);
            this.position.y = terrainHeight + 0.5; // Car height above ground
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

        // Tilt car based on steering
        const tiltAmount = this.steering * this.speed / this.maxSpeed * 0.1;
        this.mesh.rotation.z = lerp(this.mesh.rotation.z, tiltAmount, 0.1);

        // Pitch based on speed
        const pitchAmount = (this.speed / this.maxSpeed) * 0.05;
        this.mesh.rotation.x = lerp(this.mesh.rotation.x, -pitchAmount, 0.1);
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
