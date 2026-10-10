// Fetches the generated plan. Serve this folder over http (see tools/serve.mjs) so
// the page may read .build/plan.json; falls back to an inlined copy for file:// use.
export async function loadPlan() {
  const url = new URL('../../.build/plan.json', import.meta.url)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`plan fetch failed: ${res.status} ${url}`)
  return res.json()
}
