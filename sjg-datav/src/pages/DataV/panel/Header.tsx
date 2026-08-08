import { useEffect, useState } from 'react'
import styled from 'styled-components'

const HeaderWrapper = styled.div`
  height: 80px;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.9) 0%, rgba(26, 26, 46, 0) 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.3);
`

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const TimeDisplay = styled.div`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
`

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <HeaderWrapper>
      <Title>齐鲁文化数据大屏</Title>
      <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
    </HeaderWrapper>
  )
}
