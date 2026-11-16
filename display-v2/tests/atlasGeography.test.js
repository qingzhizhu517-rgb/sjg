import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ATLAS_CITY_POINTS, ATLAS_PROJECTION, ATLAS_RIVER_POINTS, projectAtlasCoordinate } from '../src/config/atlasGeography.js'
import { NINE_CITIES } from '../src/config/nineCities.js'

test('九市标注使用源数据城市中心，不再沿插画河道人工排点', () => {
  const source = JSON.parse(readFileSync(new URL('../../sjg-datav/src/assets/shandong.json', import.meta.url)))
  assert.deepEqual(ATLAS_CITY_POINTS.map(point => point.city), NINE_CITIES)
  for (const point of ATLAS_CITY_POINTS) {
    const feature = source.features.find(item => item.properties.name === `${point.city}市`)
    assert.deepEqual([point.lon, point.lat], feature.properties.center)
    assert.ok(point.x > 0 && point.x < 100 && point.y > 0 && point.y < 100)
  }
})

test('北朝上的投影保留九市实际相对方位', () => {
  const city = name => ATLAS_CITY_POINTS.find(point => point.city === name)
  assert.ok(city('德州').y < city('聊城').y)
  assert.ok(city('泰安').y > city('济南').y)
  assert.ok(city('菏泽').x < city('济宁').x)
  assert.ok(city('滨州').x < city('东营').x)
  assert.ok(city('淄博').x > city('济南').x)
  const center = projectAtlasCoordinate(117.375, 36.5)
  assert.equal(center.x, ATLAS_PROJECTION.width / 2)
  assert.ok(Math.abs(center.y - ATLAS_PROJECTION.height / 2) < 1e-9)
})

test('黄河保留 210 个源节点，不以九市中心连接替代河道', () => {
  const source = JSON.parse(readFileSync(new URL('../../promo-film/v2/data/yellow-river-source.extract.geojson', import.meta.url)))
  const river = source.features[0].geometry.coordinates[0]
  const projected = ATLAS_RIVER_POINTS.split(' ').map(pair => pair.split(',').map(Number))
  assert.equal(projected.length, 210)
  assert.equal(projected.length, river.length)
  river.forEach(([lon, lat], index) => {
    const point = projectAtlasCoordinate(lon, lat)
    assert.ok(Math.abs(projected[index][0] - point.x) <= 0.0051)
    assert.ok(Math.abs(projected[index][1] - point.y) <= 0.0051)
  })
})
