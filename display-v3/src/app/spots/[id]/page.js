'use client';

import React, { useState, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { getFallbackData, mockPoetsList } from '@/config/mockFallbackDb';
import { mockSpots } from '@/config/mockDetailData';

const getDynastyName = (dynastyId) => {
  const mapping = {
    1: '先秦', 2: '秦汉', 3: '魏晋南北朝', 4: '唐代', 5: '宋代', 6: '元代', 7: '明代', 8: '清代'
  };
  return mapping[dynastyId] || '古代';
};

const getChartData = (name) => {
  if (name === '泰山' || name === '泰山风景区') {
    return {
      eras: ['唐代', '宋代', '元代', '明代', '清代', '现代'],
      values: [85, 75, 60, 65, 70, 80],
      labels: ['盛唐气象 壮怀豪情', '宋代词风 沉稳大气', '元代诗意 朴质清朗', '明代登临 壮阔感伤', '帝王封禅 雄浑庄重', '现代礼赞 自然壮丽']
    };
  } else if (name === '趵突泉') {
    return {
      eras: ['唐代', '宋代', '元代', '明代', '清代', '现代'],
      values: [50, 70, 85, 55, 65, 75],
      labels: ['历下名泉 初见记述', '曾巩品茗 清洌涤尘', '白玉千壶 波澜声震', '明人题咏 泉水温润', '乾隆驻跸 圣水封赐', '天下第一 泉城地标']
    };
  } else if (name === '大明湖') {
    return {
      eras: ['唐代', '宋代', '元代', '明代', '清代', '现代'],
      values: [70, 55, 75, 60, 65, 70],
      labels: ['杜甫陪宴 历下名士', '常记溪亭 藕花争渡', '赵氏鹊华 秋色晕染', '明代重修 楼阁水榭', '清人避暑 词社聚会', '半城山色 旅游胜地']
    };
  } else {
    return {
      eras: ['唐代', '宋代', '元代', '明代', '清代', '现代'],
      values: [60, 65, 70, 55, 60, 65],
      labels: ['唐代歌咏', '宋代游记', '元人抒怀', '明代杂感', '清代逸事', '现代传承']
    };
  }
};

export default function SpotDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const spotId = parseInt(resolvedParams.id);
  const { isReal, isAnime } = useTheme();

  const data = getFallbackData(`/spots/${spotId}`);

  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex-grow flex flex-col justify-center">
        <h2 className="text-xl font-black text-[var(--text-primary)]">未找到该景点信息</h2>
        <button onClick={() => router.back()} className="text-[var(--accent)] hover:underline mt-4 font-bold cursor-pointer">
          ← 返回
        </button>
      </div>
    );
  }

  const { spot, poems } = data;
  const extra = mockSpots[spot.name] || {
    verticalText: '黄河九曲，齐鲁揽胜；文脉千载，源远流长。',
    tag: '经典景区',
    history: '',
    play: ''
  };

  // Join poets information
  const enrichedPoems = poems.map((p) => {
    const poetObj = mockPoetsList.find((pt) => pt.id === p.poetId);
    let excerpt = '';
    if (p.content) {
      const lines = p.content.split('\n').filter((l) => l.trim());
      excerpt = lines.slice(0, 2).join(' / ');
      if (lines.length > 2) excerpt += ' ...';
    }
    const tagsList = p.sentimentTags ? p.sentimentTags.split(',').map((t) => t.trim()) : [];
    return {
      ...p,
      poet: poetObj ? { ...poetObj, dynastyName: getDynastyName(poetObj.dynastyId) } : null,
      excerpt,
      tagsList
    };
  });

  const chart = getChartData(spot.name);

  // SVG Chart Layout Math
  const width = 600;
  const height = 220;
  const padding = 40;
  
  const chartPoints = chart.values.map((val, idx) => {
    const x = padding + (idx * (width - 2 * padding)) / (chart.values.length - 1);
    const y = height - padding - (val / 100) * (height - 2 * padding);
    return { x, y, val, era: chart.eras[idx], label: chart.labels[idx] };
  });

  const dPath = chartPoints.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    // Curve interpolation
    const prev = chartPoints[idx - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${dPath} L ${chartPoints[chartPoints.length - 1].x} ${height - padding} L ${chartPoints[0].x} ${height - padding} Z`;

  // Sentiment Rings Data
  const sentimentRings = (() => {
    const name = spot.name;
    if (name === '泰山' || name === '泰山风景区') {
      return [
        { name: '豪放', percent: 45, color: '#8e352e' },
        { name: '悠远', percent: 20, color: '#c27b38' },
        { name: '婉约', percent: 10, color: '#5b8c85' },
        { name: '幽思', percent: 15, color: '#7a5a8f' },
        { name: '淡泊', percent: 10, color: '#688c5b' }
      ];
    } else if (name === '趵突泉') {
      return [
        { name: '豪放', percent: 20, color: '#8e352e' },
        { name: '悠远', percent: 35, color: '#c27b38' },
        { name: '婉约', percent: 15, color: '#5b8c85' },
        { name: '幽思', percent: 10, color: '#7a5a8f' },
        { name: '淡泊', percent: 20, color: '#688c5b' }
      ];
    } else if (name === '大明湖') {
      return [
        { name: '豪放', percent: 15, color: '#8e352e' },
        { name: '悠远', percent: 25, color: '#c27b38' },
        { name: '婉约', percent: 30, color: '#5b8c85' },
        { name: '幽思', percent: 18, color: '#7a5a8f' },
        { name: '淡泊', percent: 12, color: '#688c5b' }
      ];
    } else {
      return [
        { name: '豪放', percent: 25, color: '#8e352e' },
        { name: '悠远', percent: 25, color: '#c27b38' },
        { name: '婉约', percent: 15, color: '#5b8c85' },
        { name: '幽思', percent: 20, color: '#7a5a8f' },
        { name: '淡泊', percent: 15, color: '#688c5b' }
      ];
    }
  })();

  const getPoetAvatar = (poetObj) => {
    if (!poetObj) return '';
    return isAnime ? poetObj.avatarAnimeUrl || poetObj.avatarUrl : poetObj.avatarUrl;
  };

  const getSentimentLabel = (val) => {
    if (val <= 20) return '淡泊';
    if (val <= 40) return '幽思';
    if (val <= 60) return '婉约';
    if (val <= 80) return '悠远';
    return '豪放';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex-grow w-full flex flex-col gap-6 text-left">
      <div className="pb-2">
        <Link
          href="/map"
          className="text-xs font-black tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors select-none"
        >
          ← 返回地图
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Image presentation & textual details */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-[var(--text-primary)] font-serif tracking-wider">
              {spot.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 select-none">
              {isAnime && extra.tag && (
                <div className="cinnabar-seal text-[10px] font-bold tracking-widest px-2.5 py-0.5 border-[1px] rotate-[-1deg]">
                  {extra.tag}
                </div>
              )}
              {isReal && spot.region && (
                <span className="text-[10px] font-black text-[var(--accent)] border border-[var(--accent)]/45 px-2 py-0.5 rounded tracking-wider">
                  {spot.region}市
                </span>
              )}
            </div>
          </div>

          {/* Portrait showcase image frame */}
          <div className="select-none">
            {isAnime ? (
              <div className="flex flex-col items-center">
                {/* Scroll rods representation */}
                <div className="w-full h-2.5 bg-gradient-to-r from-[#705e46] via-[#948166] to-[#594935] rounded-full shadow-sm" />
                <div className="w-[96%] bg-[#faf6ee] border-x border-[var(--border)] p-3 shadow-inner my-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={isAnime ? spot.imageAnimeUrl || spot.imageUrl : spot.imageUrl} alt={spot.name} className="w-full h-64 object-cover rounded-sm" />
                </div>
                <div className="w-full h-2.5 bg-gradient-to-r from-[#705e46] via-[#948166] to-[#594935] rounded-full shadow-sm" />
              </div>
            ) : (
              <div className="card p-3 border-[var(--border-light)] shadow-md">
                <div className="w-full h-64 overflow-hidden rounded relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border border-black/5 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Geographical coordinates metadata card */}
          <div className="card p-5 flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[var(--border-light)]/40">
              <span className="font-bold text-[var(--text-muted)] select-none">地理位置</span>
              <span className="font-black text-[var(--text-primary)]">{spot.address || `山东省${spot.region}市`}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[var(--text-muted)] select-none">所属区域</span>
              <span className="font-black text-[var(--text-primary)]">{spot.region}市</span>
            </div>
          </div>

          {/* Card intros (Card details, history, play method) */}
          <div className="card p-5 flex flex-col gap-3 text-left">
            <h3 className="text-xs font-black text-[var(--accent)] tracking-widest border-b border-[var(--border-light)] pb-2 mb-1 select-none font-serif">
              景点名片
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed indent-8">
              {spot.description}
            </p>
          </div>

          {extra.history && (
            <div className="card p-5 flex flex-col gap-3 text-left">
              <h3 className="text-xs font-black text-[var(--accent)] tracking-widest border-b border-[var(--border-light)] pb-2 mb-1 select-none font-serif">
                历史沿革
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed indent-8 font-serif">
                {extra.history}
              </p>
            </div>
          )}

          {extra.play && (
            <div className="card p-5 flex flex-col gap-3 text-left bg-[var(--accent)]/[0.01] border-dashed border-[var(--accent)]/15">
              <h3 className="text-xs font-black text-[var(--accent)] tracking-widest border-b border-[var(--border-light)] pb-2 mb-1 select-none font-serif">
                推荐玩法
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed indent-8">
                {extra.play}
              </p>
            </div>
          )}
        </aside>

        {/* RIGHT COLUMN: Interactive Charts, Poems lists & dimension breakdown rings */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Custom SVG Line Chart */}
          <div className="card p-6 flex flex-col gap-3 select-none">
            <div>
              <span className="text-[9px] font-black text-[var(--accent)] border border-[var(--accent)]/45 px-1.5 py-0.5 rounded tracking-widest">
                图谱
              </span>
              <h2 className="text-sm font-black text-[var(--text-primary)] font-serif tracking-wide mt-2">
                历代诗词情感波澜曲线
              </h2>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 tracking-wide font-medium">
                展现该景观在各个朝代吟咏作品中的情感基调与文人风骨演变
              </p>
            </div>

            <div className="w-full relative py-2">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                {/* Y grids */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-light)" strokeWidth={1} strokeDasharray="3, 3" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--border-light)" strokeWidth={1} strokeDasharray="3, 3" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth={1} />

                {/* Fill Gradient Area under curve */}
                <path
                  d={areaPath}
                  fill={isAnime ? 'url(#inkwashGrad)' : 'url(#realGrad)'}
                />
                
                <defs>
                  <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.00" />
                  </linearGradient>
                  <linearGradient id="inkwashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8e352e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#8e352e" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Curved Path */}
                <path
                  d={dPath}
                  fill="none"
                  stroke={isAnime ? '#8e352e' : 'var(--accent)'}
                  strokeWidth={2.5}
                />

                {/* Nodes markers */}
                {chartPoints.map((pt, idx) => (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={6}
                      fill={isAnime ? '#faf6ee' : '#ffffff'}
                      stroke={isAnime ? '#8e352e' : 'var(--accent)'}
                      strokeWidth={2}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={12}
                      fill="transparent"
                      className="hover:fill-black/[0.03]"
                    />
                    {/* X axis labels */}
                    <text
                      x={pt.x}
                      y={height - padding + 18}
                      textAnchor="middle"
                      fill="var(--text-secondary)"
                      fontSize="10px"
                      fontWeight="bold"
                    >
                      {pt.era}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  style={{
                    left: `${(hoveredPoint.x / width) * 100}%`,
                    top: `${(hoveredPoint.y / height) * 100 - 32}%`
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-full bg-white/95 border border-[var(--border)] p-2.5 rounded-lg shadow-lg pointer-events-none z-10 max-w-[180px] text-left animate-slide-up flex flex-col gap-0.5 select-none"
                >
                  <span className="text-[10px] font-black text-[var(--accent)] tracking-wider">
                    {hoveredPoint.era} 吟咏情感
                  </span>
                  <span className="text-xs font-black text-[var(--text-primary)] font-serif mt-0.5">
                    {getSentimentLabel(hoveredPoint.val)} ({hoveredPoint.val}%)
                  </span>
                  <p className="text-[9px] text-[var(--text-muted)] mt-1.5 leading-relaxed font-bold">
                    {hoveredPoint.label}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Classic Poems listing */}
          <div className="card p-6 flex flex-col gap-4">
            <div>
              <span className="text-[9px] font-black text-[var(--accent)] border border-[var(--accent)]/45 px-1.5 py-0.5 rounded tracking-widest select-none">
                诗
              </span>
              <h2 className="text-sm font-black text-[var(--text-primary)] font-serif tracking-wide mt-2 select-none">
                经典吟咏名篇
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {enrichedPoems.map((poem) => (
                <div
                  key={poem.id}
                  onClick={() => router.push(`/poems/${poem.id}`)}
                  className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)]/10 hover:border-[var(--accent)] cursor-pointer hover:shadow transition-all duration-300 flex flex-col gap-2.5 group hover:translate-y-[-1px] text-left"
                >
                  <div className="flex items-center gap-3">
                    {poem.poet && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)] shrink-0 select-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getPoetAvatar(poem.poet)} alt={poem.poet.name} className="w-full h-full object-cover object-top" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <h4 className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif">
                        {poem.title}
                      </h4>
                      {poem.poet && (
                        <span className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5 select-none">
                          [{poem.poet.dynastyName}] {poem.poet.name}
                        </span>
                      )}
                    </div>

                    {/* Sentiment tags seals */}
                    <div className="ml-auto flex gap-1 select-none">
                      {poem.tagsList.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="border border-[#c23a2b]/30 text-[#c23a2b] text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#FAF6EE] scale-90"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed font-serif truncate">
                    {poem.excerpt}
                  </p>

                  <div className="border-t border-[var(--border-light)]/40 pt-2 flex items-center justify-between text-[9px] font-black text-[var(--accent)] select-none">
                    <span>品读全文 & 聆听吟诵 →</span>
                  </div>
                </div>
              ))}
              
              {enrichedPoems.length === 0 && (
                <div className="text-xs text-[var(--text-muted)] text-center py-6 select-none font-bold">
                  暂无相关诗词记载，待学者考证录入。
                </div>
              )}
            </div>
          </div>

          {/* Sentiment Distribution overview rings */}
          <div className="card p-6 flex flex-col gap-4 text-left select-none">
            <div>
              <span className="text-[9px] font-black text-[var(--accent)] border border-[var(--accent)]/45 px-1.5 py-0.5 rounded tracking-widest">
                析
              </span>
              <h2 className="text-sm font-black text-[var(--text-primary)] font-serif tracking-wide mt-2">
                情感维度分布
              </h2>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 justify-items-center py-2 select-none">
              {sentimentRings.map((ring) => {
                const degrees = (ring.percent / 100) * 360;
                return (
                  <div key={ring.name} className="flex flex-col items-center gap-2">
                    {/* Ring Circle representation */}
                    <div
                      style={{
                        background: `conic-gradient(${ring.color} 0deg, ${ring.color} ${degrees}deg, var(--border-light) ${degrees}deg, var(--border-light) 360deg)`
                      }}
                      className="w-14 h-14 rounded-full flex items-center justify-center p-1.5"
                    >
                      <div className="w-full h-full rounded-full bg-[var(--card-bg)] flex items-center justify-center">
                        <span className="text-xs font-black text-[var(--text-primary)]">{ring.percent}%</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest">
                      {ring.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
