export function releaseOrder(config) {
  const order = [],
    active = new Set(),
    visited = new Set()
  function visit(name) {
    if (!config.services[name]) throw new Error(`Unknown service dependency: ${name}`)
    if (active.has(name)) throw new Error('Release dependency cycle')
    if (visited.has(name)) return
    active.add(name)
    for (const dependency of config.services[name].dependsOn || []) visit(dependency)
    active.delete(name)
    visited.add(name)
    order.push(name)
  }
  for (const name of Object.keys(config.services)) visit(name)
  return order
}

export function validateReleaseConfig(config) {
  if (config.schemaVersion !== 1 || !config.railway?.projectId || !config.railway?.environmentId)
    throw new Error('Invalid release configuration')
  const ids = new Set()
  for (const service of Object.values(config.services)) {
    if (service.url) {
      const url = new URL(service.url)
      if (url.protocol !== 'https:' || url.origin !== service.url || url.username || url.password)
        throw new Error('Release targets must be HTTPS origins without credentials')
    }
    if (service.provider === 'sites') {
      if (!service.projectId || ids.has(service.projectId))
        throw new Error('Duplicate or absent Site identity')
      ids.add(service.projectId)
    } else if (service.provider !== 'railway' || !service.serviceId)
      throw new Error('Invalid Railway identity')
  }
  if (config.publicAssetsOrigin && new URL(config.publicAssetsOrigin).protocol !== 'https:')
    throw new Error('Assets must use HTTPS')
  releaseOrder(config)
  return config
}

export function frontendEnvironment(config) {
  return {
    VITE_BACKEND_URL: config.services.backend.url,
    VITE_DATAV_URL: config.services['sjg-datav'].url,
    VITE_OSS_BUCKET_URL: config.publicAssetsOrigin || '',
  }
}

export function relocateSharedLock(original) {
  const lock = structuredClone(original)
  lock.packages[''].dependencies['@sjg/shared'] = 'file:./shared'
  lock.packages['node_modules/@sjg/shared'].resolved = 'shared'
  lock.packages.shared = lock.packages['../shared']
  delete lock.packages['../shared']
  return lock
}
