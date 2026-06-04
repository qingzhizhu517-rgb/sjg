'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { getFallbackData } from '@/config/mockFallbackDb';
import { mockCities, mockSpots } from '@/config/mockDetailData';

export default function RegionSpotsPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  // Ensure encoded Chinese parameters like %E6%B5%8E%E5%8D%97 are decoded to "济南"
  const region = decodeURIComponent(resolvedParams.region);
  const { isReal, isAnime } = useTheme();

  // Query spots in the region
  const data = getFallbackData('/spots', { region });
  const spots = data ? data.records : [];

  const getCityData = (cityName) => {
    return mockCities[cityName] || {
      english: 'CITY VIEW',
      subtitle: '齐鲁重镇 · 文脉千秋',
      desc: '齐鲁名邑，历史悠久。大好山河，诗意相传。',
      geo: '山东省黄河流域段',
      history: '千年古城，历代文人登临题咏，见证中华文脉之繁盛。',
      climate: '温带季风气候，四季分明',
      season: '春秋两季最佳'
    };
  };

  const getSpotData = (name) => {
    return mockSpots[name] || {
      verticalText: '黄河九曲，齐鲁揽胜；文脉千载，源远流长。',
      tag: '经典景区',
      history: '',
      play: ''
    };
  };

  const city = getCityData(region);

  const getSpotImage = (spot) => {
    return isAnime ? spot.imageAnimeUrl || spot.imageUrl : spot.imageUrl;
  };

  const padZero = (num) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex-grow w-full flex flex-col gap-6 text-left animate-fade-in">
      {/* Back to Map button */}
      <div className="pb-2 select-none">
        <Link
          href="/map"
          className="text-xs font-black tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          ← 返回齐鲁揽胜图
        </Link>
      </div>

      {/* 1. EXHIBITION REAL LAYOUT */}
      {isReal ? (
        <div className="flex flex-col gap-8">
          {/* Header hero */}
          <div className="text-center py-6 border-b border-[var(--border-light)] max-w-2xl mx-auto flex flex-col items-center gap-3 w-full">
            <div className="cinnabar-seal scale-90 mb-1 select-none">郡邑图乘</div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] font-serif tracking-wider">
              {region}市
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-medium select-none">
              该地区的黄河沿线经典文学景观
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => router.push(`/spots/${spot.id}`)}
                className="card hover-lift cursor-pointer flex flex-col overflow-hidden text-left border-[var(--border-light)] rounded-2xl shadow-[0_8px_24px_rgba(61,43,31,0.04)]"
              >
                {/* Decorative retro corners inside cards */}
                <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[var(--accent)]/45 pointer-events-none z-10" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[var(--accent)]/45 pointer-events-none z-10" />
                <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[var(--accent)]/45 pointer-events-none z-10" />
                <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[var(--accent)]/45 pointer-events-none z-10" />

                {/* Image block */}
                <div className="w-full h-48 overflow-hidden bg-[var(--bg-secondary)]/20 relative select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getSpotImage(spot)} alt={spot.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Body Content */}
                <div className="p-4 flex flex-col gap-1.5 select-text">
                  <h3 className="text-sm font-black text-[var(--text-primary)] font-serif">{spot.name}</h3>
                  {spot.address && (
                    <span className="text-[10px] text-[var(--text-muted)] truncate select-none">{spot.address}</span>
                  )}
                  {spot.description && (
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed h-12 overflow-hidden text-ellipsis mt-1 font-serif">
                      {spot.description}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {spots.length === 0 && (
              <div className="col-span-full py-16 text-center text-xs text-[var(--text-muted)] font-bold">
                暂未收录该地区核心景点，敬请期待。
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. CLASSICAL INKWASH SCROLL LAYOUT */
        <div className="w-full flex flex-col lg:flex-row items-start gap-10 font-serif">
          
          {/* Left Column: City Info */}
          <aside className="w-full lg:w-80 flex flex-col gap-6 text-left shrink-0">
            <div className="flex flex-col gap-1.5 border-b border-[var(--border)] pb-4">
              <h1 className="text-3xl font-black text-[#1a1a1a] tracking-widest writing-mode-vertical leading-none font-serif select-none">
                {region}市
              </h1>
              <span className="text-[9px] font-black text-[#7a7a7a] tracking-widest uppercase mt-2 select-none">{city.english}</span>
              <div className="text-[10px] text-[#c23a2b] font-bold mt-1 select-none">{city.subtitle}</div>
            </div>

            {/* City Landscape representation */}
            <div className="card p-3 bg-[#faf6ee] border-[var(--border)] select-none rounded-sm relative">
              <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-[#c23a2b]/25" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-[#c23a2b]/25" />
              <div className="w-full h-44 rounded-sm bg-[#EBE5D8]/40 flex items-center justify-center overflow-hidden border border-[#c8c0b0]/40">
                <div className="text-[10px] font-bold text-[var(--text-muted)] italic select-none">齐鲁古邑 山水画卷</div>
              </div>
            </div>

            {/* City Introduction */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-black text-[#7a7a7a] tracking-widest select-none border-l-2 border-[#c23a2b] pl-2">
                城市简介
              </h3>
              <p className="text-xs text-[#4a4a4a] leading-relaxed font-medium select-text">
                {city.desc}
              </p>
            </div>

            {/* Badges details grid */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-[var(--border)]">
              {[
                { label: '地理位置', val: city.geo },
                { label: '历史文化', val: city.history },
                { label: '气候特点', val: city.climate },
                { label: '最佳旅游季节', val: city.season }
              ].map((badge, idx) => (
                <div key={idx} className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-[#7a7a7a] tracking-widest select-none">{badge.label}</span>
                  <span className="text-xs font-black text-[#1a1a1a] mt-0.5 tracking-wide leading-relaxed select-text">{badge.val}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Right Column: Spots list with vertical calligraph text */}
          <section className="flex-grow w-full flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 select-none">
              <h2 className="text-lg font-black text-[#1a1a1a] tracking-widest font-serif">经典地标</h2>
              <button
                onClick={() => router.push('/map')}
                className="text-xs font-black text-[#c23a2b] hover:underline cursor-pointer"
              >
                点击其他区域 <strong>返回地图</strong>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spots.map((spot, index) => {
                const sData = getSpotData(spot.name);
                return (
                  <div
                    key={spot.id}
                    onClick={() => router.push(`/spots/${spot.id}`)}
                    className="card p-5 bg-[#faf6ee] border-[var(--border)] flex flex-col gap-4 cursor-pointer hover-lift text-left rounded-sm relative"
                  >
                    {/* Decorative Corner Seals */}
                    <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[#c23a2b]/35 pointer-events-none" />
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[#c23a2b]/35 pointer-events-none" />
                    <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[#c23a2b]/35 pointer-events-none" />
                    <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[#c23a2b]/35 pointer-events-none" />

                    {/* Header bar */}
                    <div className="flex items-center gap-2 border-b border-[var(--border)]/40 pb-2 select-none">
                      <span className="text-xs font-black text-[#c23a2b] font-mono">{padZero(index + 1)}</span>
                      <h3 className="text-sm font-black text-[#1a1a1a] tracking-wide font-serif">{spot.name}</h3>
                      {sData.tag && (
                        <span className="border border-[#c23a2b]/30 text-[#c23a2b] text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#FAF6EE] scale-90">
                          {sData.tag}
                        </span>
                      )}
                    </div>

                    {/* Image & vertical quote display */}
                    <div className="flex gap-4 items-stretch select-none">
                      {/* Image frame */}
                      <div className="w-28 h-28 bg-[#EBE5D8]/40 border border-[var(--border)]/65 rounded-sm overflow-hidden shrink-0 flex items-center justify-center">
                        <span className="text-[10px] text-[#7a7a7a] font-bold italic select-none">山水写意</span>
                      </div>
                      {/* Vertical calligraph */}
                      <div className="flex-1 border-l border-dashed border-[var(--border)]/65 pl-4 flex items-center justify-center">
                        <div className="text-xs font-black text-[#8e352e] writing-mode-vertical tracking-widest leading-relaxed select-none font-serif max-h-28 overflow-hidden text-ellipsis">
                          {sData.verticalText}
                        </div>
                      </div>
                    </div>

                    {/* Descriptions details */}
                    <div className="flex flex-col gap-1.5 text-xs select-text">
                      <p className="text-[#4a4a4a] leading-relaxed font-medium">
                        <strong>简介：</strong>{spot.description?.substring(0, 80)}…
                      </p>
                      {sData.history && (
                        <p className="text-[#4a4a4a] leading-relaxed font-medium">
                          <strong>历史文化：</strong>{sData.history?.substring(0, 80)}…
                        </p>
                      )}
                      {sData.play && (
                        <p className="text-[#4a4a4a] leading-relaxed font-medium select-none">
                          <strong>推荐玩法：</strong>{sData.play}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {spots.length === 0 && (
                <div className="col-span-full py-16 text-center text-xs text-[var(--text-muted)] font-bold">
                  暂未收录该地区经典景点，敬请期待。
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
