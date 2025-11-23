// ===== MENU CONTROLLER =====

class Menu {
    constructor(onStartGame) {
        this.onStartGame = onStartGame;
        this.selectedCar = null;
        this.selectedEnvironment = null;

        this.setupMenu();
    }

    setupMenu() {
        // Car selection
        const carOptions = document.querySelectorAll('.car-option');
        carOptions.forEach(option => {
            option.addEventListener('click', () => {
                carOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedCar = option.dataset.car;
                this.updateStartButton();
                this.renderCarPreview(option.dataset.car, option.querySelector('.car-preview'));
            });
        });

        // Environment selection
        const envOptions = document.querySelectorAll('.env-option');
        envOptions.forEach(option => {
            option.addEventListener('click', () => {
                envOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedEnvironment = option.dataset.env;
                this.updateStartButton();
            });
        });

        // Start button
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.selectedCar && this.selectedEnvironment) {
                    this.hideMenu();
                    this.onStartGame(this.selectedCar, this.selectedEnvironment);
                }
            });
        }

        // Select defaults
        if (carOptions.length > 0) {
            carOptions[0].click();
        }
        if (envOptions.length > 0) {
            envOptions[0].click();
        }
    }

    renderCarPreview(carType, container) {
        // Simple emoji preview for cars
        const emojis = {
            sports: '🏎️',
            suv: '🚙',
            classic: '🚗'
        };

        if (container) {
            container.textContent = emojis[carType] || '🚗';
        }
    }

    updateStartButton() {
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.disabled = !(this.selectedCar && this.selectedEnvironment);
        }
    }

    showMenu() {
        const menu = document.getElementById('main-menu');
        if (menu) {
            menu.classList.add('active');
        }
    }

    hideMenu() {
        const menu = document.getElementById('main-menu');
        if (menu) {
            menu.classList.remove('active');
        }
    }

    hideLoadingScreen() {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.classList.remove('active');
        }
    }

    showLoadingScreen() {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.classList.add('active');
        }
    }
}
