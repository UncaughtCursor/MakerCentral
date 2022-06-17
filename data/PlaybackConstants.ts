// Adapted legacy code from Maestro 1

export const KEY_A4 = 69;
export const KEY_C4 = 60;
export const KEY_C5 = 72;

export const defaultPlaybackPPQ = 2520;

export const SAMPLE_RATE = 44100;
export const MASTER_VOLUME = 0.15;

export const DEFAULT_SUSTAIN_TIME = Math.round((12000 / 44100) * SAMPLE_RATE);
export const RELEASE_DURATION = Math.round((6000 / 44100) * SAMPLE_RATE);

export const LOAD_DELAY = 0.25;
export const END_DELAY = 3;
