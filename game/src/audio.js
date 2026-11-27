// audio.js — every sound is synthesized with WebAudio: no audio files, no network.
// A gobble, a jump whoosh, a corn chime, a thud, the farmer's shout, and short
// jingles for escape and capture. Created lazily on first user gesture.
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.musicTimer = null;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.35;
  }

  tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol, when = 0, lowpass = 1200) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  gobble() {
    // Two quick descending clucks, the turkey's own voice.
    this.tone(520, 0.09, 'square', 0.22, 0, 340);
    this.tone(430, 0.09, 'square', 0.22, 0.11, 280);
    this.tone(360, 0.14, 'square', 0.2, 0.23, 220);
  }

  jump() {
    this.noise(0.16, 0.14, 0, 2600);
    this.tone(300, 0.16, 'sine', 0.12, 0, 620);
  }

  corn() {
    this.tone(880, 0.09, 'sine', 0.2);
    this.tone(1318, 0.14, 'sine', 0.18, 0.07);
  }

  thud() {
    this.noise(0.18, 0.3, 0, 500);
    this.tone(120, 0.2, 'sine', 0.3, 0, 55);
  }

  hide() {
    this.tone(660, 0.08, 'triangle', 0.16);
    this.tone(990, 0.12, 'triangle', 0.16, 0.08);
  }

  farmerShout() {
    this.tone(180, 0.28, 'sawtooth', 0.25, 0, 90);
    this.tone(150, 0.2, 'sawtooth', 0.2, 0.3, 80);
  }

  spotted() {
    this.tone(740, 0.1, 'square', 0.18);
    this.tone(740, 0.1, 'square', 0.18, 0.13);
  }

  escapeFanfare() {
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((freq, i) => this.tone(freq, 0.22, 'triangle', 0.22, i * 0.14));
  }

  caughtLament() {
    const notes = [392, 370, 349, 311];
    notes.forEach((freq, i) => this.tone(freq, 0.3, 'sawtooth', 0.16, i * 0.22));
  }

  click() {
    this.tone(700, 0.05, 'sine', 0.14);
  }
}
