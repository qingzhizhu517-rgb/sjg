import { ref, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

/**
 * 朝代年轮划舟 composable
 * 驱动小舟沿黄河曲线 SVG path 移动，9 个朝代节点等分定位
 */
export function useBoatJourney() {
  const progress = ref(0) // 0→1 全局进度
  const activeDynastyIndex = ref(0) // 当前朝代索引 0-8

  let _pathEl = null
  let _boatEl = null
  let _tween = null
  const _dynastyNodes = ref([]) // 响应式，确保 computed 能追踪
  let _onDynastyChange = null

  // 9 朝代定义（与数据库一致，含金朝）
  const DYNASTIES = [
    { id: 'qin', name: '秦', startYear: -221, endYear: -206 },
    { id: 'han', name: '汉', startYear: -206, endYear: 220 },
    { id: 'weijin', name: '魏晋', startYear: 220, endYear: 420 },
    { id: 'tang', name: '唐', startYear: 618, endYear: 907 },
    { id: 'song', name: '宋', startYear: 960, endYear: 1279 },
    { id: 'jin', name: '金', startYear: 1115, endYear: 1234 },
    { id: 'yuan', name: '元', startYear: 1271, endYear: 1368 },
    { id: 'ming', name: '明', startYear: 1368, endYear: 1644 },
    { id: 'qing', name: '清', startYear: 1644, endYear: 1912 },
  ]

  /**
   * 初始化划舟动画
   * @param {object} opts
   * @param {SVGPathElement} opts.pathEl - 黄河曲线 SVG path
   * @param {HTMLElement} opts.boatEl - 小舟精灵元素
   * @param {function} opts.onDynastyChange - 朝代切换回调 (index, dynasty) => void
   */
  function init({ pathEl, boatEl, onDynastyChange }) {
    if (!pathEl || !boatEl) return

    _pathEl = pathEl
    _boatEl = boatEl
    _onDynastyChange = onDynastyChange

    // 计算朝代节点在 path 上的位置
    _dynastyNodes.value = DYNASTIES.map((d, i) => {
      const t = (i + 0.5) / DYNASTIES.length // 等分点，偏移 0.5 格居中
      const point = pathEl.getPointAtLength(t * pathEl.getTotalLength())
      return { ...d, index: i, x: point.x, y: point.y, t }
    })

    // 初始位置
    _updateBoatPosition(0)
  }

  /**
   * 更新小舟位置
   * @param {number} t - 0→1 进度
   */
  function _updateBoatPosition(t) {
    if (!_pathEl || !_boatEl) return

    const totalLength = _pathEl.getTotalLength()
    const point = _pathEl.getPointAtLength(t * totalLength)

    // 计算切线角度（小舟朝向）
    const delta = 0.01
    const nextPoint = _pathEl.getPointAtLength(Math.min(t + delta, 1) * totalLength)
    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI)

    // 应用变换
    gsap.set(_boatEl, {
      x: point.x,
      y: point.y,
      rotation: angle,
      transformOrigin: '50% 50%',
    })

    // 更新进度
    progress.value = t

    // 检测当前朝代
    const newIndex = Math.min(
      Math.floor(t * DYNASTIES.length),
      DYNASTIES.length - 1,
    )
    if (newIndex !== activeDynastyIndex.value) {
      activeDynastyIndex.value = newIndex
      _onDynastyChange?.(newIndex, DYNASTIES[newIndex])
    }
  }

  /**
   * 划舟到指定朝代
   * @param {number} index - 朝代索引 0-7
   * @param {object} opts - { duration, ease }
   */
  function goToDynasty(index, opts = {}) {
    const { duration = 1.2, ease = 'power2.inOut' } = opts
    if (index < 0 || index >= DYNASTIES.length) return

    const targetT = (index + 0.5) / DYNASTIES.length

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

  /**
   * 自动巡航（从头到尾匀速划行）
   * @param {number} duration - 总时长（秒）
   */
  function autoCruise(duration = 20) {
    if (_tween) _tween.kill()
    _tween = gsap.to(
      { t: 0 },
      {
        t: 1,
        duration,
        ease: 'none',
        repeat: -1, // 无限循环
        onUpdate() {
          _updateBoatPosition(this.targets()[0].t)
        },
      },
    )
  }

  /**
   * 停止动画
   */
  function stop() {
    if (_tween) {
      _tween.kill()
      _tween = null
    }
  }

  /**
   * 销毁
   */
  function dispose() {
    stop()
    _pathEl = null
    _boatEl = null
    _onDynastyChange = null
  }

  return {
    progress,
    activeDynastyIndex,
    dynasties: DYNASTIES,
    dynastyNodes: _dynastyNodes, // 直接返回 ref
    init,
    goToDynasty,
    autoCruise,
    stop,
    dispose,
  }
}
