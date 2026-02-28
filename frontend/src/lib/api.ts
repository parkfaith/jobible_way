import { auth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function request(path: string, options?: RequestInit) {
  const token = await auth.currentUser?.getIdToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      message = await res.text()
    } catch { /* ignore */ }
    throw new Error(message)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : {}
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: unknown) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body: unknown) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path: string) => request(path, { method: 'DELETE' }),
}
