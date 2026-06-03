export const safeStorage = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key)
      return val ? JSON.parse(val) : fallback
    } catch {
      return fallback
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch {
      // Storage full or unavailable - silently fail
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch {}
  }
}
