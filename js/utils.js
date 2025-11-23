// ===== UTILITY FUNCTIONS =====

// Simple Perlin-like noise generator
class SimplexNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.p = this.buildPermutationTable();
    }

    buildPermutationTable() {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        // Shuffle
        for (let i = 255; i > 0; i--) {
            const n = Math.floor((this.seed * 1000 + i) % (i + 1));
            [p[i], p[n]] = [p[n], p[i]];
        }
        return [...p, ...p];
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const a = this.p[X] + Y;
        const b = this.p[X + 1] + Y;
        
        return this.lerp(
            this.lerp(this.grad(this.p[a], x, y), this.grad(this.p[b], x - 1, y), u),
            this.lerp(this.grad(this.p[a + 1], x, y - 1), this.grad(this.p[b + 1], x - 1, y - 1), u),
            v
        );
    }
}

// Mobile detection
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth < 768;
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Linear interpolation
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Map value from one range to another
function map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Random number between min and max
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Convert degrees to radians
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Convert radians to degrees
function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

// HSL to RGB color conversion
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

// RGB to Hex
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Create gradient color between two colors
function gradientColor(color1, color2, factor) {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);
    
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;
    
    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;
    
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    return rgbToHex(r, g, b);
}

// Easing functions
const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

// Performance monitor
class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frames = [];
        this.lastTime = performance.now();
    }

    update() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        
        this.frames.push(delta);
        if (this.frames.length > 60) {
            this.frames.shift();
        }
        
        const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
        this.fps = Math.round(1000 / avg);
    }

    getFPS() {
        return this.fps;
    }
}
