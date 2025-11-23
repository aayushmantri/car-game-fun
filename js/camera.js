// ===== CAMERA CONTROLLER =====

class CameraController {
    constructor(camera, car) {
        this.camera = camera;
        this.car = car;
        this.modes = ['follow', 'firstPerson', 'topDown'];
        this.currentModeIndex = 0;
        this.currentMode = this.modes[0];

        // Camera settings for each mode
        this.settings = {
            follow: {
                distance: 15,
                height: 6,
                smoothness: 0.1
            },
            firstPerson: {
                distance: 0,
                height: 1.2,
                smoothness: 0.15
            },
            topDown: {
                distance: 0,
                height: 30,
                smoothness: 0.1
            }
        };

        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
    }

    switchMode() {
        this.currentModeIndex = (this.currentModeIndex + 1) % this.modes.length;
        this.currentMode = this.modes[this.currentModeIndex];
        return this.getModeDisplayName();
    }

    getModeDisplayName() {
        const names = {
            follow: 'Follow Camera',
            firstPerson: 'First Person',
            topDown: 'Top Down'
        };
        return names[this.currentMode];
    }

    update() {
        const carPos = this.car.getPosition();
        const carRot = this.car.getRotation();
        const settings = this.settings[this.currentMode];

        let targetPosition = new THREE.Vector3();
        let targetLookAt = new THREE.Vector3();

        switch (this.currentMode) {
            case 'follow':
                // Position behind and above the car
                targetPosition.set(
                    carPos.x - Math.sin(carRot) * settings.distance,
                    carPos.y + settings.height,
                    carPos.z - Math.cos(carRot) * settings.distance
                );
                targetLookAt.copy(carPos);
                targetLookAt.y += 2;
                break;

            case 'firstPerson':
                // Position inside the car
                targetPosition.set(
                    carPos.x + Math.sin(carRot) * 0.5,
                    carPos.y + settings.height,
                    carPos.z + Math.cos(carRot) * 0.5
                );
                targetLookAt.set(
                    carPos.x + Math.sin(carRot) * 10,
                    carPos.y + 1,
                    carPos.z + Math.cos(carRot) * 10
                );
                break;

            case 'topDown':
                // Position directly above
                targetPosition.set(
                    carPos.x,
                    carPos.y + settings.height,
                    carPos.z
                );
                targetLookAt.copy(carPos);
                break;
        }

        // Smooth camera movement
        this.currentPosition.lerp(targetPosition, settings.smoothness);
        this.currentLookAt.lerp(targetLookAt, settings.smoothness);

        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }

    reset() {
        this.currentModeIndex = 0;
        this.currentMode = this.modes[0];
    }
}
