'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

// 3D coordinates for Shandong cities relative to [0, 0] plane
// Correct aspect ratio calculation: longitude scale = latitude scale * cos(mean_latitude)
// For Shandong (mean latitude ~36.4° N), cos(36.4°) ≈ 0.805
// If latitude scale is 3.8, longitude scale should be 3.8 * 0.805 ≈ 3.06. This prevents horizontal stretching.
export const projectGeo = (lon, lat) => {
  const x = (lon - 117.0) * 3.06;
  const z = -(lat - 36.4) * 3.8;
  return { x, z };
};

const createCityShape = (coordinates) => {
  const shape = new THREE.Shape();
  coordinates.forEach((coord, index) => {
    const { x, z } = projectGeo(coord[0], coord[1]);
    if (index === 0) {
      shape.moveTo(x, -z);
    } else {
      shape.lineTo(x, -z);
    }
  });
  return shape;
};

// Geographically accurate mountain centers
const centerTai = projectGeo(117.09, 36.26);      // Mount Tai
const centerYimeng = projectGeo(117.88, 35.53);   // Yimeng Range
const centerJiaodong = projectGeo(121.39, 37.18); // Jiaodong Hills

// Yellow River geographical coordinate points
const riverGeoPoints = [
  { lon: 114.80, lat: 35.00 },
  { lon: 115.43, lat: 35.24 }, // 菏泽
  { lon: 115.97, lat: 36.45 }, // 聊城
  { lon: 116.50, lat: 36.55 }, // 德州/Jinan border
  { lon: 116.99, lat: 36.67 }, // 济南
  { lon: 118.05, lat: 36.78 }, // 淄博
  { lon: 118.02, lat: 37.37 }, // 滨州
  { lon: 118.67, lat: 37.43 }, // 东营
  { lon: 119.20, lat: 37.80 }  // 渤海口
];

const river2dPoints = riverGeoPoints.map(p => {
  const { x, z } = projectGeo(p.lon, p.lat);
  return { x, z };
});

// Curve guide points for carving the terrain valley
const guidePoints = new THREE.CatmullRomCurve3(
  river2dPoints.map(p => new THREE.Vector3(p.x, 0, p.z))
).getPoints(100);

// Terrain height calculator based on geographic features of Shandong
export const getTerrainHeight = (x, z) => {
  const vx = x;
  const vy = -z;
  
  // Bohai Bay & Yellow Sea bounds calculated based on coordinates
  let isSea = false;
  if (vx > 4.5 && vy > 2.0) {
    isSea = true; // Bohai Bay
  } else if (vx > 7.0 && vy < -1.5) {
    isSea = true; // Yellow Sea
  }
  
  if (isSea) return 0.05;
  
  let height = 0;
  
  // 1. Natural terrain undulating waves (fBm noise simulation)
  let noise = Math.sin(vx * 0.25) * Math.cos(vy * 0.25) * 0.3;
  noise += Math.sin(vx * 0.6 + 1.2) * Math.cos(vy * 0.7 - 0.5) * 0.1;
  noise += Math.sin(vx * 1.5) * Math.cos(vy * 1.3) * 0.03;
  height += noise;
  
  // 2. Mountains (Mount Tai, Yimeng Range, Jiaodong Hills using projected centers)
  // Mount Tai
  const dxTai = vx - centerTai.x;
  const dyTai = vy - (-centerTai.z);
  const distToTai = Math.sqrt(dxTai * dxTai + dyTai * dyTai);
  if (distToTai < 3.5) {
    height += 1.8 * Math.pow(1.0 - distToTai / 3.5, 2);
  }
  
  // Yimeng Range
  const dxYimeng = vx - centerYimeng.x;
  const dyYimeng = vy - (-centerYimeng.z);
  const distToYimeng = Math.sqrt(dxYimeng * dxYimeng + dyYimeng * dyYimeng);
  if (distToYimeng < 4.0) {
    height += 1.3 * Math.pow(1.0 - distToYimeng / 4.0, 2);
  }
  
  // Jiaodong Hills
  const dxJiaodong = vx - centerJiaodong.x;
  const dyJiaodong = vy - (-centerJiaodong.z);
  const distToJiaodong = Math.sqrt(dxJiaodong * dxJiaodong + dyJiaodong * dyJiaodong);
  if (distToJiaodong < 3.0) {
    height += 0.6 * Math.pow(1.0 - distToJiaodong / 3.0, 2);
  }
  
  // 3. Plain flattening (Heze, Liaocheng, Dezhou)
  if (vx < -2.5) {
    const plainFade = Math.max(0, (vx + 6.8) / 4.3);
    height *= plainFade;
  }
  
  // 4. Yellow River Valley Carving
  let minDist = 999;
  guidePoints.forEach(pt => {
    const dx = vx - pt.x;
    const dy = vy + pt.z;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
    }
  });
  
  if (minDist < 0.8) {
    const valleyDepth = 0.38 * (1.0 - minDist / 0.8);
    height -= valleyDepth;
  }
  
  return height;
};

// Hypsometric tinting color mapper based on realistic terrain features (actual geography)
const getGeographyColor = (h) => {
  const color = new THREE.Color();
  if (h < -0.1) {
    // Valley / lowlands: lush river basin green
    color.setHSL(0.24, 0.22, 0.45 + (h + 0.3) * 0.2);
  } else if (h < 0.3) {
    // Plains: fertile green/yellowish green
    const t = (h - (-0.1)) / 0.4;
    color.lerpColors(new THREE.Color('#94af76'), new THREE.Color('#b5c48f'), t);
  } else if (h < 0.8) {
    // Hills: warm ochre/olive
    const t = (h - 0.3) / 0.5;
    color.lerpColors(new THREE.Color('#b5c48f'), new THREE.Color('#caba7d'), t);
  } else {
    // Mountains: rugged rock brown to snow cap white
    const t = Math.min(1.0, (h - 0.8) / 1.0);
    color.lerpColors(new THREE.Color('#9e7a59'), new THREE.Color('#e0dcd3'), t);
  }
  return color;
};

export default function ShandongMap({ geojson }) {
  const extrudeSettings = useMemo(() => ({
    depth: 0.35,
    bevelEnabled: false
  }), []);

  // Compute 3D meshes for each city in the geojson boundaries
  const cityPlates = useMemo(() => {
    if (!geojson) return [];

    return geojson.features.map((feature, featureIndex) => {
      const cityName = feature.properties.name.replace('市', '');
      const shapes = [];

      if (feature.geometry.type === 'Polygon') {
        const coords = feature.geometry.coordinates[0];
        if (coords.length >= 45) {
          shapes.push(createCityShape(coords));
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(poly => {
          const coords = poly[0];
          if (coords.length >= 45) {
            shapes.push(createCityShape(coords));
          }
        });
      }

      if (shapes.length === 0) return null;

      // 1. Extrude Geometry
      const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);

      // 2. Vertex Height Deformation & Custom Vertex Colors (Basalt foundations vs Terrain Heights)
      const pos = geometry.attributes.position;
      const colors = new Float32Array(pos.count * 3);

      for (let i = 0; i < pos.count; i++) {
        const lx = pos.getX(i);
        const ly = pos.getY(i);
        const lz = pos.getZ(i);

        const wx = lx;
        const wz = -ly;
        const terrainH = getTerrainHeight(wx, wz);

        let vertexColor;
        if (lz > 0.15) {
          pos.setZ(i, terrainH); // Top surface follows terrain height map
          vertexColor = getGeographyColor(terrainH);
        } else {
          pos.setZ(i, -0.6);      // Bottom foundation is flat and submerged
          vertexColor = new THREE.Color('#4a3e3d'); // Foundation rock charcoal
        }

        colors[i * 3] = vertexColor.r;
        colors[i * 3 + 1] = vertexColor.g;
        colors[i * 3 + 2] = vertexColor.b;
      }

      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.computeVertexNormals();

      // 3. Ink Outline Border Lines on the Top Surface
      const borderLines = [];
      const borderPaths = [];

      if (feature.geometry.type === 'Polygon') {
        const coords = feature.geometry.coordinates[0];
        if (coords.length >= 45) borderPaths.push(coords);
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(poly => {
          const coords = poly[0];
          if (coords.length >= 45) borderPaths.push(coords);
        });
      }

      borderPaths.forEach((path, idx) => {
        const points = [];
        path.forEach(c => {
          const { x, z } = projectGeo(c[0], c[1]);
          const y = getTerrainHeight(x, z) + 0.012;
          points.push(new THREE.Vector3(x, y, z));
        });
        const borderGeom = new THREE.BufferGeometry().setFromPoints(points);
        borderLines.push({
          id: `${cityName}-border-${idx}`,
          geometry: borderGeom
        });
      });

      return {
        name: cityName,
        geometry,
        borderLines
      };
    }).filter(Boolean);
  }, [geojson, extrudeSettings]);

  // Adjacent sea plane dimensions
  const seaGeometry = useMemo(() => new THREE.PlaneGeometry(42, 30), []);

  if (!geojson) {
    // Fallback simple landscape terrain mesh if geojson is not loaded
    const fallbackMesh = useMemo(() => {
      const geom = new THREE.PlaneGeometry(22, 14, 40, 40);
      const pos = geom.attributes.position;
      const colors = new Float32Array(pos.count * 3);

      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        let z = Math.sin(vx * 0.2) * Math.cos(vy * 0.2) * 0.8;
        
        // Add artificial Mount Tai
        const distToTai = Math.sqrt(Math.pow(vx - 0, 2) + Math.pow(vy - (-1), 2));
        if (distToTai < 3) {
          z += (3 - distToTai) * 0.6;
        }

        pos.setZ(i, z);

        const vColor = getGeographyColor(z);
        colors[i * 3] = vColor.r;
        colors[i * 3 + 1] = vColor.g;
        colors[i * 3 + 2] = vColor.b;
      }

      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geom.computeVertexNormals();
      return geom;
    }, []);

    return (
      <mesh geometry={fallbackMesh} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial vertexColors roughness={0.8} metalness={0.1} flatShading />
      </mesh>
    );
  }

  return (
    <group>
      {/* 1. Sea Plane */}
      <mesh geometry={seaGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <meshStandardMaterial color="#abbca7" roughness={0.35} metalness={0.15} flatShading />
      </mesh>

      {/* 2. Extruded Cities Plates */}
      {cityPlates.map((plate) => (
        <group key={plate.name}>
          <mesh
            geometry={plate.geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            castShadow
          >
            <meshStandardMaterial
              vertexColors
              roughness={0.8}
              metalness={0.05}
              flatShading
            />
          </mesh>

          {/* 3. Top surface ink boundaries */}
          {plate.borderLines.map((line) => (
            <line key={line.id} geometry={line.geometry}>
              <lineBasicMaterial
                color="#4a3f35"
                linewidth={1.5}
                transparent
                opacity={0.55}
              />
            </line>
          ))}
        </group>
      ))}
    </group>
  );
}
