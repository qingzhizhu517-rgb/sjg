import styled from 'styled-components'
import Header from './Header'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'

const PanelWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  pointer-events: none;
`

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  pointer-events: auto;
`

export default function Panel() {
  return (
    <PanelWrapper>
      <Header />
      <ContentWrapper>
        <LeftPanel />
        <div style={{ flex: 1 }} />
        <RightPanel />
      </ContentWrapper>
    </PanelWrapper>
  )
}
