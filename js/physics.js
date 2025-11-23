// ===== SIMPLIFIED PHYSICS SYSTEM =====
// Note: We're using a simplified physics system instead of Cannon.js for easier implementation

class PhysicsWorld {
    constructor() {
        this.gravity = -9.81;
        this.bodies = [];
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    update(deltaTime) {
        this.bodies.forEach(body => {
            if (body.dynamic) {
                // Apply gravity
                body.velocity.y += this.gravity * deltaTime;

                // Update position
                body.position.x += body.velocity.x * deltaTime;
                body.position.y += body.velocity.y * deltaTime;
                body.position.z += body.velocity.z * deltaTime;

                // Apply damping
                body.velocity.x *= (1 - body.damping);
                body.velocity.z *= (1 - body.damping);
            }
        });
    }
}

class PhysicsBody {
    constructor(options = {}) {
        this.position = options.position || { x: 0, y: 0, z: 0 };
        this.velocity = options.velocity || { x: 0, y: 0, z: 0 };
        this.rotation = options.rotation || { x: 0, y: 0, z: 0 };
        this.angularVelocity = options.angularVelocity || { x: 0, y: 0, z: 0 };
        this.mass = options.mass || 1;
        this.dynamic = options.dynamic !== undefined ? options.dynamic : true;
        this.damping = options.damping || 0.05;
        this.shape = options.shape || 'box';
        this.size = options.size || { x: 1, y: 1, z: 1 };
    }

    applyForce(force) {
        if (!this.dynamic) return;

        this.velocity.x += force.x / this.mass;
        this.velocity.y += force.y / this.mass;
        this.velocity.z += force.z / this.mass;
    }

    applyImpulse(impulse) {
        if (!this.dynamic) return;

        this.velocity.x += impulse.x;
        this.velocity.y += impulse.y;
        this.velocity.z += impulse.z;
    }

    setPosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    setVelocity(x, y, z) {
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.z = z;
    }
}
