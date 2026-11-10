/**
 * High-fidelity Procedural Web Audio Engine for Real Plastic Bubble Wrap
 * 
 * Accurately synthesizes the acoustic signature of bubble wrap:
 * 1. High-frequency snap / sharp film rupture transient (noise burst + bandpass filter)
 * 2. Low-frequency resonant air-cavity pop & depressurization (sine pitch drop)
 * 3. Subtle crinkle / plastic film rattle tail
 * 4. Micro pitch and frequency variations per pop for organic realism
 */

class BubbleAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isAmbientOn = false;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.isMuted && this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    } else if (!this.isMuted && this.isAmbientOn && this.ctx) {
      this.startAmbient();
    }
  }

  /**
   * Synthesize an authentic, satisfying bubble pop
   * @param {number} pitchFactor - slight variation multiplier (e.g. 0.9 - 1.15)
   * @param {number} intensity - volume/velocity multiplier (0.7 - 1.2)
   */
  playPop(pitchFactor = 1.0, intensity = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    // Micro-jitter to ensure no two pops ever sound identical
    const jitter = (Math.random() - 0.5) * 0.12;
    const currentPitch = Math.max(0.65, pitchFactor + jitter);

    // -------------------------------------------------------------
    // Component 1: Rapid pitch-drop resonant body pop (Air decompression)
    // -------------------------------------------------------------
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    // Start with higher resonant ping, rapidly diving to air thump
    const baseFreq = 480 * currentPitch;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * 2.8, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, t + 0.045);

    oscGain.gain.setValueAtTime(0.7 * intensity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);

    // -------------------------------------------------------------
    // Component 2: High-velocity Film Snap (Punctured polythene transient)
    // -------------------------------------------------------------
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.025); // 25ms burst
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200 * currentPitch, t);
    noiseFilter.Q.setValueAtTime(2.5, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9 * intensity, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.005, t + 0.035);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.04);

    // -------------------------------------------------------------
    // Component 3: Subtle Sub-bass 'Thump' for tactile punch
    // -------------------------------------------------------------
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140 * currentPitch, t);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.05);

    subGain.gain.setValueAtTime(0.4 * intensity, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);

    subOsc.start(t);
    subOsc.stop(t + 0.055);
  }

  /**
   * Fanfare / Musical celebratory chime when all bubbles are popped
   */
  playCelebration() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    const startTime = this.ctx.currentTime + 0.05;

    notes.forEach((freq, idx) => {
      const noteTime = startTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.28, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.7);
    });
  }

  /**
   * Reset / Sheet unroll sound
   */
  playSheetReset() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.12);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.22);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.23);
  }

  /**
   * Zen ambient relaxation tone generator
   */
  toggleAmbient(enable) {
    this.isAmbientOn = enable;
    if (!enable) {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
      }
      return;
    }
    if (this.isMuted) return;
    this.startAmbient();
  }

  startAmbient() {
    this.init();
    if (!this.ctx) return;

    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch (e) {}
    }

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(174.61, t); // F3 calming frequency
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(261.63, t); // C4

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.035, t + 1.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);

    this.ambientOsc = osc1;
    this.ambientGain = gain;
  }
}

// Global audio engine singleton
window.bubbleAudio = new BubbleAudioEngine();

