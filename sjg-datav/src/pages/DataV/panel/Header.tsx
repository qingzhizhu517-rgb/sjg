import { useEffect, useState } from 'react'
import styled from 'styled-components'
import type { DashboardFilter } from '../../../hooks/useDashboardData'

const HeaderWrapper = styled.header`
  height: 92px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 34px;
  border-bottom: 1px solid var(--dv-line);
  position: relative;
`

/* 两侧金色渐隐线 */
const FlankLine = styled.span<{ $left?: boolean }>`
  position: absolute;
  top: 50%;
  ${(p) => (p.$left ? 'left: 0;' : 'right: 0;')}
  width: 13%;
  height: 1px;
  background: linear-gradient(
    ${(p) => (p.$left ? '90deg' : '270deg')},
    rgba(201, 162, 39, 0.55),
    transparent
  );
`

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
`

const TitleSeal = styled.span`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dv-vermilion);
  color: #f5efe3;
  font-family: var(--dv-serif);
  font-size: 25px;
  transform: rotate(-3deg);
  box-shadow: 0 2px 8px rgba(194, 58, 43, 0.35);
  flex-shrink: 0;
`

const Title = styled.h1`
  font-family: var(--dv-serif);
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 9px;
  color: var(--dv-ink);
  white-space: nowrap;
`

const SubTitle = styled.span`
  display: block;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--dv-ink-3);
  margin-top: 5px;
`

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
`

const FilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--dv-sans);
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--dv-gold-light);
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid rgba(201, 162, 39, 0.4);
  padding: 5px 12px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: rgba(201, 162, 39, 0.2);
  }
`

const ChipX = styled.span`
  color: var(--dv-ink-2);
  font-size: 13px;
`

const ClockBox = styled.div`
  text-align: right;
`

const ClockTime = styled.div`
  font-family: var(--dv-num);
  font-size: 19px;
  letter-spacing: 1.5px;
  color: var(--dv-ink);
  font-variant-numeric: tabular-nums;
`

const ClockDate = styled.div`
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--dv-ink-3);
  margin-top: 3px;
`

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const pad = (n: number) => String(n).padStart(2, '0')

interface HeaderProps {
  filter: DashboardFilter
  /** 朝代 id → 名称，用于筛选回显 */
  dynastyName?: string
  onClearFilter: () => void
  updatedAt: number | null
}

export default function Header({ filter, dynastyName, onClearFilter, updatedAt }: HeaderProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hasFilter = filter.region != null || filter.dynastyId != null
  const filterLabel = [filter.region, filter.dynastyId != null ? dynastyName : null]
    .filter(Boolean)
    .join(' · ')

  const updated = updatedAt ? new Date(updatedAt) : null

  return (
    <HeaderWrapper>
      <FlankLine $left />
      <TitleGroup>
        <TitleSeal>黄</TitleSeal>
        <div>
          <Title>黄河流域文学景观 · 数字人文大屏</Title>
          <SubTitle>山东段 · 沿黄九城 · 五脉文华</SubTitle>
        </div>
      </TitleGroup>

      <RightGroup>
        {hasFilter && (
          <FilterChip onClick={onClearFilter} title="点击清除筛选">
            <span>{filterLabel}</span>
            <ChipX>×</ChipX>
          </FilterChip>
        )}
        <ClockBox>
          <ClockTime>
            {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
          </ClockTime>
          <ClockDate>
            {now.getFullYear()}-{pad(now.getMonth() + 1)}-{pad(now.getDate())} 周
            {WEEKDAYS[now.getDay()]}
            {updated ? ` · 数据截至 ${pad(updated.getMonth() + 1)}-${pad(updated.getDate())}` : ''}
          </ClockDate>
        </ClockBox>
      </RightGroup>
      <FlankLine />
    </HeaderWrapper>
  )
}
