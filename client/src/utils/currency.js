export function clampNum(n, min, max) {
  const x = Number(n || 0)
  return Math.max(min, Math.min(max, x))
}
