// A tour advances only through explicit foreground frame time; no background timers.
export function createTour(stops, duration = 8) {
  let status = 'idle',
    index = 0,
    elapsed = 0
  const snapshot = () => ({
    status,
    index,
    total: stops.length,
    city: status === 'idle' ? null : stops[index],
  })
  return {
    snapshot,
    start(automatic = true) {
      if (!stops.length) return snapshot()
      index = 0
      elapsed = 0
      status = automatic ? 'playing' : 'paused'
      return snapshot()
    },
    pause() {
      if (status === 'playing') status = 'paused'
      return snapshot()
    },
    resume() {
      if (status === 'paused') {
        status = 'playing'
        elapsed = 0
      }
      return snapshot()
    },
    stop() {
      status = 'idle'
      index = 0
      elapsed = 0
      return snapshot()
    },
    move(delta) {
      if (status === 'idle' || !Number.isInteger(delta)) return snapshot()
      index = Math.max(0, Math.min(stops.length - 1, index + delta))
      elapsed = 0
      if (status === 'complete') status = 'paused'
      return snapshot()
    },
    step(dt) {
      if (status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return null
      elapsed += dt
      if (elapsed < duration) return null
      elapsed = 0
      if (index === stops.length - 1) status = 'complete'
      else index++
      return snapshot()
    },
  }
}
