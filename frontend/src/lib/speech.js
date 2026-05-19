import { Capacitor } from '@capacitor/core';

function rankVoice(voice) {
  const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  let score = voice.lang?.toLowerCase().startsWith('en') ? 10 : 0;
  if (name.includes('natural')) score += 20;
  if (name.includes('neural')) score += 20;
  if (name.includes('online')) score += 10;
  if (name.includes('google')) score += 8;
  if (name.includes('microsoft')) score += 8;
  if (name.includes('zira') || name.includes('aria') || name.includes('jenny') || name.includes('guy')) score += 6;
  if (voice.default) score += 2;
  return score;
}

export function getBestVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return [...voices].sort((a, b) => rankVoice(b) - rankVoice(a))[0];
}

export function hasNativeTts() {
  return typeof Capacitor?.isNativePlatform === 'function' && Capacitor.isNativePlatform();
}
