/**
 * Cache local con localStorage.
 * Guarda datos de Firestore para acceso instantáneo offline.
 */

export function saveCache(key, data) {
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({ data, ts: Date.now() }))
  } catch (e) {
    console.warn('Cache write error:', e)
  }
}

export function loadCache(key) {
  try {
    const raw = localStorage.getItem(`cache_${key}`)
    if (!raw) return null
    return JSON.parse(raw).data
  } catch {
    return null
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(`cache_${key}`)
  } catch {}
}
