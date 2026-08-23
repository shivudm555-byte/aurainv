// ==========================================================================
// 2026 Fintech Mobile App - Haptic & Audio Synthesis Engine
// ==========================================================================

const Haptics = {
  enabled: true,
  audioCtx: null,

  init() {
    // Lazy initialize AudioContext on first user interaction
    const unlockAudio = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
  },

  toggle(enable = null) {
    this.enabled = enable !== null ? enable : !this.enabled;
    if (this.enabled) {
      this.playTone(800, 0.05, 'sine', 0.1);
    }
    return this.enabled;
  },

  vibrate(pattern = [15]) {
    if (!this.enabled) return;
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  },

  playTone(freq, duration, type = 'sine', volume = 0.1) {
    if (!this.enabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  },

  // Subtle tap feedback for buttons and tabs
  tap() {
    this.vibrate([10]);
    this.playTone(600, 0.03, 'sine', 0.04);
  },

  // Light feedback for digit entry / chip selection
  tick() {
    this.vibrate([8]);
    this.playTone(950, 0.02, 'triangle', 0.03);
  },

  // Success chime for completed transactions, deposits, investments, KYC
  success() {
    this.vibrate([20, 50, 20]);
    if (!this.enabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      // High pleasant major chord arpeggio
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.08, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.35);
      });
    } catch (e) {}
  },

  // Subtle error buzz
  error() {
    this.vibrate([40, 40, 40]);
    this.playTone(180, 0.18, 'sawtooth', 0.08);
  },

  // Biometric laser scan chirp
  scan() {
    this.vibrate([15, 30, 15]);
    if (!this.enabled) return;
    try {
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }
};

window.Haptics = Haptics;
Haptics.init();
