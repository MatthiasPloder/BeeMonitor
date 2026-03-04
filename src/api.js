const API_BASE = import.meta.env.VITE_API_BASE?.trim() || 'http://localhost:5000';

import { demoState } from './demoData.js';

async function _fetchDemo() {
  return demoState; // sofort verfügbar, kein await nötig – aber darf async bleiben
}


export async function fetchLatest(hiveId=1) {
  if (API_BASE) {
    const r = await fetch(`${API_BASE}/api/v1/measurements/latest?hiveId=${hiveId}`);
    return r.json();
  }
  const demo = await _fetchDemo();
  return demo.latest;
}

export async function fetchSeries(hiveId=1, sinceISO) {
  if (API_BASE) {
    const url = new URL(`${API_BASE}/api/v1/measurements`);
    url.searchParams.set('hiveId', hiveId);
    if (sinceISO) url.searchParams.set('since', sinceISO);
    const r = await fetch(url);
    return r.json();
  }
  const demo = await _fetchDemo();
  return demo.series;
}

// Hive-Daten laden
export async function fetchDemo() {
  return _fetchDemo();
}

export async function fetchHives() {
  const demo = await fetchDemo();
  return demo.hives;
}

export async function fetchHive(id) {
  const demo = await fetchDemo();
  return demo.hives.find(h => h.id === id);
}

// Authentifizierungs-API
export async function login(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Login fehlgeschlagen');
  }

  // Speichere Token
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
}

export async function register(username, email, password) {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Registrierung fehlgeschlagen');
  }

  // Speichere Token
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
}
