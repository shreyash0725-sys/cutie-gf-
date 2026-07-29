/**
 * Interactive Application Engine for Stuti
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playBeep(freq = 440, type = 'sine', duration = 0.1) {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.log("Audio play blocked");
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 'triangle', 0.2), idx * 100);
    });
  }

  playError() {
    if (!this.enabled) return;
    this.playBeep(220, 'sawtooth', 0.25);
  }
}

class BackgroundEngine {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    const count = Math.floor(window.innerWidth / 15);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 18 + 8,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        char: ['🌸', '💖', '✨', '💕', '🌷'][Math.floor(Math.random() * 5)]
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -30) {
        p.y = this.canvas.height + 30;
        p.x = Math.random() * this.canvas.width;
      }

      this.ctx.font = `${p.size}px serif`;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillText(p.char, p.x, p.y);
    });

    requestAnimationFrame(() => this.animate());
  }
}

class FireworksEngine {
  constructor() {
    this.canvas = document.getElementById('fx-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.active = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.active = true;
    this.loop();
  }

  stop() {
    this.active = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = [];
  }

  explode(x, y) {
    const count = 40;
    const emojis = ['🌸', '🌺', '🌹', '✨', '🎉'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        emoji: Math.random() > 0.6 ? emojis[Math.floor(Math.random() * emojis.length)] : null,
        color: `hsl(${Math.random() * 360}, 100%, 70%)`
      });
    }
  }

  loop() {
    if (!this.active) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (Math.random() < 0.08) {
      this.explode(
        Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.1,
        Math.random() * this.canvas.height * 0.5 + this.canvas.height * 0.1
      );
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.alpha -= 0.015;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      if (p.emoji) {
        this.ctx.font = '20px serif';
        this.ctx.fillText(p.emoji, p.x, p.y);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

class App {
  constructor() {
    this.currentPage = 1;
    this.pin = "";
    this.correctPin = "0314";
    this.sound = new SoundEngine();
    this.bg = new BackgroundEngine();
    this.fx = new FireworksEngine();
    this.initEvents();
  }

  initEvents() {
    document.getElementById('sound-toggle').addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      document.getElementById('sound-icon').innerText = this.sound.enabled ? '🔊' : '🔇';
    });
  }

  nextPage(pageNum) {
    this.sound.playBeep(600, 'sine', 0.1);
    
    const currentEl = document.getElementById(`page-${this.currentPage}`);
    const nextEl = document.getElementById(`page-${pageNum}`);

    if (currentEl) currentEl.classList.remove('active');

    setTimeout(() => {
      this.currentPage = pageNum;
      if (nextEl) nextEl.classList.add('active');

      // Page-specific behaviors
      if (pageNum === 4) {
        this.fx.start();
        this.sound.playSuccess();
      } else {
        this.fx.stop();
      }

      if (pageNum === 7) {
        this.runPage7Reveal();
      }
    }, 300);
  }

  pressKey(num) {
    if (this.pin.length < 4) {
      this.pin += num;
      this.sound.playBeep(500 + this.pin.length * 100, 'sine', 0.08);
      this.updateDots();
    }

    if (this.pin.length === 4) {
      setTimeout(() => this.checkPin(), 250);
    }
  }

  clearPin() {
    this.pin = "";
    this.sound.playBeep(300, 'sine', 0.1);
    this.updateDots();
    document.getElementById('hint-box').innerText = "";
  }

  backspacePin() {
    if (this.pin.length > 0) {
      this.pin = this.pin.slice(0, -1);
      this.sound.playBeep(400, 'sine', 0.08);
      this.updateDots();
    }
  }

  updateDots() {
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`dot-${i}`);
      if (i < this.pin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    }
  }

  checkPin() {
    if (this.pin === this.correctPin) {
      this.clearPin();
      this.nextPage(4);
    } else {
      this.sound.playError();
      const hintBox = document.getElementById('hint-box');
      hintBox.innerText = "Hint: Number of days 🗓️";
      
      const appCard = document.getElementById('app-card');
      appCard.classList.add('shake');
      setTimeout(() => appCard.classList.remove('shake'), 400);

      this.pin = "";
      this.updateDots();
    }
  }

  runPage7Reveal() {
    const rev1 = document.getElementById('reveal-text-1');
    const rev2 = document.getElementById('reveal-text-2');
    const btn = document.getElementById('page7-btn');

    rev1.classList.remove('show');
    rev2.classList.remove('show');
    btn.classList.remove('show');

    setTimeout(() => {
      rev1.classList.add('show');
      this.sound.playBeep(523, 'sine', 0.2);
    }, 600);

    setTimeout(() => {
      rev2.classList.add('show');
      this.sound.playBeep(659, 'sine', 0.2);
    }, 2400);

    setTimeout(() => {
      btn.classList.add('show');
      this.sound.playBeep(783, 'sine', 0.3);
    }, 4000);
  }

  restart() {
    this.nextPage(1);
  }
}

// Initialize Application on DOM Ready
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new App();
});
