import styled from 'styled-components'
import Scene from './Scene'

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

export default function Map() {
  return (
    <MapWrapper>
      <Scene />
    </MapWrapper>
  )
}
