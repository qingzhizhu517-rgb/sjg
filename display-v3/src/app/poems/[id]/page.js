'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { getFallbackData } from '@/config/mockFallbackDb';

export default function PoemDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const poemId = parseInt(resolvedParams.id);
  const { isReal, isAnime } = useTheme();
  const [showAnnotation, setShowAnnotation] = useState(false);

  // Load from local DB
  const data = getFallbackData(`/poems/${poemId}`);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex-grow flex flex-col justify-center">
        <h2 className="text-xl font-black text-[var(--text-primary)]">未找到该诗词信息</h2>
        <button onClick={() => router.back()} className="text-[var(--accent)] hover:underline mt-4 font-bold cursor-pointer">
          ← 返回前页
        </button>
      </div>
    );
  }

  const { poem, poet, dynasty, spot } = data;
  const poemLines = poem?.content?.split('\n').filter(l => l.trim()) || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex-grow w-full flex flex-col gap-6 text-center select-text">
      
      {/* Top back bar */}
      <div className="text-left border-b border-[var(--border-light)] pb-2 select-none">
        <button
          onClick={() => router.back()}
          className="text-xs font-black tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer select-none"
        >
          ← 返回
        </button>
      </div>

      {/* 1. CLASSICAL INKWASH THREAD-BOUND BOOK MODE */}
      {isAnime ? (
        <div className="w-full flex flex-col items-center gap-8 animate-fade-in font-serif">
          {/* Book frame container */}
          <div className="w-full max-w-xl bg-[#faf6ee] border-[3px] border-[#3a352a] p-8 md:p-12 shadow-xl relative select-text flex flex-col items-center rounded-sm">
            {/* Thread bind marks on the left/right border to simulate classical book */}
            <div className="absolute top-0 bottom-0 left-[30px] border-r border-[#3a352a]/20 pointer-events-none" />
            
            {/* Book grid layout wrapper */}
            <div className="w-full border border-[#8e352e]/30 p-6 relative flex flex-col items-center">
              
              {/* Inner double border */}
              <div className="absolute inset-1 border-[2px] border-[#8e352e]/15 pointer-events-none" />

              {/* Title & Author header column */}
              <div className="flex flex-col items-center gap-2 mb-8 select-none">
                <span className="border-[1.5px] border-[#c23a2b] text-[#c23a2b] text-[9px] font-black px-2 py-0.5 rounded-sm transform rotate-[-2deg] select-none font-serif tracking-widest">
                  {dynasty?.name || '古代'}
                </span>
                <h1 className="text-3xl font-black tracking-widest text-[#1a1a1a] mt-2 font-serif leading-snug text-center">
                  {poem.title}
                </h1>
                {poet && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#4a4a4a] mt-1 select-none font-serif">
                    <Link href={`/poets/${poet.id}`} className="hover:text-[#c23a2b] transition-colors underline decoration-dashed">
                      {poet.name}
                    </Link>
                    <div className="w-4 h-4 bg-[#c23a2b] text-white flex items-center justify-center text-[7px] font-black tracking-tighter leading-none rounded-sm">
                      印
                    </div>
                  </div>
                )}
              </div>

              {/* Thread book vertical flow content block */}
              <div className="w-full flex justify-center py-4 select-text">
                <div
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  className="h-64 flex flex-row gap-6 md:gap-8 justify-center select-text max-w-full overflow-x-auto"
                >
                  {poemLines.map((line, i) => (
                    <div
                      key={i}
                      style={{ animationDelay: `${i * 0.08}s` }}
                      className="text-base md:text-lg font-black tracking-[4px] text-[#1a1a1a] font-serif ink-bleed-effect h-full flex flex-col justify-start border-r border-[#8e352e]/10 pr-2 select-text"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cinnabar annotations button trigger */}
              {poem.annotation && (
                <button
                  onClick={() => setShowAnnotation(!showAnnotation)}
                  className="mt-6 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#c23a2b]/10 hover:bg-[#c23a2b] text-[#8b1a1a] hover:text-white border border-[#c23a2b]/25 hover:border-transparent rounded-sm text-xs font-black tracking-widest transition-all select-none cursor-pointer"
                >
                  {showAnnotation ? '收起批注' : '品读批注'}
                </button>
              )}

              {/* Slide-out Annotations Panel */}
              {showAnnotation && poem.annotation && (
                <div className="w-full mt-6 p-4 rounded-sm bg-[#FAF6EE] border border-dashed border-[#c23a2b]/35 text-left animate-slide-up select-text">
                  <h3 className="text-xs font-black text-[#c23a2b] tracking-widest border-b border-[#c23a2b]/15 pb-1.5 mb-2 select-none font-serif">
                    批注与赏析
                  </h3>
                  <p className="text-[11px] text-[#4a4a4a] leading-relaxed whitespace-pre-wrap font-medium font-serif select-text">
                    {poem.annotation}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Creation Background under block */}
          {poem.background && (
            <div className="w-full max-w-xl flex flex-col gap-3.5 text-left select-text">
              <h2 className="text-xs font-black text-[#7a7a7a] tracking-widest border-l-2 border-[#c23a2b] pl-2 select-none uppercase font-serif">
                创作背景
              </h2>
              <div className="p-6 rounded-sm border border-[var(--border)] bg-[#faf6ee] text-xs text-[#4a4a4a] leading-relaxed shadow-sm indent-8 font-serif select-text">
                {poem.background}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 2. MODERN REAL SHI EXHIBITION LAYOUT */
        <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
          {/* Centered Modern Card */}
          <div className="w-full max-w-2xl card p-8 md:p-12 relative flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-4 left-6 text-3xl font-black text-[var(--border)] opacity-60 select-none">「</div>
            <div className="absolute bottom-4 right-6 text-3xl font-black text-[var(--border)] opacity-60 select-none">」</div>

            {/* Header info */}
            <div className="flex flex-col items-center gap-3.5 mb-8 select-none">
              {dynasty && (
                <span className="text-[9px] font-black text-[var(--accent)] border border-[var(--accent)]/45 px-3 py-0.5 rounded tracking-widest">
                  {dynasty.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-black tracking-[8px] text-[var(--text-primary)] leading-tight font-serif mt-1">
                {poem.title}
              </h1>
              <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)] mt-1 select-none">
                {poet && (
                  <Link href={`/poets/${poet.id}`} className="hover:text-[var(--accent)] transition-colors underline decoration-dashed">
                    {poet.name}
                  </Link>
                )}
                {spot && (
                  <span className="text-[var(--text-muted)]">
                    写于{' '}
                    <Link href={`/regions/${spot.region}`} className="hover:text-[var(--accent)] transition-colors underline decoration-dashed text-[var(--text-secondary)]">
                      {spot.name}
                    </Link>
                  </span>
                )}
              </div>
            </div>

            {/* Horizontal Flow Poem Content */}
            <div className="flex flex-col gap-4 text-center z-10 select-text">
              {poemLines.map((line, i) => (
                <p
                  key={i}
                  style={{ animationDelay: `${i * 0.08}s` }}
                  className="text-base md:text-lg font-black tracking-wider text-[var(--text-primary)] font-serif ink-bleed-effect"
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Annotation button */}
            {poem.annotation && (
              <button
                onClick={() => setShowAnnotation(!showAnnotation)}
                className="mt-8 flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)] text-[var(--accent-dark)] hover:text-white border border-[var(--accent)]/20 hover:border-transparent rounded-full text-xs font-black tracking-widest transition-all shadow-sm select-none cursor-pointer"
              >
                {showAnnotation ? '隐藏注解' : '显示注解'}
              </button>
            )}

            {/* Slide-out Annotations Panel */}
            {showAnnotation && poem.annotation && (
              <div className="w-full mt-6 p-5 rounded-xl bg-[var(--bg-secondary)]/30 border border-dashed border-[var(--accent)]/25 text-left animate-slide-up select-text">
                <h3 className="text-xs font-black text-[var(--accent)] tracking-widest border-b border-[var(--border-light)]/75 pb-1.5 mb-2 select-none font-serif">
                  注解
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-medium select-text">
                  {poem.annotation}
                </p>
              </div>
            )}
          </div>

          {/* Creation Background */}
          {poem.background && (
            <div className="w-full max-w-2xl flex flex-col gap-3 text-left mt-4 select-text">
              <h2 className="section-heading text-base font-black font-serif">创作背景</h2>
              <div className="p-5 rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] text-xs text-[var(--text-secondary)] leading-relaxed shadow-sm indent-8 select-text">
                {poem.background}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio / Video Players (Rendered uniformly at the bottom) */}
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 mt-4">
        {poem.videoUrl && (
          <div className="w-full flex flex-col gap-3 text-left">
            <h2 className="section-heading text-base font-black font-serif">诗词赏析视频</h2>
            <div className="w-full overflow-hidden rounded-xl border border-[var(--border-light)] bg-black shadow-sm">
              <video src={poem.videoUrl} controls className="w-full h-auto block" />
            </div>
          </div>
        )}

        {poem.audioUrl && (
          <div className="w-full flex flex-col gap-3 text-left">
            <h2 className="section-heading text-base font-black font-serif">诗词朗读</h2>
            <div className="w-full p-4 rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] shadow-sm flex items-center justify-center">
              <audio src={poem.audioUrl} controls className="w-full outline-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
