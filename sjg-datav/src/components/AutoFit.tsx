import { ReactNode } from 'react'
import styled from 'styled-components'
import { useAutoFit } from '../hooks/useAutoFit'

const Wrapper = styled.div`
  width: 1920px;
  height: 1080px;
  transform-origin: left top;
`

interface AutoFitProps {
  children: ReactNode
  designWidth?: number
  designHeight?: number
}

export default function AutoFit({
  children,
  designWidth = 1920,
  designHeight = 1080
}: AutoFitProps) {
  const ref = useAutoFit(designWidth, designHeight)

  return (
    <div
      ref={ref}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Wrapper>
        {children}
      </Wrapper>
    </div>
  )
}
