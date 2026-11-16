export const buildKpis = (summary = {}) => {
  const totals = summary.totals || {}
  const pending = summary.pending || {}
  return [
    { key: 'poets', label: '诗人', value: totals.poets || 0, route: '/poets' },
    { key: 'spots', label: '景点', value: totals.spots || 0, route: '/spots' },
    { key: 'poems', label: '诗词', value: totals.poems || 0, route: '/poems' },
    { key: 'events', label: '事件', value: totals.events || 0, route: '/events' },
    { key: 'users', label: '用户', value: totals.users || 0, route: '/users' },
    { key: 'pendingUsers', label: '待审批', value: pending.users || 0, route: '/users?status=pending' },
  ]
}

export const maxDistributionValue = (items = [], key = 'count') => {
  const max = items.reduce((value, item) => Math.max(value, Number(item?.[key]) || 0), 0)
  return Math.max(max, 1)
}

export const qualityRoute = (metric = {}) => {
  if (!metric.route) return '/'
  if (!metric.filter) return metric.route
  const separator = metric.route.includes('?') ? '&' : '?'
  return `${metric.route}${separator}quality=${encodeURIComponent(metric.filter)}`
}
