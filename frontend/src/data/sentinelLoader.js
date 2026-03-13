// Utility to load Sentinel data from black box/output/
// Falls back to embedded sample data for demo resilience

const SAMPLE_TELEMETRY = Array.from({ length: 120 }, (_, i) => {
  const t = i * 0.5;
  const isHrSpike = t >= 10 && t <= 15;
  const isSpo2Drop = t >= 30 && t <= 35;
  const hr = (isHrSpike ? 115 : 75) + (Math.random() - 0.5) * 4;
  const spo2 = Math.min(100, (isSpo2Drop ? 88 : 98) + (Math.random() - 0.5) * 1.5);
  const bp = 120 + (Math.random() - 0.5) * 10;
  const motion = Math.random() * (t > 20 && t < 22 ? 45 : 8);
  const tags = [];
  if (hr > 110) tags.push({ type: 'HR_SPIKE', message: 'CRITICAL: Tachycardia Detected', reason: `Heart rate reached ${hr.toFixed(1)} BPM (>110)` });
  if (spo2 < 92) tags.push({ type: 'SPO2_DROP', message: 'WARNING: Desaturation Detected', reason: `SpO2 dropped to ${spo2.toFixed(1)}% (<92%)` });
  if (motion > 30) tags.push({ type: 'MOTION_ANOMALY', message: 'ANOMALY: Erratic Movement', reason: `Visual motion score ${motion.toFixed(2)} exceeds threshold (30)` });
  return {
    timestamp: Math.round(t * 1000) / 1000,
    heart_rate: Math.round(hr * 10) / 10,
    spo2: Math.round(spo2 * 10) / 10,
    bp_sys: Math.round(bp * 10) / 10,
    motion_score: Math.round(motion * 100) / 100,
    frame_idx: i,
    tags,
  };
});

function generateHash() {
  const chars = '0123456789abcdef';
  let h = '';
  for (let i = 0; i < 64; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

const SAMPLE_AUDIT = SAMPLE_TELEMETRY.map((t, i) => ({
  timestamp: t.timestamp,
  data_hash: generateHash(),
  prev_hash: i === 0 ? '0'.repeat(64) : undefined,
}));
SAMPLE_AUDIT.forEach((a, i) => { if (i > 0) a.prev_hash = SAMPLE_AUDIT[i - 1].data_hash; });

export async function loadTelemetry(basePath = '') {
  try {
    const res = await fetch(`${basePath}/telemetry.json?t=${Date.now()}`);
    if (res.ok) return await res.json();
  } catch (_) { /* fallback */ }
  return SAMPLE_TELEMETRY;
}

export async function loadAuditTrail(basePath = '') {
  try {
    const res = await fetch(`${basePath}/audit_trail.json?t=${Date.now()}`);
    if (res.ok) return await res.json();
  } catch (_) { /* fallback */ }
  return SAMPLE_AUDIT;
}

export async function loadSessions(basePath = '') {
  try {
    const res = await fetch(`${basePath}/sessions.json?t=${Date.now()}`);
    if (res.ok) return await res.json();
  } catch (_) { /* fallback */ }
  return null;
}

export { SAMPLE_TELEMETRY, SAMPLE_AUDIT };
