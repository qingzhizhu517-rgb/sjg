const DB = 'sjg-sandbox-drafts'
function openDB() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error('此浏览器不支持本地草稿，请导出 JSON'))
      return
    }
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('drafts')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('无法打开本地草稿'))
  })
}
export async function draftStorage(action, value) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', action === 'get' ? 'readonly' : 'readwrite')
    const store = tx.objectStore('drafts')
    const request = action === 'get' ? store.get('current') : store.put(value, 'current')
    tx.oncomplete = () => {
      db.close()
      resolve(request.result)
    }
    tx.onerror = () => {
      db.close()
      reject(new Error('本地草稿读写失败，请导出 JSON'))
    }
    tx.onabort = tx.onerror
  })
}
