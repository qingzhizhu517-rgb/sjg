import { ref } from 'vue'
import gsap from 'gsap'

/**
 * 朝代年轮划舟 composable
 * 驱动小舟沿黄河曲线 SVG path 移动，朝代节点等分定位。
 * 坐标使用百分比（%）而非 SVG viewBox 像素，与容器宽度解耦。
 */
export function useBoatJourney() {
  const progress = ref(0) // 0→1 全局进度
  const activeDynastyIndex = ref(0) // 当前朝代索引
  const isCruising = ref(false) // 自动巡航是否进行中（供播放/暂停 UI 绑定）

  let _pathEl = null
  let _boatEl = null
  let _tween = null
  let _cruiseDuration = 30
  let _dynastyCount = 0
  const _dynastyNodes = ref([])
  let _onDynastyChange = null
  let _viewBoxW = 1200
  let _viewBoxH = 400

  /**
   * 初始化划舟动画
   * @param {object} opts
   * @param {SVGPathElement} opts.pathEl - 黄河曲线 SVG path
   * @param {HTMLElement} opts.boatEl - 小舟精灵元素
   * @param {number} opts.dynastyCount - 朝代数量
   * @param {function} opts.onDynastyChange - 朝代切换回调 (index) => void
   * @param {number} opts.viewBoxW - SVG viewBox 宽（默认 1200）
   * @param {number} opts.viewBoxH - SVG viewBox 高（默认 400）
   */
  function init({ pathEl, boatEl, dynastyCount, onDynastyChange, viewBoxW = 1200, viewBoxH = 400 }) {
    if (!pathEl || !boatEl) return

    _pathEl = pathEl
    _boatEl = boatEl
    _dynastyCount = dynastyCount
    _onDynastyChange = onDynastyChange
    _viewBoxW = viewBoxW
    _viewBoxH = viewBoxH

    // 计算朝代节点在 path 上的百分比位置
    _dynastyNodes.value = Array.from({ length: dynastyCount }, (_, i) => {
      const t = (i + 0.5) / dynastyCount
      const point = pathEl.getPointAtLength(t * pathEl.getTotalLength())
      return {
        index: i,
        xPct: (point.x / viewBoxW) * 100,
        yPct: (point.y / viewBoxH) * 100,
        t,
      }
    })

    _updateBoatPosition(0)
  }

  /**
   * 更新小舟位置（百分比坐标）
   */
  function _updateBoatPosition(t) {
    if (!_pathEl || !_boatEl) return

    const totalLength = _pathEl.getTotalLength()
    const point = _pathEl.getPointAtLength(t * totalLength)

    const delta = 0.01
    const nextPoint = _pathEl.getPointAtLength(Math.min(t + delta, 1) * totalLength)
    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI)

    // 转百分比后应用
    const xPct = (point.x / _viewBoxW) * 100
    const yPct = (point.y / _viewBoxH) * 100

    gsap.set(_boatEl, {
      left: `${xPct}%`,
      top: `${yPct}%`,
      rotation: angle,
      transformOrigin: '50% 50%',
    })

    progress.value = t

    const newIndex = Math.min(Math.floor(t * _dynastyCount), _dynastyCount - 1)
    if (newIndex !== activeDynastyIndex.value) {
      activeDynastyIndex.value = newIndex
      _onDynastyChange?.(newIndex)
    }
  }

  function goToDynasty(index, opts = {}) {
    const { duration = 1.2, ease = 'power2.inOut' } = opts
    if (index < 0 || index >= _dynastyCount) return

    const targetT = (index + 0.5) / _dynastyCount

    // 暂停（而非杀掉）巡航：用户选完朝代后仍可恢复
    pauseCruise()
    if (_tween) _tween.kill()
    _tween = gsap.to(
      { t: progress.value },
      {
        t: targetT,
        duration,
        ease,
        onUpdate() {
          _updateBoatPosition(this.targets()[0].t)
        },
      },
    )
  }

  function autoCruise(duration = 30) {
    _cruiseDuration = duration
    if (_tween) _tween.kill()
    isCruising.value = true

    // 始终跑完整的 0→1 长河循环（repeat:-1）。用线性 ease，使 tween 进度与 t 一一对应，
    // 从而可用 .progress() 从当前位置无缝续播，而不是把循环截断成 [progress,1] 那一段。
    const proxy = { t: 0 }
    _tween = gsap.to(proxy, {
      t: 1,
      duration,
      ease: 'none',
      repeat: -1,
      onUpdate() {
        _updateBoatPosition(proxy.t)
      },
    })

    // 从当前进度续播；已到终点则从头开始（避免停在 1 处零时长空转）
    const startT = progress.value >= 1 ? 0 : progress.value
    _tween.progress(startT)
  }

  // 暂停巡航但保留位置，可恢复
  function pauseCruise() {
    if (isCruising.value && _tween) {
      _tween.kill()
      _tween = null
    }
    isCruising.value = false
  }

  // 从当前位置恢复巡航
  function resumeCruise() {
    autoCruise(_cruiseDuration)
  }

  function toggleCruise() {
    if (isCruising.value) pauseCruise()
    else resumeCruise()
  }

  function stop() {
    if (_tween) {
      _tween.kill()
      _tween = null
    }
    isCruising.value = false
  }

  function dispose() {
    stop()
    _pathEl = null
    _boatEl = null
    _onDynastyChange = null
  }

  return {
    progress,
    activeDynastyIndex,
    isCruising,
    dynastyNodes: _dynastyNodes,
    init,
    goToDynasty,
    autoCruise,
    pauseCruise,
    resumeCruise,
    toggleCruise,
    stop,
    dispose,
  }
}
