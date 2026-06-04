'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { getFallbackData } from '@/config/mockFallbackDb';

export default function TimelinePage() {
  const { theme } = useTheme();

  // Load dataset from fallback DB
  const timelineData = getFallbackData('/timeline') || [];

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 flex-grow w-full flex flex-col gap-6 select-text">
      
      {/* Page Hero */}
      <div className="page-hero-container">
        <div className="cinnabar-seal mb-2 scale-90 select-none">文脉印鉴</div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] font-serif tracking-widest">
          朝代年轮
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-medium select-none mt-1">
          沿着历史的河流，见证诗歌与时代共鸣的交响
        </p>
      </div>

      {/* Timeline track container */}
      <div className="flex flex-col text-left mt-8 pl-4 select-text">
        <div className="relative">
          {timelineData.map((item, idx) => {
            const { dynasty, events = [], poets = [], poems = [] } = item;
            
            return (
              <div key={dynasty.id} className="flex gap-6 pb-12 relative group">
                
                {/* 1. Left track node indicator */}
                <div className="flex flex-col items-center shrink-0 w-6">
                  {/* Node Dot representing seal */}
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] border-2 border-white flex items-center justify-center shadow-md shadow-[var(--accent)]/30 group-hover:scale-110 transition-all select-none relative z-10 text-[9px] font-black text-white font-serif mt-6">
                    印
                  </div>
                  {/* Vertical connector line */}
                  {idx < timelineData.length - 1 && (
                    <div className="flex-1 w-[3px] bg-gradient-to-b from-[var(--accent)] via-[var(--border)] to-[var(--accent)] mt-2 rounded-full opacity-60" />
                  )}
                </div>

                {/* 2. Right timeline content card with Retro Corner Frames */}
                <div className={`flex-1 p-6 md:p-8 card border-[var(--border-light)] transition-all select-text
                  ${theme === 'inkwash' 
                    ? 'rounded-sm border-t-4 border-t-[var(--accent)]' 
                    : 'rounded-2xl border-t-[6px] border-t-[#2b1d12] shadow-[0_8px_32px_rgba(61,43,31,0.04)] hover:shadow-[0_12px_48px_rgba(61,43,31,0.08)]'}`}
                >
                  {/* Decorative Retro Corners */}
                  <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[var(--accent)]/45 pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[var(--accent)]/45 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[var(--accent)]/45 pointer-events-none" />
                  <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[var(--accent)]/45 pointer-events-none" />
                  
                  {/* Content Header (Dynasty, Dates, description) */}
                  <div className="border-b border-[var(--border-light)] pb-4 mb-5 flex flex-col gap-1.5">
                    <h2 className="text-xl font-black text-[var(--text-primary)] tracking-widest font-serif leading-none">
                      {dynasty.name}
                    </h2>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-wider">
                      公元 {dynasty.startYear} 年 — {dynasty.endYear} 年
                    </span>
                    {dynasty.description && (
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-2 select-text font-medium font-serif">
                        {dynasty.description}
                      </p>
                    )}
                  </div>

                  {/* Section: Historical Events */}
                  {events.length > 0 && (
                    <div className="mb-5 flex flex-col gap-2">
                      <h3 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-2 select-none">
                        <span className="w-5 h-5 rounded bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-[10px] font-black">
                          事
                        </span>
                        历史事件
                      </h3>
                      <div className="flex flex-col gap-2 pl-7 text-xs">
                        {events.map((ev) => (
                          <div key={ev.id} className="flex flex-col gap-0.5 py-1">
                            <span className="font-black text-[var(--accent-dark)] text-[10px]">
                              公元 {ev.year} 年
                            </span>
                            <span className="font-bold text-[var(--text-primary)] font-serif mt-0.5">
                              {ev.title}
                            </span>
                            {ev.significance && (
                              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-1">
                                {ev.significance}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section: Representative Poets */}
                  {poets.length > 0 && (
                    <div className="mb-5 flex flex-col gap-2">
                      <h3 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-2 select-none">
                        <span className="w-5 h-5 rounded bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-[10px] font-black">
                          人
                        </span>
                        代表诗人
                      </h3>
                      <div className="flex flex-wrap gap-2 pl-7">
                        {poets.map((poet) => (
                          <Link
                            key={poet.id}
                            href={`/poets/${poet.id}`}
                            className="text-[11px] font-bold py-1 px-3 rounded bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 border border-[var(--border)]/35 hover:border-[var(--accent)]/30 transition-all select-none"
                          >
                            {poet.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section: Poems list */}
                  {poems.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-2 select-none">
                        <span className="w-5 h-5 rounded bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-[10px] font-black">
                          诗
                        </span>
                        诗词作品
                      </h3>
                      <div className="flex flex-col gap-2 pl-7">
                        {poems.map((poem) => (
                          <Link
                            key={poem.id}
                            href={`/poems/${poem.id}`}
                            className="flex items-center justify-between text-xs py-1.5 px-3 rounded-md hover:bg-[var(--bg-secondary)]/40 text-[var(--text-primary)] hover:text-[var(--accent)] border border-transparent hover:border-[var(--border-light)] transition-all font-serif"
                          >
                            <span>《{poem.title}》</span>
                            <span className="text-[10px] opacity-0 group-hover:opacity-100 select-none">→</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
