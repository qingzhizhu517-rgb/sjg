// 路由反馈纯函数：导航方向判定 + 顶部进度条状态机。
// 方向基于 history.state.position（vue-router HTML5 模式维护的递增栈指针）。

// 返回 'forward' | 'back' | 'fade'
export const resolveNavDirection = (prevPos, nextPos) => {
  if (prevPos == null || nextPos == null || prevPos === nextPos) return 'fade'
  return nextPos > prevPos ? 'forward' : 'back'
}

// 顶部进度条状态机（nprogress 风格细流）：start 起步 0.08，tick 缓增逼近 0.9 不触顶，
// finish 直接收满，reset 归隐。时间源注入以便测试。
export const createProgress = ({ now = () => Date.now(), tickMs = 200 } = {}) => {
  let value = 0
  let startedAt = null
  return {
    start() {
      value = 0.08
      startedAt = now()
    },
    tick() {
      if (startedAt == null || value >= 0.9 || value === 1) return
      const elapsed = Math.max(0, now() - startedAt)
      const steps = Math.floor(elapsed / tickMs)
      // 细流：每 tick 增量按剩余距离衰减
      value = Math.min(0.9, 0.08 + (0.9 - 0.08) * (1 - Math.pow(0.82, steps)))
    },
    finish() {
      value = 1
    },
    reset() {
      value = 0
      startedAt = null
    },
    value: () => value,
  }
}
