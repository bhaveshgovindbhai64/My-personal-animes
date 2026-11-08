/**
 * ANIMEVERSE — Atmospheric Dual-Particle Canvas Engine
 * Simulates crimson embers on the left and golden starlight on the right,
 * with dramatic collision bursts during the handshake climax.
 */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.burstParticles = [];
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.rafId = null;
    this.isRunning = false;
    this.scrollProgress = 0; // 0 to 1
    this.handshakeTriggered = false;

    // Check reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    if (!this.reducedMotion) {
      this.populateBaseParticles();
      this.start();
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  populateBaseParticles() {
    this.particles = [];
    const count = window.innerWidth < 768 ? 40 : 85;

    for (let i = 0; i < count; i++) {
      // Half crimson/abyss (left-biased), half golden/elysium (right-biased)
      const isCrimson = i % 2 === 0;
      this.particles.push(this.createParticle(isCrimson));
    }
  }

  createParticle(isCrimson, customX, customY) {
    const margin = this.width * 0.05;
    let x;
    if (customX !== undefined) {
      x = customX;
    } else if (isCrimson) {
      x = Math.random() * (this.width * 0.6) - margin;
    } else {
      x = this.width * 0.4 + Math.random() * (this.width * 0.6 + margin);
    }

    const y = customY !== undefined ? customY : Math.random() * this.height;

    return {
      x,
      y,
      originX: x,
      isCrimson,
      size: Math.random() * 2.8 + 1.0,
      vx: (Math.random() - 0.5) * 0.6 + (isCrimson ? 0.2 : -0.2),
      vy: -(Math.random() * 0.8 + 0.4),
      alpha: Math.random() * 0.7 + 0.2,
      maxAlpha: Math.random() * 0.7 + 0.3,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
      sparkle: Math.random() > 0.6
    };
  }

  triggerHandshakeBurst(centerX, centerY) {
    if (this.reducedMotion) return;
    const count = window.innerWidth < 768 ? 45 : 90;
    const cx = centerX !== undefined ? centerX : this.width / 2;
    const cy = centerY !== undefined ? centerY : this.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 6.5 + 2.5;
      const isCrimson = Math.random() > 0.5;

      this.burstParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        isCrimson,
        life: 1.0
      });
    }
  }

  setScrollProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress));
  }

  update() {
    const isTransformed = this.scrollProgress > 0.75;
    const transformRatio = Math.max(0, (this.scrollProgress - 0.75) / 0.25);

    // Update ambient particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.pulseSpeed;

      // Slight sine wave motion
      p.x += Math.sin(p.phase) * 0.3;

      // If world transforms, shift crimson particles toward warm amber/gold
      if (p.isCrimson && transformRatio > 0.1) {
        p.vx += (0.1 - p.vx) * 0.05;
      }

      // Reset when offscreen
      if (p.y < -20 || p.x < -40 || p.x > this.width + 40) {
        p.y = this.height + 15;
        if (p.isCrimson && transformRatio < 0.6) {
          p.x = Math.random() * (this.width * (0.6 - transformRatio * 0.3));
        } else {
          p.x = Math.random() * this.width;
        }
        p.alpha = 0;
      }

      // Smooth fade in / pulse
      if (p.alpha < p.maxAlpha) {
        p.alpha += 0.02;
      }
    }

    // Update burst collision particles
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const bp = this.burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vx *= 0.94; // Drag
      bp.vy *= 0.94;
      bp.life -= bp.decay;
      bp.alpha = Math.max(0, bp.life);

      if (bp.life <= 0) {
        this.burstParticles.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const transformRatio = Math.max(0, (this.scrollProgress - 0.75) / 0.25);

    // Draw ambient particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

      let color;
      if (p.isCrimson) {
        if (transformRatio > 0.4) {
          // Morphing to radiant amber
          color = `rgba(251, 191, 36, ${p.alpha * (0.8 + 0.2 * Math.sin(p.phase))})`;
        } else {
          color = `rgba(230, 35, 50, ${p.alpha * (0.7 + 0.3 * Math.sin(p.phase))})`;
        }
      } else {
        // Golden starlight
        color = `rgba(251, 219, 130, ${p.alpha * (0.8 + 0.2 * Math.sin(p.phase))})`;
      }

      this.ctx.fillStyle = color;
      this.ctx.shadowBlur = p.sparkle ? 12 : 5;
      this.ctx.shadowColor = p.isCrimson && transformRatio <= 0.4 ? '#e62332' : '#fbbf24';
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw burst collision particles
    for (const bp of this.burstParticles) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(bp.x, bp.y, bp.size * bp.life, 0, Math.PI * 2);

      const color = bp.isCrimson
        ? `rgba(244, 63, 94, ${bp.alpha})`
        : `rgba(253, 224, 71, ${bp.alpha})`;

      this.ctx.fillStyle = color;
      this.ctx.shadowBlur = 16;
      this.ctx.shadowColor = bp.isCrimson ? '#ff1e38' : '#ffe066';
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

window.ParticleEngine = ParticleEngine;
