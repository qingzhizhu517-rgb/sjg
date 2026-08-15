import { useEffect, useState } from 'react'
import styled from 'styled-components'

const HeaderWrapper = styled.div`
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid var(--dv-line);
  position: relative;
`

/* 两侧金色渐隐线 */
const FlankLine = styled.span<{ $left?: boolean }>`
  position: absolute;
  top: 50%;
  ${(p) => (p.$left ? 'left: 0;' : 'right: 0;')}
  width: 14%;
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
`

const TitleSeal = styled.span`
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dv-vermilion);
  color: #f5efe3;
  font-weight: 700;
  font-size: 26px;
  transform: rotate(-3deg);
  box-shadow: 0 2px 8px rgba(194, 58, 43, 0.35);
`

const Title = styled.h1`
  font-size: 30px;
  font-weight: 500;
  letter-spacing: 10px;
  color: var(--dv-ink);
`

const SubTitle = styled.span`
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--dv-ink-3);
  margin-left: 6px;
  display: block;
  margin-top: 4px;
`

const TimeDisplay = styled.div`
  text-align: right;
  font-size: 15px;
  letter-spacing: 2px;
  color: var(--dv-ink-2);
  font-variant-numeric: tabular-nums;
`

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) =>
    date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  return (
    <HeaderWrapper>
      <FlankLine $left />
      <TitleGroup>
        <TitleSeal>黄</TitleSeal>
        <div>
          <Title>黄河流域文学景观 · 数字人文大屏</Title>
          <SubTitle>山东段 · 九城五脉 · 数据全景</SubTitle>
        </div>
      </TitleGroup>
      <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
      <FlankLine />
    </HeaderWrapper>
  )
}
