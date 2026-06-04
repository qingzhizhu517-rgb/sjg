'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import CanvasContainer from '@/components/map/CanvasContainer';
import AiChatBox from '@/components/AiChatBox';
import { mockCities, mockSpots } from '@/config/mockDetailData';
import { mockSpotsList } from '@/config/mockFallbackDb';

const cities = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营'];

const getCityStampPos = (city) => {
  const coords = {
    '菏泽': { left: '12%', top: '78%' },
    '济宁': { left: '26%', top: '72%' },
    '泰安': { left: '42%', top: '60%' },
    '聊城': { left: '24%', top: '48%' },
    '济南': { left: '46%', top: '46%' },
    '德州': { left: '32%', top: '24%' },
    '淄博': { left: '62%', top: '48%' },
    '滨州': { left: '64%', top: '26%' },
    '东营': { left: '80%', top: '22%' }
  };
  return coords[city] || { left: '50%', top: '50%' };
};

// Mini SVG Terrain map layout for each city plate
function CityTerrainMap({ name }) {
  const { theme } = useTheme();
  const strokeColor = theme === 'inkwash' ? '#8e352e' : 'var(--accent)';

  let svgContent = null;
  let labelText = '';

  switch (name) {
    case '济南':
      labelText = '泉城华山';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M20 80 Q50 30 80 80 T140 80" fill="none" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
          <path d="M60 80 Q90 40 120 80" fill="none" stroke={strokeColor} strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx="100" cy="85" r="10" fill="none" stroke={strokeColor} strokeWidth={1} />
          <circle cx="100" cy="85" r="5" fill="none" stroke={strokeColor} strokeWidth={1} />
          <path d="M98 85 L98 75 M102 85 L102 75" fill="none" stroke={strokeColor} strokeWidth={1.5} />
        </svg>
      );
      break;
    case '泰安':
      labelText = '岱宗独尊';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M10 90 L70 30 L100 60 L130 15 L190 90 Z" fill="none" stroke={strokeColor} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M100 60 L130 15" fill="none" stroke={strokeColor} strokeWidth={1} strokeDasharray="2 2" />
          <circle cx="40" cy="35" r="8" fill="none" stroke={strokeColor} strokeWidth={1.5} />
          <path d="M40 20 L40 24 M40 46 L40 50 M25 35 L29 35 M46 35 L50 35" fill="none" stroke={strokeColor} strokeWidth={1} />
        </svg>
      );
      break;
    case '济宁':
      labelText = '运河儒都';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M10 50 C50 10, 80 90, 150 50" fill="none" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
          <path d="M80 30 L110 10 L140 30 M90 30 L90 45 M130 30 L130 45" fill="none" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
          <rect x="95" y="32" width="30" height="13" fill="none" stroke={strokeColor} strokeWidth={1.5} />
        </svg>
      );
      break;
    case '聊城':
      labelText = '东昌湖阁';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <ellipse cx="90" cy="50" rx="45" ry="35" fill="none" stroke={strokeColor} strokeWidth={1.5} strokeDasharray="4 2" />
          <rect x="75" y="40" width="30" height="20" fill="none" stroke={strokeColor} strokeWidth={2} />
          <path d="M70 40 L110 40 M75 35 L105 35 M90 35 L90 30" fill="none" stroke={strokeColor} strokeWidth={1.5} />
        </svg>
      );
      break;
    case '菏泽':
      labelText = '曹州牡丹';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <circle cx="90" cy="50" r="10" fill="none" stroke={strokeColor} strokeWidth={1.5} />
          <path d="M90 40 C75 30, 75 70, 90 60 C105 70, 105 30, 90 40 Z" fill="none" stroke={strokeColor} strokeWidth={1} />
          <path d="M80 50 C70 35, 110 35, 100 50 C110 65, 70 65, 80 50 Z" fill="none" stroke={strokeColor} strokeWidth={1} />
        </svg>
      );
      break;
    case '德州':
      labelText = '苏禄古陵';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M10 20 Q120 10 90 90" fill="none" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
          <path d="M70 60 L100 40 L130 60 M85 60 L85 80 M115 60 L115 80" fill="none" stroke={strokeColor} strokeWidth={2} />
          <ellipse cx="100" cy="40" rx="6" ry="3" fill="none" stroke={strokeColor} strokeWidth={1} />
        </svg>
      );
      break;
    case '淄博':
      labelText = '鲁山聊斋';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M20 80 L50 45 L80 65 L110 30 L150 80 Z" fill="none" stroke={strokeColor} strokeWidth={2} strokeLinejoin="round" />
          <path d="M85 40 Q90 10 95 30 T105 25" fill="none" stroke={strokeColor} strokeWidth={1.5} />
        </svg>
      );
      break;
    case '滨州':
      labelText = '黄河城堡';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M20 70 C80 10, 100 90, 160 30" fill="none" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />
          <path d="M50 80 L50 65 L60 65 L60 70 L70 70 L70 65 L80 65 L80 80 Z" fill="none" stroke={strokeColor} strokeWidth={1.5} />
        </svg>
      );
      break;
    case '东营':
      labelText = '河口黄蓝';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M10 50 L80 50 M80 50 L140 25 M80 50 L140 75" fill="none" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />
          <path d="M130 15 Q145 25 160 15 M130 50 Q145 60 160 50 M130 85 Q145 95 160 85" fill="none" stroke={strokeColor} strokeWidth={1.5} />
        </svg>
      );
      break;
    default:
      labelText = '齐鲁古区';
      svgContent = (
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <rect x="20" y="20" width="160" height="60" rx="5" fill="none" stroke={strokeColor} strokeWidth={1.5} strokeDasharray="5 5" />
        </svg>
      );
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center pr-12 select-none">
      <div className="w-full h-full flex items-center justify-center">
        {svgContent}
      </div>
      {labelText && (
        <div className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center border border-[var(--accent)]/30 rounded px-1.5 py-2.5 bg-[var(--card-bg)] shadow-[0_4px_12px_rgba(184,134,11,0.06)] animate-fade-in shrink-0">
            <span className="text-[10px] font-black text-[#8e352e] writing-mode-vertical tracking-widest leading-none font-serif select-none">
              {labelText}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  const router = useRouter();
  const { theme, isReal } = useTheme();
  const [selectedCity, setSelectedCity] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [scrollOpened, setScrollOpened] = useState(false);

  // Parallax scrolling mouse coordinate tracking
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (theme === 'inkwash') {
      const timer = setTimeout(() => setScrollOpened(true), 200);
      return () => clearTimeout(timer);
    } else {
      setScrollOpened(false);
    }
  }, [theme]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMouseCoords({ x, y });
  };

  const resetParallax = () => {
    setMouseCoords({ x: 0, y: 0 });
  };

  const getParallaxStyle = (factor) => {
    const tx = mouseCoords.x * 25 * factor;
    const ty = mouseCoords.y * 20 * factor;
    return {
      transform: `translate3d(${tx}px, ${ty}px, 0)`,
    };
  };

  const getCityData = (cityName) => {
    return mockCities[cityName] || { desc: '齐鲁重镇，文脉千秋。', tag: '古代地标', subtitle: '齐鲁古区' };
  };

  return (
    <div
      onMouseMove={!isReal ? handleMouseMove : undefined}
      onMouseLeave={!isReal ? resetParallax : undefined}
      className="flex-grow w-full h-[calc(100vh-var(--nav-height))] relative overflow-hidden"
    >
      {/* 1. REAL 3D EXPOSITION MODE */}
      {isReal ? (
        <div className="w-full h-full relative bg-[#fbf8f3] animate-fade-in">
          {/* Top-Left Premium Calligraphy Title Badge (only shown when a city is active) */}
          {selectedCity && (
            <div className="absolute top-8 left-8 z-20 flex items-center gap-3 animate-fade-in select-none">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] text-white font-bold flex items-center justify-center text-xl shadow-md border border-[var(--accent-dark)] font-serif animate-spin-once">
                {selectedCity[0]}
              </div>
              <div className="flex flex-col text-left bg-white/70 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm">
                <span className="text-xs font-black tracking-widest text-[var(--accent)] font-serif uppercase">
                  ACTIVE REGION
                </span>
                <h2 className="text-lg font-black tracking-wider text-[var(--text-primary)] font-serif mt-0.5">
                  {selectedCity}市 · {getCityData(selectedCity).subtitle}
                </h2>
              </div>
            </div>
          )}

          {/* R3F WebGL 3D Canvas Box */}
          <div className="w-full h-full">
            <CanvasContainer
              onSelectCity={setSelectedCity}
              onArrival={setSelectedCity}
              activeCity={selectedCity}
              showLabels={showLabels}
              themeMode={theme}
            />
          </div>

          {/* Unified Dynamic Sidebar Panel (Global HUD + City Details) */}
          <div className="absolute top-8 right-8 bottom-8 w-[380px] bg-white/70 border border-white/25 rounded-2xl p-6 z-20 shadow-[0_16px_48px_rgba(61,43,31,0.12)] hover:shadow-[0_20px_56px_rgba(61,43,31,0.18)] backdrop-blur-xl text-left flex flex-col transition-all duration-500 overflow-hidden select-text border-[var(--border-light)]">
            {/* Retro Corner decorations */}
            <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--accent)]/60 pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--accent)]/60 pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--accent)]/60 pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--accent)]/60 pointer-events-none" />

            {!selectedCity ? (
              /* GLOBAL HUD PANEL VIEW */
              <div className="w-full h-full flex flex-col gap-4.5 animate-fade-in justify-between">
                <div className="flex flex-col gap-4.5">
                  <div>
                    <span className="text-[9px] font-black text-[var(--accent)] border border-[var(--accent)]/45 px-2 py-0.5 rounded tracking-widest bg-[var(--accent)]/5">
                      DH EXHIBITION
                    </span>
                    <h2 className="text-xl font-black text-[var(--text-primary)] tracking-wider mt-2.5 font-serif">
                      三维地理文脉舱
                    </h2>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    数字人文视域下黄河流域（山东段）文学景观时空交互。拖拽鼠标旋转视角，点击地标飞往对应城市。
                  </p>

                  {/* Quick Metrics with Inner shadows */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-2 bg-[var(--bg-secondary)]/35 border border-[var(--border-light)] rounded-xl text-center shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-[var(--accent)]">10</span>
                      <span className="text-[9px] font-black text-[var(--text-muted)] mt-0.5">核心景点</span>
                    </div>
                    <div className="flex flex-col border-x border-[var(--border-light)]">
                      <span className="text-lg font-black text-[var(--accent)]">6</span>
                      <span className="text-[9px] font-black text-[var(--text-muted)] mt-0.5">文人大家</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-[var(--accent)]">8</span>
                      <span className="text-[9px] font-black text-[var(--text-muted)] mt-0.5">传世名篇</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Actions */}
                  <button
                    onClick={() => setShowLabels(!showLabels)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--accent)]/10 hover:bg-[var(--accent)] border border-[var(--accent)]/30 hover:border-transparent text-[var(--accent-dark)] hover:text-white rounded-xl text-xs font-black tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    {showLabels ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                    {showLabels ? '隐藏地区标签' : '显示地区标签'}
                  </button>

                  <div className="border-t border-dashed border-[var(--border-light)] pt-3 text-[10px] text-[var(--text-muted)] leading-relaxed">
                    说明：在右侧列表中或直接在3D地图上点击发光节点，可快速预览城市文学名胜，并在三维空间内精准定位。
                  </div>
                </div>
              </div>
            ) : (
              /* REGION DETAIL VIEW PANEL */
              <div className="w-full h-full flex flex-col gap-4 animate-fade-in justify-between overflow-hidden">
                {/* Plaque Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-2 select-none">
                  <div className="flex flex-col text-left">
                    <h3 className="text-base font-black text-[var(--text-primary)] font-serif tracking-wide">
                      {selectedCity}市
                    </h3>
                    <span className="text-[9px] font-black text-[var(--accent)] tracking-widest mt-0.5 uppercase">
                      {getCityData(selectedCity).subtitle || '齐鲁重镇'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCity(null)}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs font-bold border border-[var(--border-light)] rounded px-2 py-1 bg-[var(--bg-secondary)]/30 hover:bg-[var(--accent)]/10 transition-all select-none cursor-pointer flex items-center gap-1"
                  >
                    <span>返回全省</span>
                    <span>×</span>
                  </button>
                </div>

                {/* Scrollable details contents */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin select-text">
                  {/* Description */}
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed indent-8 select-text font-medium font-serif">
                    {getCityData(selectedCity).desc}
                  </p>

                  {/* Plates 2D Terrain Layout */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[10px] font-black text-[var(--accent)] tracking-widest border-b border-[var(--border-light)]/50 pb-1 select-none font-serif">
                      板块平面地貌
                    </h4>
                    <div className="w-full h-28 rounded-xl bg-[var(--bg-secondary)]/30 border border-[var(--border-light)]/65 flex items-center justify-center relative p-3 select-none">
                      <CityTerrainMap name={selectedCity} />
                    </div>
                  </div>

                  {/* Scenic Spots lists */}
                  <div className="flex flex-col gap-2.5">
                    <h4 className="text-[10px] font-black text-[var(--accent)] tracking-widest border-b border-[var(--border-light)]/50 pb-1 select-none font-serif">
                      经典吟咏景点
                    </h4>
                    <div className="flex flex-col gap-2">
                      {mockSpotsList.filter(s => s.region === selectedCity).map((spot, index) => {
                        const verticalPoetry = mockSpots[spot.name]?.verticalText || '黄河九曲，文脉千载。';
                        return (
                          <div
                            key={spot.id}
                            onClick={() => router.push(`/spots/${spot.id}`)}
                            className="p-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)]/15 hover:border-[var(--accent)] cursor-pointer hover:shadow-sm transition-all duration-300 flex justify-between items-center gap-3 group text-left"
                          >
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                              <div className="flex items-center gap-1.5 select-none">
                                <span className="text-[10px] font-black text-[var(--accent)] font-mono">{index + 1}</span>
                                <h5 className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif truncate">
                                  {spot.name}
                                </h5>
                              </div>
                              {spot.address && (
                                <span className="text-[9px] text-[var(--text-muted)] truncate select-none">{spot.address}</span>
                              )}
                              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 mt-1 select-text">
                                {spot.description}
                              </p>
                            </div>
                            
                            {/* Vertical calligraphy quote banner */}
                            <div className="border-l border-dashed border-[var(--border)]/75 pl-3 shrink-0 flex items-center justify-center max-h-20 select-none">
                              <span className="text-[9px] font-black text-[#8e352e] writing-mode-vertical tracking-widest leading-none font-serif max-h-20 overflow-hidden text-ellipsis whitespace-nowrap">
                                {verticalPoetry}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {mockSpotsList.filter(s => s.region === selectedCity).length === 0 && (
                        <span className="text-[10px] text-[var(--text-muted)] text-center py-4 font-bold select-none font-serif">
                          暂未录入该市文学景观。
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. CLASSICAL INKWASH PARALLAX SCROLL MODE */
        <div className="w-full h-full relative bg-[#F4EFE4] flex items-center justify-center px-8 md:px-16 py-10 animate-fade-in select-none">
          <div className="w-full max-w-7xl h-full flex flex-col md:flex-row items-center gap-10">
            
            {/* Left calligraphic panel */}
            <aside className="w-full md:w-80 flex flex-col text-left justify-center shrink-0">
              <div className="flex items-start gap-4">
                {/* Red Seal */}
                <div className="border-[2px] border-[#c23a2b] text-[#c23a2b] font-bold p-1 px-2.5 text-xs tracking-wider select-none shrink-0 transform -rotate-6 shadow-sm font-serif">
                  天下大观
                </div>
                <h1 className="text-3xl font-black tracking-widest text-[#1a1a1a] leading-normal font-serif">
                  山东揽胜<br />黄河入海
                </h1>
              </div>
              <p className="text-xs text-[#4a4a4a] leading-relaxed mt-6 mb-6 font-medium font-serif">
                黄河自菏泽入境，经梁山、东平，过济南，北折德州，蜿蜒东营归海。千百年来，诗圣杜甫、诗仙李白同游于此，易安居士、稼轩豪杰吟唱不断。
              </p>
              <div className="flex flex-wrap gap-2">
                {['五岳独尊', '泉城名胜', '运河古都', '黄河湿地'].map((stamp) => (
                  <div
                    key={stamp}
                    className="border border-[#c23a2b]/30 text-[#c23a2b] text-[10px] font-bold px-2 py-0.5 rounded-sm bg-[#FAF6EE] select-none font-serif"
                  >
                    {stamp}
                  </div>
                ))}
              </div>
            </aside>

            {/* Right Parchment Wood Scroll Map */}
            <div className="flex-1 w-full h-[320px] md:h-[480px] flex items-center justify-center relative">
              
              {/* Left wooden scroll rod */}
              <div className="w-3.5 h-[95%] bg-gradient-to-b from-[#705e46] via-[#948166] to-[#594935] rounded-full shadow-md z-10 shrink-0" />
              
              {/* Paper body with animated roll-out effect */}
              <div
                style={{ width: scrollOpened ? '100%' : '0%' }}
                className="h-[90%] bg-[#faf6ee] border-y border-[#c8c0b0] relative overflow-hidden shadow-inner flex select-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                
                {/* Scroll Inner content (faded in after scroll opens) */}
                <div className={`absolute inset-0 transition-opacity duration-700 delay-500 ${scrollOpened ? 'opacity-100' : 'opacity-0'}`}>
                  {/* Background Layer: Stylized Ink Mountains */}
                  <div
                    style={getParallaxStyle(0.25)}
                    className="absolute inset-0 flex items-end opacity-20 transition-transform duration-300 ease-out pointer-events-none select-none"
                  >
                    <svg className="w-full h-44" viewBox="0 0 1000 200" preserveAspectRatio="none">
                      <path d="M0 200 L150 100 L300 200 Z" fill="#6e6b64" />
                      <path d="M200 200 L400 80 L600 200 Z" fill="#4d4b45" />
                      <path d="M500 200 L700 120 L900 200 Z" fill="#807d76" />
                      <path d="M750 200 L880 90 L1000 200 Z" fill="#5c5a54" />
                    </svg>
                  </div>

                  {/* Midground Layer: Yellow River Flowing Path (SVG) */}
                  <div
                    style={getParallaxStyle(0.5)}
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out pointer-events-none"
                  >
                    <svg className="w-full h-full px-12 py-8 opacity-65" viewBox="0 0 1000 600" preserveAspectRatio="none">
                      <path
                        d="M100,520 Q200,420 300,480 T500,320 T700,260 T900,100"
                        fill="none"
                        stroke="#8e352e"
                        strokeWidth="6"
                        strokeDasharray="10 8"
                        className="stroke-[6px]"
                      />
                    </svg>
                  </div>

                  {/* Foreground Layer: City Red Seals Stamps */}
                  <div
                    style={getParallaxStyle(1.0)}
                    className="absolute inset-0 p-12 transition-transform duration-300 ease-out"
                  >
                    {cities.map((city) => {
                      const pos = getCityStampPos(city);
                      return (
                        <div
                          key={city}
                          onClick={() => router.push(`/regions/${city}`)}
                          style={{ left: pos.left, top: pos.top }}
                          className="absolute cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200 flex items-center gap-1.5 select-none"
                        >
                          {/* Red Seal */}
                          <div className="w-7 h-7 border border-[#c23a2b] bg-[#faf6ee] text-[#c23a2b] font-bold flex flex-col justify-center items-center text-[10px] tracking-tighter leading-none p-1 font-serif shadow-sm transform -rotate-3 select-none">
                            <span>{city[0]}</span>
                            <span className="mt-[-1px]">{city[1]}</span>
                          </div>
                          {/* Vertical Label */}
                          <span className="text-[11px] font-black text-[#1a1a1a] tracking-widest writing-mode-vertical uppercase select-none font-serif">
                            {city}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
              
              {/* Right wooden scroll rod */}
              <div className="w-3.5 h-[95%] bg-gradient-to-b from-[#705e46] via-[#948166] to-[#594935] rounded-full shadow-md z-10 shrink-0" />
            </div>

          </div>
        </div>
      )}

      {/* GLOBAL AI CHAT PANEL - dynamically slides to left when right details panel opens */}
      <div className={`fixed bottom-6 transition-all duration-500 z-40 flex flex-col items-end ${selectedCity ? 'right-[410px]' : 'right-6'}`}>
        <AiChatBox />
      </div>
    </div>
  );
}
