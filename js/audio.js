/**
 * ANIMEVERSE — Procedural Cinematic Ambient Sound Engine (Web Audio API)
 * Zero external audio dependencies. Generates subtle atmospheric drones,
 * golden dawn pad harmonics, and a cinematic sub-bass impact for the handshake.
 */

class CinematicAudioEngine {
  constructor() {
    this.ctx = null;
    this.isEnabled = false;
    this.masterGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneGain = null;
    this.filter = null;
    this.lastImpactTime = 0;

    // Check user interaction before AudioContext
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Low pass filter for warm, non-harsh cinematic texture
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(2.0, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Drone Oscillator 1: Deep C2 / 65.4Hz
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = "sawtooth";
      this.droneOsc1.frequency.setValueAtTime(65.4, this.ctx.currentTime);

      // Drone Oscillator 2: Detuned sub-octave C1 / 32.7Hz
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(32.7, this.ctx.currentTime);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.droneOsc1.connect(this.droneGain);
      this.droneOsc2.connect(this.droneGain);
      this.droneGain.connect(this.filter);

      this.droneOsc1.start();
      this.droneOsc2.start();

      this.initialized = true;
    } catch (e) {
      console.warn("AudioContext initialization prevented:", e);
    }
  }

  toggle() {
    if (!this.initialized) {
      this.init();
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isEnabled = !this.isEnabled;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isEnabled ? 0.35 : 0;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 1.2);
    }

    return this.isEnabled;
  }

  updateScrollTone(progress) {
    if (!this.initialized || !this.ctx || !this.isEnabled) return;
    // As scroll goes from 0 (Abyss) to 1 (Elysium), open filter cutoff to create brightness
    const now = this.ctx.currentTime;
    const targetFreq = 180 + progress * 580; // 180Hz dark to 760Hz shimmering warm
    this.filter.frequency.setTargetAtTime(targetFreq, now, 0.2);
  }

  triggerImpact() {
    if (!this.initialized || !this.ctx || !this.isEnabled) return;
    const now = this.ctx.currentTime;
    if (now - this.lastImpactTime < 3.0) return; // Prevent spamming
    this.lastImpactTime = now;

    try {
      // Sub-bass hit
      const boom = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();

      boom.type = "sine";
      boom.frequency.setValueAtTime(110, now);
      boom.frequency.exponentialRampToValueAtTime(36, now + 0.9);

      boomGain.gain.setValueAtTime(0.45, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      boom.connect(boomGain);
      boomGain.connect(this.masterGain);

      boom.start(now);
      boom.stop(now + 2.0);

      // Celestial shimmer chord (F# - A# - C# - F)
      const chordFreqs = [369.99, 466.16, 554.37, 698.46];
      chordFreqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.06, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.04);
        osc.stop(now + 3.5);
      });
    } catch (e) {
      console.warn("Handshake impact sound error:", e);
    }
  }
}

window.cinematicAudio = new CinematicAudioEngine();
