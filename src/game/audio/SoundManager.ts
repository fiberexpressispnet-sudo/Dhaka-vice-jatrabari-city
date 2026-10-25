/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVol: number = 0.8;
  private musicVol: number = 0.5;
  
  // Bike engine nodes
  private engineGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;

  // Radio synthesizer
  private radioGain: GainNode | null = null;
  private radioInterval: number | null = null;
  private currentRadioTrack: number = 0;
  private radioPlaying: boolean = false;
  public readonly radioTracks = [
    { titleBn: 'কারওয়ান বাজার ফানক', titleEn: 'Karwan Bazar Funk', bpm: 116 },
    { titleBn: 'ধানমন্ডি নাইট ড্রাইভ', titleEn: 'Dhanmondi Night Drive', bpm: 124 },
    { titleBn: 'সিন্ডিকেট চেজ', titleEn: 'Syndicate Chase 140', bpm: 132 },
  ];

  constructor() {
    // Initialized on first user interaction to comply with browser autoplay policy
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setValueAtTime(muted ? 0 : this.sfxVol * 0.25, this.ctx.currentTime);
    }
    if (this.radioGain && this.ctx) {
      this.radioGain.gain.setValueAtTime(muted ? 0 : this.musicVol * 0.35, this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVol = Math.max(0, Math.min(1, vol));
  }

  public setMusicVolume(vol: number) {
    this.musicVol = Math.max(0, Math.min(1, vol));
    if (this.radioGain && this.ctx && !this.isMuted) {
      this.radioGain.gain.setValueAtTime(this.musicVol * 0.35, this.ctx.currentTime);
    }
  }

  // --- MOTORCYCLE ENGINE SYNTHESIS ---
  public startMotorcycleEngine() {
    this.initContext();
    if (!this.ctx || this.isEngineRunning) return;

    try {
      const t = this.ctx.currentTime;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVol * 0.22, t);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(260, t);
      this.engineFilter.Q.setValueAtTime(3.5, t);

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.setValueAtTime(45, t); // Idle RPM

      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.setValueAtTime(90, t);

      if (this.engineFilter) {
        this.engineOsc1.connect(this.engineFilter);
        this.engineOsc2.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
      } else {
        this.engineOsc1.connect(this.engineGain);
        this.engineOsc2.connect(this.engineGain);
      }

      this.engineGain.connect(this.ctx.destination);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
    } catch {
      // Audio fallback
    }
  }

  public updateMotorcycleEngine(speedRatio: number, isThrottle: boolean) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter) return;

    const baseFreq = 48 + speedRatio * 140 + (isThrottle ? 25 : 0);
    const filterFreq = 240 + speedRatio * 850 + (isThrottle ? 200 : 0);
    const t = this.ctx.currentTime + 0.05;

    this.engineOsc1.frequency.setTargetAtTime(baseFreq, t, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, t, 0.08);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, t, 0.08);
  }

  public stopMotorcycleEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc1) {
        this.engineOsc1.stop();
        this.engineOsc1.disconnect();
        this.engineOsc1 = null;
      }
      if (this.engineOsc2) {
        this.engineOsc2.stop();
        this.engineOsc2.disconnect();
        this.engineOsc2 = null;
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
        this.engineGain = null;
      }
      this.isEngineRunning = false;
    } catch {
      this.isEngineRunning = false;
    }
  }

  // --- HORN: DHAKA "প্যাঁ প্যাঁ" DUAL-TONE HORN ---
  public playHorn() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVol * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(392, t); // G4

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(466, t); // Bb4

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.35);
    osc2.stop(t + 0.35);
  }

  // --- FOOTSTEP ---
  public playFootstep() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.07);

    gain.gain.setValueAtTime(this.sfxVol * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // --- IMPACT / PUNCH ---
  public playPunchImpact() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

    gain.gain.setValueAtTime(this.sfxVol * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // --- VEHICLE CRASH / COLLISION SOUND ---
  private lastCrashSoundTime: number = 0;

  public playVehicleCollision(distToPlayer: number = 0) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    // Throttle multiple simultaneous crashes to avoid audio clipping
    const now = performance.now();
    if (now - this.lastCrashSoundTime < 80) return;
    this.lastCrashSoundTime = now;

    const t = this.ctx.currentTime;

    // Attenuate volume with distance from player (full volume within 12m, drops off until 80m)
    const distFactor = Math.max(0.12, 1 - Math.min(1.0, distToPlayer / 75));
    const effectiveVol = this.sfxVol * 0.75 * distFactor;

    // 1. Heavy physical impact thud (low sine drop)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(160, t);
    thudOsc.frequency.exponentialRampToValueAtTime(32, t + 0.25);

    thudGain.gain.setValueAtTime(effectiveVol, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    thudOsc.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thudOsc.start(t);
    thudOsc.stop(t + 0.25);

    // 2. Metal crumple / crunch noise burst
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(240, t + 0.2);
      filter.Q.setValueAtTime(2.2, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(effectiveVol * 0.65, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(t);
    } catch {
      // Audio fallback
    }

    // 3. High metallic ring / scrape
    const metalOsc = this.ctx.createOscillator();
    const metalGain = this.ctx.createGain();
    metalOsc.type = 'sawtooth';
    metalOsc.frequency.setValueAtTime(360, t);
    metalOsc.frequency.exponentialRampToValueAtTime(90, t + 0.15);

    metalGain.gain.setValueAtTime(effectiveVol * 0.35, t);
    metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    metalOsc.connect(metalGain);
    metalGain.connect(this.ctx.destination);
    metalOsc.start(t);
    metalOsc.stop(t + 0.15);
  }

  // --- UI CLICK ---
  public playClick() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(this.sfxVol * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // --- MISSION FANFARE ---
  public playMissionComplete() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = startTime + idx * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(this.sfxVol * 0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // --- PROCEDURAL RADIO: DHAKA 98.4 FM ---
  public toggleRadio(): boolean {
    if (this.radioPlaying) {
      this.stopRadio();
      return false;
    } else {
      this.startRadio();
      return true;
    }
  }

  public nextRadioTrack(): number {
    this.currentRadioTrack = (this.currentRadioTrack + 1) % this.radioTracks.length;
    if (this.radioPlaying) {
      this.stopRadio();
      this.startRadio();
    }
    return this.currentRadioTrack;
  }

  public getRadioTrack() {
    return this.radioTracks[this.currentRadioTrack];
  }

  public isRadioActive(): boolean {
    return this.radioPlaying;
  }

  public startRadio() {
    this.initContext();
    if (!this.ctx || this.radioPlaying) return;

    this.radioPlaying = true;
    const track = this.radioTracks[this.currentRadioTrack];
    const beatDuration = (60 / track.bpm) * 1000;
    let step = 0;

    // Bassline notes frequencies (A minor / D minor groove)
    const bassPatterns = [
      [110, 110, 130.81, 146.83, 110, 164.81, 146.83, 130.81],
      [146.83, 146.83, 174.61, 196.0, 146.83, 220, 196.0, 174.61],
      [98.0, 98.0, 123.47, 146.83, 98.0, 164.81, 146.83, 123.47],
    ];
    const pattern = bassPatterns[this.currentRadioTrack % bassPatterns.length];

    this.radioGain = this.ctx.createGain();
    this.radioGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVol * 0.3, this.ctx.currentTime);
    this.radioGain.connect(this.ctx.destination);

    this.radioInterval = window.setInterval(() => {
      if (!this.ctx || !this.radioPlaying || this.isMuted) return;

      const t = this.ctx.currentTime;
      const currentNote = pattern[step % pattern.length];
      step++;

      // Bass note
      const bassOsc = this.ctx.createOscillator();
      const bassEnv = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(currentNote, t);

      bassEnv.gain.setValueAtTime(0.3, t);
      bassEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      bassOsc.connect(bassEnv);
      if (this.radioGain) bassEnv.connect(this.radioGain);
      bassOsc.start(t);
      bassOsc.stop(t + 0.23);

      // Procedural kick beat on 1 and 5
      if (step % 2 === 1) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(140, t);
        kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

        kickGain.gain.setValueAtTime(0.4, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        kickOsc.connect(kickGain);
        if (this.radioGain) kickGain.connect(this.radioGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.13);
      }

      // Snare / clap on even steps
      if (step % 4 === 2) {
        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(900, t);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        if (this.radioGain) noiseGain.connect(this.radioGain);
        noise.start(t);
      }
    }, beatDuration / 2);
  }

  public stopRadio() {
    this.radioPlaying = false;
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }
    if (this.radioGain) {
      this.radioGain.disconnect();
      this.radioGain = null;
    }
  }

  public dispose() {
    this.stopMotorcycleEngine();
    this.stopRadio();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
  }
}

export const sounds = new SoundManager();
