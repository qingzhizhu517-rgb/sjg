'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { getFallbackData } from '@/config/mockFallbackDb';
import { mockPoets } from '@/config/mockDetailData';

export default function PoetDetailPage({ params }) {
  const resolvedParams = use(params);
  const poetId = parseInt(resolvedParams.id);
  const { isReal, isAnime } = useTheme();

  // Load dataset from offline fallback DB
  const data = getFallbackData(`/poets/${poetId}`);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex-grow flex flex-col justify-center">
        <h2 className="text-xl font-black text-[var(--text-primary)]">未找到该诗人信息</h2>
        <Link href="/poets" className="text-[var(--accent)] hover:underline mt-4 font-bold">
          ← 返回诗人廊
        </Link>
      </div>
    );
  }

  const { poet, dynasty, poems } = data;
  const extra = mockPoets[poet.name] || {};

  const avatar = isAnime ? poet.avatarAnimeUrl || poet.avatarUrl : poet.avatarUrl;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex-grow w-full flex flex-col gap-6 text-left animate-fade-in">
      {/* Back navigation link */}
      <div className="pb-2 select-none">
        <Link
          href="/poets"
          className="text-xs font-black tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          ← 返回齐鲁名士廊
        </Link>
      </div>

      {/* 1. EXHIBITION REAL LAYOUT */}
      {isReal ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Portrait & Seals */}
          <aside className="lg:col-span-1 flex flex-col gap-6">
            <div className="card overflow-hidden border-[var(--border-light)] p-3 rounded-2xl relative shadow-md">
              <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[var(--accent)]/45 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[var(--accent)]/45 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[var(--accent)]/45 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[var(--accent)]/45 pointer-events-none" />

              <div className="w-full h-80 bg-[var(--bg-secondary)]/20 overflow-hidden rounded-xl relative select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={poet.name} className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 border border-black/5 pointer-events-none" />
              </div>
            </div>

            <div className="card p-5.5 flex flex-col gap-4 text-left rounded-2xl relative shadow-md">
              <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[var(--accent)]/45 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[var(--accent)]/45 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[var(--accent)]/45 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[var(--accent)]/45 pointer-events-none" />

              <h1 className="text-2xl font-black tracking-wider text-[var(--text-primary)] font-serif">
                {poet.name}
              </h1>
              {dynasty && (
                <span className="text-[10px] font-black text-[var(--accent)] border border-[var(--accent)]/45 px-2 py-0.5 rounded self-start tracking-widest bg-[var(--accent)]/5">
                  {dynasty.name}
                </span>
              )}

              <div className="flex flex-col gap-2.5 border-t border-[var(--border-light)]/50 pt-4 text-xs">
                {poet.birthYear && (
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--text-muted)] select-none">生卒</span>
                    <span className="font-black text-[var(--text-secondary)]">{poet.birthYear} — {poet.deathYear || '？'}年</span>
                  </div>
                )}
                {poet.birthplace && (
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--text-muted)] select-none">籍贯</span>
                    <span className="font-black text-[var(--text-secondary)]">{poet.birthplace}</span>
                  </div>
                )}
              </div>

              {poet.style && (
                <div className="border-t border-[var(--border-light)]/50 pt-4 flex justify-center select-none">
                  <div className="cinnabar-seal text-xs font-black tracking-widest px-3 py-1">
                    {poet.style}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Column: Biography & Poems Table of Contents */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            {/* Biography block */}
            {poet.biography && (
              <div className="card p-6 flex flex-col gap-4 rounded-2xl relative shadow-md">
                <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[var(--accent)]/45 pointer-events-none" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[var(--accent)]/45 pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[var(--accent)]/45 pointer-events-none" />
                <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[var(--accent)]/45 pointer-events-none" />

                <h2 className="section-heading text-lg font-black font-serif">生平简介</h2>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed indent-8 select-text font-serif">
                  {poet.biography}
                </p>
              </div>
            )}

            {/* Representative Poems */}
            {poems.length > 0 && (
              <div className="card p-6 flex flex-col gap-4 rounded-2xl relative shadow-md">
                <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[var(--accent)]/45 pointer-events-none" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[var(--accent)]/45 pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[var(--accent)]/45 pointer-events-none" />
                <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[var(--accent)]/45 pointer-events-none" />

                <h2 className="section-heading text-lg font-black font-serif">代表诗词</h2>
                
                <div className="flex flex-col gap-3">
                  {poems.map((poem, index) => (
                    <Link
                      key={poem.id}
                      href={`/poems/${poem.id}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)]/20 border border-[var(--border-light)] hover:border-[var(--accent)] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-[var(--text-muted)] tracking-wider">
                          卷 {index + 1}
                        </span>
                        <span className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif">
                          {poem.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-2 sm:mt-0 font-medium italic select-none">
                        {poem.content?.split('\n')[0]}…
                      </div>
                      <span className="text-[10px] font-black text-[var(--accent)] mt-2 sm:mt-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        阅览全文 →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* 2. CLASSICAL INKWASH SCROLL LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start font-serif">
          
          {/* Left Column: Parallax Scroll Book Cover */}
          <aside className="lg:col-span-4 select-none">
            <div className="card overflow-hidden border-[var(--border)] p-4 relative bg-[#faf6ee] shadow-lg flex flex-col items-center rounded-sm">
              <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[#c23a2b]/35 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[#c23a2b]/35 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[#c23a2b]/35 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[#c23a2b]/35 pointer-events-none" />

              <div className="w-full h-96 relative overflow-hidden rounded-sm border border-[var(--border)] bg-[#EBE5D8]/20 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={poet.name} className="w-full h-full object-cover object-top opacity-90" />
                
                {/* Calligraphic Vertical Text overlay */}
                {extra.verticalPoetry && (
                  <div className="absolute inset-y-0 right-4 flex items-center select-none writing-mode-vertical text-xl font-bold tracking-widest text-[#1a1a1a]/85 text-shadow bg-[#faf6ee]/80 px-2.5 py-4 border border-[var(--border)]/60 rounded shadow-sm">
                    {extra.verticalPoetry}
                  </div>
                )}

                {/* Bottom Signature seal overlay */}
                <div className="absolute bottom-4 left-4 bg-[#faf6ee]/95 border border-[var(--border)]/70 px-2 py-1 shadow-sm flex items-center gap-1">
                  <span className="text-xs font-black text-[#1a1a1a] tracking-wider">{poet.name}</span>
                  <div className="w-4 h-4 bg-[#c23a2b] text-white flex items-center justify-center text-[8px] font-black tracking-tighter leading-none rounded-sm">
                    印
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Inkwash details */}
          <section className="lg:col-span-8 flex flex-col gap-8 text-left">
            <div>
              <h1 className="text-3xl font-black text-[#1a1a1a] tracking-widest flex items-center gap-2 font-serif select-none">
                {poet.name}
                <div className="w-6 h-6 border border-[#c23a2b] text-[#c23a2b] text-[10px] font-black flex items-center justify-center tracking-tighter leading-none rounded-sm bg-[#faf6ee] transform rotate-3">
                  印
                </div>
              </h1>
              {extra.impact && (
                <p className="text-xs text-[#4a4a4a] italic mt-2.5 font-medium leading-relaxed max-w-xl font-serif select-text">
                  {extra.impact.substring(0, 55)}…
                </p>
              )}
            </div>

            {/* Quick Metadata grid cells */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-[var(--border)]">
              {[
                { label: '字', val: extra.zi },
                { label: '号', val: extra.hao },
                { label: '生卒年', val: extra.years },
                { label: '籍贯', val: extra.place }
              ].map((cell, idx) => (
                <div key={idx} className="flex flex-col p-2.5 rounded bg-[#FAF6EE] border border-[var(--border)]/40 text-left relative">
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#c23a2b]/20" />
                  <span className="text-[10px] font-bold text-[#7a7a7a] tracking-widest select-none">{cell.label}</span>
                  <span className="text-xs font-black text-[#1a1a1a] mt-1 tracking-wider">{cell.val || '—'}</span>
                </div>
              ))}
            </div>

            {/* Biography Block */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black text-[#7a7a7a] tracking-widest select-none uppercase border-l-2 border-[#c23a2b] pl-2 font-serif">
                诗人简介
              </h3>
              <p className="text-xs text-[#4a4a4a] leading-relaxed indent-8 font-medium font-serif select-text">
                {poet.biography}
              </p>
            </div>

            {/* Horizontal Timeline milestones */}
            {extra.milestones && (
              <div className="flex flex-col gap-4 overflow-hidden">
                <h3 className="text-xs font-black text-[#7a7a7a] tracking-widest select-none uppercase border-l-2 border-[#c23a2b] pl-2 font-serif">
                  生平经历
                </h3>
                
                <div className="w-full overflow-x-auto pb-4">
                  <div className="flex gap-6 min-w-[700px] relative px-4 py-3">
                    {/* Background line track */}
                    <div className="absolute top-[22px] left-8 right-8 h-[1px] bg-gradient-to-r from-[var(--border)] via-[#c23a2b]/30 to-[var(--border)]" />
                    
                    {extra.milestones.map((ms, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center text-center relative z-10 max-w-[200px]">
                        {/* Node node dot */}
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-[#c23a2b] bg-[#faf6ee] flex items-center justify-center shadow-sm select-none">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#c23a2b]" />
                        </div>

                        {/* Details content */}
                        <div className="mt-3 text-center flex flex-col gap-1.5 select-text">
                          <span className="text-[10px] font-black text-[#c23a2b] tracking-wider select-none">
                            {ms.year}
                          </span>
                          <span className="text-xs font-black text-[#1a1a1a] tracking-wide font-serif">
                            {ms.title}
                          </span>
                          <p className="text-[9px] text-[#4a4a4a] leading-relaxed font-medium font-serif max-w-[160px]">
                            {ms.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Representative Quotes Grid */}
            {extra.works && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-black text-[#7a7a7a] tracking-widest select-none uppercase border-l-2 border-[#c23a2b] pl-2 font-serif">
                  代表作品
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {extra.works.map((work) => (
                    <div
                      key={work.title}
                      className="card p-4 bg-[#FAF6EE] border border-[var(--border)] flex flex-col gap-2 hover-lift text-left rounded-sm relative"
                    >
                      <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-[#c23a2b]/25 pointer-events-none" />
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-[#c23a2b]/25 pointer-events-none" />
                      <h4 className="text-xs font-black text-[#1a1a1a] font-serif">《{work.title}》</h4>
                      <p className="text-[11px] text-[#c23a2b] font-bold leading-relaxed italic font-serif mt-1">
                        “{work.quote}”
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Impact */}
            {extra.impact && (
              <div className="flex flex-col gap-3 p-5 rounded border border-dashed border-[#c23a2b]/25 bg-[#faf6ee] relative rounded-sm">
                <div className="absolute top-2 right-3 border border-[#c23a2b]/40 text-[#c23a2b] text-[8px] font-black px-1 py-0.5 rounded-sm scale-90 select-none font-serif">
                  千秋影响
                </div>
                <h3 className="text-xs font-black text-[#7a7a7a] tracking-widest select-none uppercase font-serif">
                  历史影响
                </h3>
                <p className="text-xs text-[#4a4a4a] leading-relaxed indent-8 mt-1.5 font-medium font-serif select-text">
                  {extra.impact}
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
