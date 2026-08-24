export function wrapTermIndex(index, total) {
  if (!Number.isInteger(total) || total <= 0) return 0
  return ((index % total) + total) % total
}

export function visibleTermIndexes(current, total) {
  return [-2, -1, 0, 1, 2, 3].map((offset) => wrapTermIndex(current + offset, total))
}

export function shouldAutoRotate({
  autoPlay = false,
  reducedMotion = false,
  pageVisible = true,
  windowFocused = true,
  pointerInside = false,
  focusWithin = false,
} = {}) {
  return Boolean(
    autoPlay &&
      !reducedMotion &&
      pageVisible &&
      windowFocused &&
      !pointerInside &&
      !focusWithin,
  )
}
