// Central API client. Configure base via VITE_API_BASE (e.g. http://localhost:4000)
const BASE = import.meta.env.VITE_API_BASE || '';

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : BASE + path;
  const res = await fetch(url, options);
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  if (!res.ok) {
    const message = (data && data.error) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export function authHeaders(token) {
  return token ? { Authorization: 'Bearer ' + token } : {};
}
