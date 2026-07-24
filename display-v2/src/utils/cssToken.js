/**
 * Read a CSS custom property value from :root (computed).
 * Works at call-time, so always reflects the current theme.
 *
 * @param {string} name  CSS variable name, e.g. '--accent'
 * @returns {string}     Trimmed computed value
 */
export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Read a CSS variable that resolves to a color and return it
 * with a custom alpha channel.
 *
 * Handles hex (#RRGGBB) and rgb/rgba inputs.
 *
 * @param {string} cssVarName  CSS variable name
 * @param {number} alpha       0–1 alpha value
 * @returns {string}           rgba(...) string
 */
export function cssVarAlpha(cssVarName, alpha) {
  const val = cssVar(cssVarName)
  return colorAlpha(val, alpha)
}

/**
 * Convert any CSS color string to rgba with a given alpha.
 * Supports: #RGB, #RRGGBB, rgb(), rgba(), named colors (via canvas).
 *
 * @param {string} color  CSS color string
 * @param {number} alpha  0–1 alpha value
 * @returns {string}      rgba(...) string
 */
export function colorAlpha(color, alpha) {
  if (!color) return `rgba(0,0,0,${alpha})`

  // #RRGGBB
  const hex6 = color.match(/^#([0-9a-f]{6})$/i)
  if (hex6) {
    const r = parseInt(hex6[1].substring(0, 2), 16)
    const g = parseInt(hex6[1].substring(2, 4), 16)
    const b = parseInt(hex6[1].substring(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  // #RGB
  const hex3 = color.match(/^#([0-9a-f]{3})$/i)
  if (hex3) {
    const r = parseInt(hex3[1][0] + hex3[1][0], 16)
    const g = parseInt(hex3[1][1] + hex3[1][1], 16)
    const b = parseInt(hex3[1][2] + hex3[1][2], 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  // rgba(r,g,b,a) or rgb(r,g,b) – replace alpha
  const rgba = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgba) {
    return `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${alpha})`
  }

  // Fallback: return as-is (handles computed color-mix values like "rgba(184, 134, 11, 0.08)")
  return color
}
