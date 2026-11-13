import { content } from '../content';

/**
 * Ambient night sound. Uses a provided audio file if one is configured,
 * otherwise synthesises a very soft, slow pad with occasional glassy chimes.
 * Nothing plays until the visitor turns it on.
 */
class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private chimeTimer: number | null = null;
  playing = false;
  /** what is actually playing: the song file, or the generated hum */
  mode: 'file' | 'synth' | null = null;
  private fileFailed = false;

  async start() {
    if (this.playing) return;
    this.playing = true;
    if (content.optionalAudio.src && !this.fileFailed) {
      if (!this.audioEl) {
        this.audioEl = new Audio(content.optionalAudio.src);
        this.audioEl.loop = true;
        this.audioEl.volume = content.optionalAudio.volume;
      }
      try {
        await this.audioEl.play();
        this.mode = 'file';
        return;
      } catch {
        // file missing or unplayable: use the generated hum instead
        this.fileFailed = true;
        this.audioEl = null;
      }
    }
    this.mode = 'synth';
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!this.ctx) {
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1400;
      this.master.connect(lp).connect(this.ctx.destination);
      // soft pad: Dmaj9-ish, detuned sines with slow tremolo
      [146.83, 220, 277.18, 329.63, 440].forEach((f, i) => {
        const o = this.ctx!.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        o.detune.value = (i % 2 ? 1 : -1) * 4;
        const g = this.ctx!.createGain();
        g.gain.value = 0.05 / (1 + i * 0.4);
        const lfo = this.ctx!.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.023;
        const lg = this.ctx!.createGain();
        lg.gain.value = 0.02 / (1 + i * 0.4);
        lfo.connect(lg).connect(g.gain);
        o.connect(g).connect(this.master!);
        o.start();
        lfo.start();
      });
    }
    await this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master!.gain.cancelScheduledValues(t);
    this.master!.gain.setTargetAtTime(content.optionalAudio.volume, t, 1.2);
    this.scheduleChime();
  }

  private scheduleChime() {
    if (!this.ctx || !this.playing) return;
    this.chimeTimer = window.setTimeout(() => {
      this.chime();
      this.scheduleChime();
    }, 3500 + Math.random() * 6000);
  }

  chime() {
    if (!this.ctx || !this.master || !this.playing) return;
    const notes = [880, 987.77, 1108.73, 1318.51, 1479.98, 1760];
    const f = notes[Math.floor(Math.random() * notes.length)];
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = f;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.035, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 3.1);
  }

  stop() {
    this.playing = false;
    if (this.chimeTimer) window.clearTimeout(this.chimeTimer);
    this.mode = null;
    if (this.audioEl) this.audioEl.pause();
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    }
  }
}

export const ambient = new Ambient();
