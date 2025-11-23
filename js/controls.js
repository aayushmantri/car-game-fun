// ===== INPUT CONTROLS =====

class Controls {
    constructor() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            camera: false,
            pause: false,
            dayNight: false
        };

        this.mobile = isMobile();
        this.joystick = null;

        this.setupKeyboard();
        if (this.mobile) {
            this.setupMobile();
        }
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.keys.forward = true;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.backward = true;
                    break;
                case 'a':
                case 'arrowleft':
                    this.keys.left = true;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = true;
                    break;
                case 'c':
                    if (!this.keys.camera) {
                        this.keys.camera = true;
                    }
                    break;
                case 'p':
                    if (!this.keys.pause) {
                        this.keys.pause = true;
                    }
                    break;
                case 'n':
                    if (!this.keys.dayNight) {
                        this.keys.dayNight = true;
                    }
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.keys.forward = false;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.backward = false;
                    break;
                case 'a':
                case 'arrowleft':
                    this.keys.left = false;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = false;
                    break;
                case 'c':
                    this.keys.camera = false;
                    break;
                case 'p':
                    this.keys.pause = false;
                    break;
                case 'n':
                    this.keys.dayNight = false;
                    break;
            }
        });
    }

    setupMobile() {
        // Show mobile controls
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.classList.remove('hidden');
        }

        // Joystick for steering
        this.setupJoystick();

        // Accelerate button
        const accelerateBtn = document.getElementById('accelerate-btn');
        if (accelerateBtn) {
            accelerateBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.forward = true;
            });
            accelerateBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.forward = false;
            });
        }

        // Brake button
        const brakeBtn = document.getElementById('brake-btn');
        if (brakeBtn) {
            brakeBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.backward = true;
            });
            brakeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.backward = false;
            });
        }

        // Camera button
        const cameraBtn = document.getElementById('camera-btn');
        if (cameraBtn) {
            cameraBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.camera = true;
            });
            cameraBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.camera = false;
            });
        }
    }

    setupJoystick() {
        const joystick = document.getElementById('steering-joystick');
        const knob = joystick.querySelector('.joystick-knob');

        let active = false;
        let startX = 0;

        const handleStart = (e) => {
            active = true;
            const rect = joystick.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
        };

        const handleMove = (e) => {
            if (!active) return;

            const touch = e.touches ? e.touches[0] : e;
            const rect = joystick.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const deltaX = touch.clientX - centerX;
            const maxDelta = rect.width / 2;

            const clampedDelta = clamp(deltaX, -maxDelta, maxDelta);
            const normalizedDelta = clampedDelta / maxDelta;

            // Update knob position
            knob.style.transform = `translate(-50%, -50%) translateX(${clampedDelta}px)`;

            // Update steering
            if (normalizedDelta < -0.2) {
                this.keys.left = true;
                this.keys.right = false;
            } else if (normalizedDelta > 0.2) {
                this.keys.right = true;
                this.keys.left = false;
            } else {
                this.keys.left = false;
                this.keys.right = false;
            }
        };

        const handleEnd = () => {
            active = false;
            knob.style.transform = 'translate(-50%, -50%)';
            this.keys.left = false;
            this.keys.right = false;
        };

        joystick.addEventListener('touchstart', handleStart);
        joystick.addEventListener('touchmove', handleMove);
        joystick.addEventListener('touchend', handleEnd);
        joystick.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
    }

    getControls() {
        return this.keys;
    }

    isCameraSwitchPressed() {
        const pressed = this.keys.camera;
        if (pressed) {
            this.keys.camera = false; // Reset to prevent multiple triggers
        }
        return pressed;
    }

    isPauseSwitchPressed() {
        const pressed = this.keys.pause;
        if (pressed) {
            this.keys.pause = false; // Reset to prevent multiple triggers
        }
        return pressed;
    }

    isDayNightSwitchPressed() {
        const pressed = this.keys.dayNight;
        if (pressed) {
            this.keys.dayNight = false; // Reset to prevent multiple triggers
        }
        return pressed;
    }
}
