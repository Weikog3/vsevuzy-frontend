const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';
const PAGE_SIZE = 100;

async function request(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const listPrograms = (query = '') => request(`/programs${query}`);

// The API caps `limit` at 100, so walk pages until the last one.
export async function listAllPrograms() {
  const programs = [];
  for (let offset = 0; offset < 10000; offset += PAGE_SIZE) {
    const page = await request(`/programs?limit=${PAGE_SIZE}&offset=${offset}`);
    programs.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return programs;
}

export const getProgram = (id) => request(`/programs/${id}`);