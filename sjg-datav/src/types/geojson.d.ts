export interface GeoJSONFeature {
  type: 'Feature'
  properties: {
    adcode: number
    name: string
    center: [number, number]
    centroid: [number, number]
    childrenNum: number
    level: string
    parent: { adcode: number }
    subFeatureIndex: number
    acroutes: number[]
  }
  geometry: {
    type: 'MultiPolygon'
    coordinates: number[][][][]
  }
}

export interface GeoJSONData {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}
