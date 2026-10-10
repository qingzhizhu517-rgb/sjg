// Leave local development on Vite's proxy; production can call the hosted API.
export function apiUrl(path) {
  const origin = (import.meta.env?.VITE_BACKEND_URL || '').replace(/\/+$/, '')
  return origin + path
}
