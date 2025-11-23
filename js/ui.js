// ===== UI CONTROLLER =====

class UI {
    constructor() {
        this.speedNeedle = document.getElementById('speed-needle');
        this.speedNumber = document.getElementById('speed-number');
        this.cameraModeText = document.getElementById('camera-mode-text');
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    }

    updateSpeed(speedKmh) {
        // Update speed number
        if (this.speedNumber) {
            this.speedNumber.textContent = Math.round(speedKmh);
        }

        // Update speedometer needle (0-200 km/h range, -90 to 90 degrees)
        if (this.speedNeedle) {
            const maxSpeed = 200;
            const clampedSpeed = Math.min(speedKmh, maxSpeed);
            const angle = -90 + (clampedSpeed / maxSpeed) * 180;
            this.speedNeedle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        }
    }

    updateCameraMode(modeName) {
        if (this.cameraModeText) {
            this.cameraModeText.textContent = modeName;
        }
    }

    updateMinimap(carPosition, roadPath) {
        if (!this.minimapCtx) return;

        const ctx = this.minimapCtx;
        const canvas = this.minimapCanvas;
        const scale = 2; // Pixels per meter
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Clear canvas
        ctx.fillStyle = 'rgba(10, 14, 39, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw road path
        if (roadPath && roadPath.length > 0) {
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.beginPath();

            roadPath.forEach((point, index) => {
                const x = centerX + (point.x - carPosition.x) * scale;
                const y = centerY + (point.z - carPosition.z) * scale;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        }

        // Draw car (center)
        ctx.fillStyle = '#f5576c';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw direction indicator
        ctx.strokeStyle = '#f5576c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - 8);
        ctx.stroke();
    }

    showHUD() {
        const hud = document.getElementById('game-hud');
        if (hud) {
            hud.classList.remove('hidden');
        }
    }

    hideHUD() {
        const hud = document.getElementById('game-hud');
        if (hud) {
            hud.classList.add('hidden');
        }
    }

    showPauseMenu() {
        const menu = document.getElementById('pause-menu');
        if (menu) {
            menu.classList.remove('hidden');
        }
    }

    hidePauseMenu() {
        const menu = document.getElementById('pause-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
    }

    updateDayNightIcon(isDay) {
        const btn = document.getElementById('day-night-btn');
        if (btn) {
            const sunIcon = btn.querySelector('.sun-icon');
            const moonIcon = btn.querySelector('.moon-icon');

            if (isDay) {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
                btn.title = "Switch to Night (N)";
            } else {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
                btn.title = "Switch to Day (N)";
            }
        }
    }

    toggleDayNightMode(isDay) {
        if (isDay) {
            document.body.classList.add('day-mode');
        } else {
            document.body.classList.remove('day-mode');
        }
        this.updateDayNightIcon(isDay);
    }
}
