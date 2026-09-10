import { useEffect, useState } from 'react'
import styled from 'styled-components'
import DynastyRibbon from '../../../components/DynastyRibbon'
import { ErrorState } from '../../../components/PanelKit'
import ShanheMapChart from '../../../components/ShanheMapChart'
import { EMPTY_FILTER, useDashboardData } from '../../../hooks/useDashboardData'
import type { DashboardFilter } from '../../../hooks/useDashboardData'
import Header from './Header'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'

const PanelWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
`

const ContentWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 14px;
  padding: 14px 18px 0;
`

const CenterSlot = styled.div`
  flex: 1;
  min-width: 0;
  height: 100%;
`

const RibbonSlot = styled.div`
  flex-shrink: 0;
  padding: 14px 18px 18px;
`

const ErrorFill = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

/**
 * 支持用查询参数预置筛选状态，方便挂大屏时固定到某个专题，也便于回归验证：
 *   /?region=济南
 *   /?region=济南&dynasty=4
 */
function readInitialFilter(): DashboardFilter {
  if (typeof window === 'undefined') return EMPTY_FILTER
  const q = new URLSearchParams(window.location.search)
  const region = q.get('region')
  const dynasty = Number(q.get('dynasty'))
  return {
    region: region || null,
    dynastyId: Number.isFinite(dynasty) && dynasty > 0 ? dynasty : null,
  }
}

export default function Panel() {
  const [filter, setFilter] = useState<DashboardFilter>(readInitialFilter)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const { view, dynasties, isLoading, error, retry, hasData } = useDashboardData(filter)

  // 数据首次到达时记一次「数据截至」，用于顶栏回显
  useEffect(() => {
    if (hasData) setUpdatedAt(Date.now())
  }, [hasData])

  const selectRegion = (region: string | null) => setFilter((f) => ({ ...f, region }))
  const selectDynasty = (dynastyId: number | null) => setFilter((f) => ({ ...f, dynastyId }))
  const clearFilter = () => setFilter(EMPTY_FILTER)

  const dynastyName = dynasties.find((d) => d.id === filter.dynastyId)?.name

  // 完全没有数据且请求失败：整屏给明确错误，而不是让卡片静默显示 0 / —
  const hardFailed = !!error && !hasData && !isLoading

  return (
    <PanelWrapper>
      <Header
        filter={filter}
        dynastyName={dynastyName}
        onClearFilter={clearFilter}
        updatedAt={updatedAt}
      />

      {hardFailed ? (
        <ErrorFill>
          <ErrorState
            message={`数据接口不可达：${error?.message ?? '未知错误'}。请确认后端服务已在 8080 启动。`}
            onRetry={retry}
          />
        </ErrorFill>
      ) : (
        <>
          <ContentWrapper>
            <LeftPanel
              view={view}
              selectedRegion={filter.region}
              onSelectRegion={selectRegion}
              loading={isLoading}
            />
            <CenterSlot>
              <ShanheMapChart view={view} filter={filter} onSelectRegion={selectRegion} />
            </CenterSlot>
            <RightPanel
              view={view}
              selectedDynastyId={filter.dynastyId}
              onSelectDynasty={selectDynasty}
              loading={isLoading}
            />
          </ContentWrapper>

          <RibbonSlot>
            <DynastyRibbon
              stats={view.dynastyStats}
              selectedId={filter.dynastyId}
              onSelect={selectDynasty}
              loading={isLoading}
            />
          </RibbonSlot>
        </>
      )}
    </PanelWrapper>
  )
}
