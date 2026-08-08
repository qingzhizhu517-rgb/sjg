import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import gsap from 'gsap'

const NumberWrapper = styled.div`
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

interface NumberAnimationProps {
  endValue: number
  duration?: number
  suffix?: string
  prefix?: string
  style?: React.CSSProperties
}

export default function NumberAnimation({
  endValue,
  duration = 2,
  suffix = '',
  prefix = '',
  style
}: NumberAnimationProps) {
  const numberRef = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const obj = { value: 0 }

    gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayValue(Math.round(obj.value))
      }
    })

    return () => {
      gsap.killTweensOf(obj)
    }
  }, [endValue, duration])

  return (
    <NumberWrapper style={style}>
      {prefix}
      <span ref={numberRef}>{displayValue}</span>
      {suffix}
    </NumberWrapper>
  )
}
