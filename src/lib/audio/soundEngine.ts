// ============================================================================
// Web Audio API Trader Sound Engine
// Synthesizes pleasant institutional terminal auditory cues for trades and alerts
// ============================================================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("nepse_sound_muted", muted ? "true" : "false");
      } catch {}
    }
  }

  public getMuted(): boolean {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("nepse_sound_muted");
        if (saved !== null) {
          this.isMuted = saved === "true";
        }
      } catch {}
    }
    return this.isMuted;
  }

  /**
   * Subtle soft click on price ticks
   */
  public playTick(isUp: boolean) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const freq = isUp ? 880 : 587.33; // A5 for up, D5 for down
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  /**
   * Distinct two-tone chime when an order is executed
   */
  public playOrderExecuted() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "triangle";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5

      osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25); // C6

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);
    } catch {}
  }

  /**
   * Alert chime when a price target or stop-loss is triggered
   */
  public playAlert() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174.66, now + 0.08); // D6
      osc.frequency.setValueAtTime(880, now + 0.16);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
