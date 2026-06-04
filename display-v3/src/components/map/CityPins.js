'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { projectGeo, getTerrainHeight } from './ShandongMap';
import { mockCities } from '@/config/mockDetailData';

const cityGeoCoords = [
  { name: '菏泽', lon: 115.48, lat: 35.23, color: 0xc23a2b },
  { name: '济宁', lon: 116.59, lat: 35.38, color: 0xe69138 },
  { name: '泰安', lon: 117.08, lat: 36.20, color: 0xd4af37 },
  { name: '聊城', lon: 115.97, lat: 36.45, color: 0x8e352e },
  { name: '济南', lon: 117.00, lat: 36.67, color: 0x3d85c6 },
  { name: '德州', lon: 116.29, lat: 37.43, color: 0x674ea7 },
  { name: '淄博', lon: 118.00, lat: 36.81, color: 0x6aa84f },
  { name: '滨州', lon: 118.02, lat: 37.37, color: 0x5b8c85 },
  { name: '东营', lon: 118.49, lat: 37.46, color: 0x008080 }
];

export default function CityPins({ onSelectCity, onArrival, activeCity, showLabels, themeMode }) {
  const { camera, gl, controls } = useThree();

  const cities = useMemo(() => {
    return cityGeoCoords.map(city => {
      const { x, z } = projectGeo(city.lon, city.lat);
      const y = getTerrainHeight(x, z);
      const colorHex = '#' + city.color.toString(16).padStart(6, '0');
      const details = mockCities[city.name] || { tag: '齐鲁重镇', desc: '文脉千秋。' };
      return {
        name: city.name,
        color: city.color,
        colorHex,
        position: [x, y, z],
        tag: details.tag,
        desc: details.desc
      };
    });
  }, []);

  const pinsRefs = useRef([]);

  // Animate spinning crystals and expanding ripple rings
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    cities.forEach((_, index) => {
      const pinGroup = pinsRefs.current[index];
      if (!pinGroup) return;

      const beam = pinGroup.children[0];
      const diamond = pinGroup.children[1];
      const outerRing = pinGroup.children[2];
      const innerRing = pinGroup.children[3];
      const ripple = pinGroup.children[4];

      // 1. Float and Spin diamond crystal
      if (diamond) {
        diamond.position.y = 1.25 + Math.sin(elapsedTime * 1.8 + index) * 0.08;
        diamond.rotation.y = elapsedTime * 1.6 + index;
        diamond.rotation.x = elapsedTime * 0.4;
      }

      // 2. Rotate base compass rings
      if (outerRing) outerRing.rotation.z = elapsedTime * 0.6;
      if (innerRing) innerRing.rotation.z = -elapsedTime * 1.1;

      // 3. Pulse bottom ripple size & opacity
      if (ripple) {
        const scaleVal = 1.0 + (elapsedTime + index * 0.5) % 1.5;
        ripple.scale.set(scaleVal, scaleVal, 1);
        ripple.material.opacity = 0.45 * (1.0 - (scaleVal - 1.0) / 1.5);
      }
    });
  });

  const prevActiveCityRef = useRef(activeCity);

  // Auto-zoom back to global view when activeCity is cleared
  useEffect(() => {
    if (prevActiveCityRef.current && !activeCity) {
      if (controls) {
        controls.enabled = false;
        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(controls.target);

        gsap.to(controls.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.5,
          ease: 'power3.inOut'
        });

        gsap.to(camera.position, {
          x: 0,
          y: 15,
          z: 15,
          duration: 1.5,
          ease: 'power3.inOut',
          onUpdate: () => {
            camera.lookAt(controls.target);
          },
          onComplete: () => {
            controls.enabled = true;
            controls.update();
          }
        });
      } else {
        gsap.to(camera.position, {
          x: 0,
          y: 15,
          z: 15,
          duration: 1.5,
          ease: 'power3.inOut'
        });
      }
    }
    prevActiveCityRef.current = activeCity;
  }, [activeCity, camera, controls]);

  const handlePinClick = (city, pos) => {
    // 1. Set active city immediately for instant responsive UI feedback
    if (onSelectCity) onSelectCity(city.name);

    // 2. Camera fly zoom transition using GSAP
    // Points slightly to the right of the city (pos[0] + 0.9) so the city shifts to the left
    const offsetX = 0.9;
    const targetPos = new THREE.Vector3(pos[0] + offsetX, pos[1] + 2.8, pos[2] + 4.5);

    if (controls) {
      // Temporarily disable controls to prevent conflicts during tween
      controls.enabled = false;
      
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);

      // Animate target to offset position
      gsap.to(controls.target, {
        x: pos[0] + offsetX,
        y: pos[1],
        z: pos[2],
        duration: 1.5,
        ease: 'power3.inOut'
      });

      // Animate position
      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(controls.target);
        },
        onComplete: () => {
          controls.enabled = true;
          controls.update();
          if (onArrival) onArrival(city.name);
        }
      });
    } else {
      // Fallback if controls are not loaded yet
      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: 'power3.inOut',
        onComplete: () => {
          if (onArrival) onArrival(city.name);
        }
      });
    }
  };

  return (
    <group>
      {cities.map((city, index) => {
        return (
          <group
            key={city.name}
            ref={(el) => (pinsRefs.current[index] = el)}
            position={city.position}
            onClick={(e) => {
              e.stopPropagation();
              handlePinClick(city, city.position);
            }}
          >
            {/* 1) Volumetric Light Beam */}
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.04, 0.06, 1.2, 12, 1, true]} />
              <meshBasicMaterial
                color={city.color}
                transparent
                opacity={0.32}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* 2) Spinning crystal octahedron */}
            <mesh position={[0, 1.3, 0]} castShadow>
              <octahedronGeometry args={[0.18, 0]} />
              <meshStandardMaterial
                color={city.color}
                emissive={city.color}
                emissiveIntensity={0.7}
                roughness={0.15}
                metalness={0.9}
                flatShading
              />
            </mesh>

            {/* 3) Base outer compass ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[0.2, 0.26, 32]} />
              <meshBasicMaterial
                color={city.color}
                side={THREE.DoubleSide}
                transparent
                opacity={0.65}
              />
            </mesh>

            {/* 4) Base inner compass pointer */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
              <ringGeometry args={[0.08, 0.13, 4, 1]} />
              <meshBasicMaterial
                color={city.color}
                side={THREE.DoubleSide}
                transparent
                opacity={0.75}
              />
            </mesh>

            {/* 5) Expanding pulse ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
              <ringGeometry args={[0.1, 0.5, 32]} />
              <meshBasicMaterial
                color={city.color}
                side={THREE.DoubleSide}
                transparent
                opacity={0.4}
              />
            </mesh>

            {/* Drei HTML floating placard label (only show when no city is active to avoid clutter and edge-clipping) */}
            {showLabels && !activeCity && (
              <Html
                position={[0, 1.8, 0]}
                center
                distanceFactor={12}
                className="pointer-events-auto"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(city, city.position);
                  }}
                  className="flex flex-col items-center select-none cursor-pointer group text-left"
                >
                  {/* Pinstriped Heritage Plaque card */}
                  <div
                    className={`relative px-4 py-2 bg-[var(--card-bg)] border border-[var(--border)] shadow-md select-none transition-transform duration-300 group-hover:scale-105 active:scale-95 flex flex-col items-center gap-0.5 min-w-[90px]
                      ${themeMode === 'inkwash' ? 'rounded-sm' : 'rounded-lg'}`}
                  >
                    {/* Retro Corner decorations */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[var(--accent)]/55" />
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[var(--accent)]/55" />
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[var(--accent)]/55" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[var(--accent)]/55" />

                    <span className="text-[12px] font-black text-[var(--text-primary)] tracking-widest">{city.name}</span>
                    <div className="w-8 h-[1px] bg-[var(--accent)]/40 my-0.5" />
                    <span className="text-[9px] font-bold text-[var(--accent)] whitespace-nowrap">{city.tag}</span>
                  </div>

                  {/* Gradient Connector Line */}
                  <div className="w-[1px] h-6 bg-gradient-to-b from-[var(--border)] to-transparent" />

                  {/* Pin Circle */}
                  <div className="w-2.5 h-2.5 relative flex items-center justify-center">
                    <span
                      className="absolute inset-0 rounded-full border opacity-50 animate-ping"
                      style={{ borderColor: city.colorHex, animationDuration: '1.2s' }}
                    />
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: city.colorHex }} />
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
