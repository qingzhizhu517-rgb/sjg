import { ReactNode } from 'react'
import { useAutoFit } from '../hooks/useAutoFit'

interface AutoFitProps {
  children: ReactNode
  designWidth?: number
  designHeight?: number
}

/**
 * 大屏等比适配容器:
 * 外层 100% 占满 → 内层 1920×1080 设计舞台, 按容器实测尺寸 contain 居中缩放,
 * 任何窗口比例(含 1699×828 等非常规)下整屏完整可见, 无裁切。
 */
export default function AutoFit({
  children,
  designWidth = 1920,
  designHeight = 1080,
}: AutoFitProps) {
  const { outerRef, stageRef } = useAutoFit(designWidth, designHeight)

  return (
    <div
      ref={outerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        ref={stageRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: designWidth,
          height: designHeight,
        }}
      >
        {children}
      </div>
    </div>
  )
}
