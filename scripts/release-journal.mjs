import fs from 'node:fs/promises'

const snapshots = new WeakMap()
export async function readJournal(file) {
  const text = await fs.readFile(file, 'utf8')
  const value = JSON.parse(text)
  snapshots.set(value, text)
  return value
}
export async function writeJournal(file, value) {
  const lockPath = `${file}.write-lock`
  let lock
  try {
    lock = await fs.open(lockPath, 'wx', 0o600)
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error('Release journal changed or is being written; retry the stage')
    throw error
  }
  try {
    let current
    try {
      current = await fs.readFile(file, 'utf8')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    const previous = snapshots.get(value)
    if (current !== previous) throw new Error('Release journal changed; reload before recording a receipt')
    const text = JSON.stringify(value, null, 2) + '\n'
    await fs.writeFile(`${file}.next`, text, { mode: 0o600 })
    await fs.rename(`${file}.next`, file)
    snapshots.set(value, text)
  } finally {
    await lock.close()
    await fs.unlink(lockPath)
  }
}
