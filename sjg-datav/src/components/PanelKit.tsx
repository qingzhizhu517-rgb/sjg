import type { ReactNode } from 'react'
import styled from 'styled-components'

/**
 * 大屏面板基础件。
 * LeftPanel / RightPanel 原先各自复制了一份 Card + 四角装饰 + 标题 + 印章，
 * 现已收敛到这里——改一次全站生效。
 */

/**
 * 面板卡。
 * `$weight` 决定在等高列里的占比（默认 1 = 平分）。
 * **必须走 flex-basis 0 + grow**：父级是 height:100% 的 column flex，
 * 子项若按内容高度参与布局，一旦总内容超高就会被 flex-shrink 按比例压扁
 * （右栏曾因此把 8 行榜单裁成 5 行）。
 */
export const Card = styled.section<{ $weight?: number }>`
  position: relative;
  flex: ${(p) => p.$weight ?? 1} 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--dv-panel);
  border: 1px solid var(--dv-line);
  padding: 14px 16px 16px;
  backdrop-filter: blur(8px);
`

const Corner = styled.i`
  position: absolute;
  width: 13px;
  height: 13px;
  border-color: var(--dv-gold);
  border-style: solid;
  pointer-events: none;
  &.tl {
    top: -1px;
    left: -1px;
    border-width: 1.5px 0 0 1.5px;
  }
  &.br {
    bottom: -1px;
    right: -1px;
    border-width: 0 1.5px 1.5px 0;
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 12px;
  flex-shrink: 0;
`

const TitleSeal = styled.span`
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--dv-vermilion);
  color: #f5efe3;
  font-family: var(--dv-serif);
  font-size: 13px;
  transform: rotate(-3deg);
  flex-shrink: 0;
`

const TitleText = styled.h3`
  font-family: var(--dv-serif);
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 3px;
  color: var(--dv-ink);
  white-space: nowrap;
`

const TitleNote = styled.span`
  margin-left: auto;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--dv-ink-3);
  white-space: nowrap;
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

export interface CardProps {
  seal: string
  title: string
  note?: ReactNode
  weight?: number
  children: ReactNode
  className?: string
}

/** 带印章标题的面板卡 */
export function PanelCard({ seal, title, note, weight, children, className }: CardProps) {
  return (
    <Card $weight={weight} className={className}>
      <Corner className="tl" />
      <Corner className="br" />
      <TitleRow>
        <TitleSeal>{seal}</TitleSeal>
        <TitleText>{title}</TitleText>
        {note != null && <TitleNote>{note}</TitleNote>}
      </TitleRow>
      <Body>{children}</Body>
    </Card>
  )
}

/* ============ 三态 ============ */

const SkeletonWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
`

const SkeletonBar = styled.span<{ $w: string; $h: number }>`
  display: block;
  width: ${(p) => p.$w};
  height: ${(p) => p.$h}px;
  background: linear-gradient(90deg, rgba(201, 162, 39, 0.06), rgba(201, 162, 39, 0.14), rgba(201, 162, 39, 0.06));
  background-size: 200% 100%;
  animation: dv-skeleton 1.6s ease-in-out infinite;
  @keyframes dv-skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const SKELETON_WIDTHS = ['92%', '74%', '86%', '62%', '88%', '70%']

/** 面板内骨架屏（替代原先「静默显示 0 / —」） */
export function SkeletonBlock({ rows = 5, height = 12 }: { rows?: number; height?: number }) {
  return (
    <SkeletonWrap>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonBar key={i} $w={SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]} $h={height} />
      ))}
    </SkeletonWrap>
  )
}

const StateBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
`

const StateIcon = styled.span<{ $tone: 'error' | 'empty' }>`
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--dv-serif);
  font-size: 15px;
  border: 1px solid ${(p) => (p.$tone === 'error' ? 'var(--dv-vermilion)' : 'var(--dv-line)')};
  color: ${(p) => (p.$tone === 'error' ? 'var(--dv-vermilion)' : 'var(--dv-ink-3)')};
  transform: rotate(-3deg);
`

const StateText = styled.p`
  font-size: 12px;
  line-height: 1.7;
  color: var(--dv-ink-2);
  max-width: 260px;
`

const RetryButton = styled.button`
  font-family: var(--dv-sans);
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--dv-ink-2);
  background: transparent;
  border: 1px solid var(--dv-line);
  padding: 5px 16px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  &:hover {
    color: var(--dv-gold-light);
    border-color: var(--dv-gold);
  }
`

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <StateBox>
      <StateIcon $tone="error">!</StateIcon>
      <StateText>{message || '数据加载失败，请确认后端服务已启动'}</StateText>
      {onRetry && <RetryButton onClick={onRetry}>重新加载</RetryButton>}
    </StateBox>
  )
}

export function EmptyState({ message = '暂无数据' }: { message?: string }) {
  return (
    <StateBox>
      <StateIcon $tone="empty">空</StateIcon>
      <StateText>{message}</StateText>
    </StateBox>
  )
}
