import styled from 'styled-components'
import Header from './Header'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import ShanheMapChart from '../../../components/ShanheMapChart'
import { useSpots } from '../../../api'

const PanelWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
`

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`

const LeftSlot = styled.div`
  width: 400px;
  height: 100%;
  flex-shrink: 0;
`

const CenterSlot = styled.div`
  flex: 1;
  height: 100%;
  min-width: 0;
  padding: 20px 12px;
`

const RightSlot = styled.div`
  width: 400px;
  height: 100%;
  flex-shrink: 0;
`

export default function Panel() {
  const { spots } = useSpots()

  // 九城景观计数(供山河图志节点尺寸)
  const regionOrder = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '淄博', '滨州', '东营']
  const regionCount = new Map<string, number>()
  spots.forEach((s: any) => regionCount.set(s.region, (regionCount.get(s.region) || 0) + 1))
  const cities = regionOrder.map((name) => ({ name, count: regionCount.get(name) || 0 }))

  return (
    <PanelWrapper>
      <Header />
      <ContentWrapper>
        <LeftSlot>
          <LeftPanel />
        </LeftSlot>
        <CenterSlot>
          <ShanheMapChart
            cities={cities}
            spots={spots as Array<{ name: string; longitude?: number | null; latitude?: number | null }>}
          />
        </CenterSlot>
        <RightSlot>
          <RightPanel />
        </RightSlot>
      </ContentWrapper>
    </PanelWrapper>
  )
}
