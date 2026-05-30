const STORAGE_KEY = 'menumind-performance-mode';

export function getDevicePerformanceProfile() {
  const memoryGb = Number(navigator.deviceMemory || 0);
  const cpuCores = Number(navigator.hardwareConcurrency || 0);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  const lowMemory = memoryGb > 0 && memoryGb <= 4;
  const lowCpu = cpuCores > 0 && cpuCores <= 4;

  return {
    memoryGb,
    cpuCores,
    reducedMotion,
    shouldReduceEffects: reducedMotion || lowMemory || lowCpu,
    label: [
      memoryGb ? `${memoryGb}GB RAM` : 'RAM unknown',
      cpuCores ? `${cpuCores} cores` : 'CPU unknown',
      reducedMotion ? 'reduced motion' : null,
    ].filter(Boolean).join(' / '),
  };
}

export function getInitialPerformanceMode() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'on') return true;
  if (saved === 'off') return false;
  return getDevicePerformanceProfile().shouldReduceEffects;
}

export function storePerformanceMode(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
}
