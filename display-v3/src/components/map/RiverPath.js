'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { projectGeo, getTerrainHeight } from './ShandongMap';

// Yellow River geographical coordinate points
const riverGeoPoints = [
  { lon: 114.80, lat: 35.00 },
  { lon: 115.43, lat: 35.24 }, // 菏泽
  { lon: 115.97, lat: 36.45 }, // 聊城
  { lon: 116.50, lat: 36.55 }, // 德州/济南边界
  { lon: 116.99, lat: 36.67 }, // 济南
  { lon: 118.05, lat: 36.78 }, // 淄博
  { lon: 118.02, lat: 37.37 }, // 滨州
  { lon: 118.67, lat: 37.43 }, // 东营
  { lon: 119.20, lat: 37.80 }  // 渤海口
];

export default function RiverPath() {
  const pointsRef = useRef(null);

  // 1. Build the Yellow River CatmullRomCurve3 path in 3D space
  const { curve, tubeGeometry } = useMemo(() => {
    const points2d = riverGeoPoints.map(p => {
      const { x, z } = projectGeo(p.lon, p.lat);
      return { x, z };
    });

    const points3d = points2d.map(p => 
      new THREE.Vector3(p.x, getTerrainHeight(p.x, p.z) + 0.04, p.z)
    );

    const riverCurve = new THREE.CatmullRomCurve3(points3d);
    const geometry = new THREE.TubeGeometry(riverCurve, 64, 0.15, 8, false);

    return {
      curve: riverCurve,
      tubeGeometry: geometry
    };
  }, []);

  // 2. Setup flowing particles
  const dotCount = 80;
  const { positionsArray, offsets } = useMemo(() => {
    const initialOffsets = Array.from({ length: dotCount }, () => Math.random());
    const array = new Float32Array(dotCount * 3);

    initialOffsets.forEach((offset, idx) => {
      const pt = curve.getPointAt(offset);
      array[idx * 3] = pt.x;
      array[idx * 3 + 1] = pt.y + 0.05;
      array[idx * 3 + 2] = pt.z;
    });

    return {
      positionsArray: array,
      offsets: initialOffsets
    };
  }, [curve]);

  // 3. Update particle positions along the path in the rendering frame loop
  useFrame(() => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < dotCount; i++) {
      // Advance offset forward along the curve
      offsets[i] = (offsets[i] + 0.001) % 1.0;
      const pt = curve.getPointAt(offsets[i]);

      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y + 0.05;
      positions[i * 3 + 2] = pt.z;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* 3D Glowing River Tube */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color="#c27b38"
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Flowing Water particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positionsArray, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffe896"
          size={0.16}
          transparent
          opacity={0.95}
        />
      </points>
    </group>
  );
}
