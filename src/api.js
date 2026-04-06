const API = import.meta.env.VITE_API_URL || 'http://localhost:3001' || 'http://192.168.1.21:3000';

export async function sendCommand(type, payload) {
  const res = await fetch(`${API}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload }),
  });
  return res.json();
}

export async function getLatestResult() {
  const res = await fetch(`${API}/result/latest`);
  return res.json();
}

export async function getStatus() {
  const res = await fetch(`${API}/status`);
  return res.json();
}

export async function getGoogleStatus() {
  const res = await fetch(`${API}/auth/google/status`);
  return res.json();
}

export function getGoogleAuthUrl() {
  return `${API}/auth/google`;
}

export async function disconnectGoogle() {
  const res = await fetch(`${API}/auth/google/disconnect`, { method: 'POST' });
  return res.json();
}
