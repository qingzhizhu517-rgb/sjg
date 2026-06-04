'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ShandongMap from './ShandongMap';
import RiverPath from './RiverPath';
import CityPins from './CityPins';

export default function CanvasContainer({ onSelectCity, onArrival, activeCity, showLabels, themeMode }) {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    fetch('/shandong.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load shandong.json');
        return res.json();
      })
      .then((data) => setGeojson(data))
      .catch((err) => {
        console.error('Error loading GeoJSON shandong.json, falling back to mock terrain:', err);
      });
  }, []);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 15, 15], fov: 45, near: 0.1, far: 1000 }}
        shadows
        onCreated={({ gl, scene }) => {
          scene.background = new THREE.Color(0xfbf8f3); // Background parchment paper color
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        className="w-full h-full block"
      >
        {/* Geographically calibrated lighting & volumetric fog */}
        <fogExp2 attach="fog" color="#fbf8f3" density={0.025} />
        <ambientLight intensity={0.8} />
        
        <directionalLight
          position={[5, 18, 5]}
          intensity={1.2}
          color="#fffdf6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={40}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.0005}
        />

        <pointLight
          position={[0, 5, 0]}
          intensity={1.0}
          distance={20}
          color="#b8860b"
        />

        {/* 3D Map elements */}
        <ShandongMap geojson={geojson} />
        <RiverPath />
        <CityPins
          onSelectCity={onSelectCity}
          onArrival={onArrival}
          activeCity={activeCity}
          showLabels={showLabels}
          themeMode={themeMode}
        />

        {/* Interactive Orbit Camera Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.2} // Prevent camera from looking underneath
          minDistance={5}
          maxDistance={35}
        />
      </Canvas>
    </div>
  );
}
