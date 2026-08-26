const topPosition = (left = 0, top = 0) => ({
  left: Number.isFinite(left) ? left : 0,
  top: Number.isFinite(top) ? top : 0,
  behavior: 'auto',
})

/**
 * Resolve the scroll position after a route transition.
 *
 * New pages always start at the top immediately. Browser history restores the
 * saved coordinates, while query/hash-only changes keep the current position.
 */
export function resolveRouteScroll(to, from, savedPosition) {
  if (savedPosition) {
    return topPosition(savedPosition.left, savedPosition.top)
  }

  if (!from || to?.path !== from.path) {
    return topPosition()
  }

  return false
}
