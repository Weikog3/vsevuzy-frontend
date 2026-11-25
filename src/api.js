const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

async function request(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const listPrograms = (query = '') => request(`/programs${query}`);

export const getProgram = (id) => request(`/programs/${id}`);