const eventData = (event) => event
  .split(/\r?\n/)
  .filter(line => line.startsWith('data:'))
  .map(line => line.slice(5).trimStart())
  .join('\n')
  .trim()

export function consumeSseBuffer(buffer, flush = false) {
  const normalized = String(buffer || '').replace(/\r\n/g, '\n')
  const complete = normalized ? normalized.split('\n\n') : []
  const rest = flush ? '' : (complete.pop() || '')
  return {
    events: complete.map(eventData).filter(Boolean),
    rest,
  }
}
