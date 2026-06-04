'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { mockPoetsList } from '@/config/mockFallbackDb';

const dynasties = [
  { id: null, name: '全部朝代' },
  { id: 4, name: '唐代文豪' },
  { id: 5, name: '宋代词家' },
  { id: 6, name: '元代书画' },
  { id: 8, name: '清代聊斋' }
];

const getDynastyName = (dynastyId) => {
  const mapping = {
    1: '先秦',
    2: '秦汉',
    3: '魏晋南北朝',
    4: '唐代',
    5: '宋代',
    6: '元代',
    7: '明代',
    8: '清代'
  };
  return mapping[dynastyId] || '古代';
};

// SVG Graph configuration
const graphData = {
  nodes: [
    { id: '1', label: '李白', x: 200, y: 150, type: 'poet', desc: '唐朝 · 诗仙' },
    { id: '2', label: '杜甫', x: 380, y: 120, type: 'poet', desc: '唐朝 · 诗圣' },
    { id: '3', label: '李清照', x: 180, y: 340, type: 'poet', desc: '宋朝 · 千古才女' },
    { id: '4', label: '辛弃疾', x: 380, y: 360, type: 'poet', desc: '宋朝 · 稼轩豪杰' },
    { id: '5', label: '赵孟頫', x: 620, y: 150, type: 'poet', desc: '元朝 · 松雪道人' },
    { id: '6', label: '蒲松龄', x: 620, y: 320, type: 'poet', desc: '清朝 · 聊斋先生' },
    { id: 'c1', label: '济南', x: 280, y: 240, type: 'city', desc: '济南名士多' },
    { id: 'c2', label: '泰安', x: 480, y: 220, type: 'city', desc: '会当凌绝顶' }
  ],
  edges: [
    { source: '1', target: '2', label: '李杜齐鲁相会' },
    { source: '2', target: 'c1', label: '历下亭同宴' },
    { source: '1', target: 'c2', label: '游历泰山' },
    { source: '2', target: 'c2', label: '写《望岳》' },
    { source: '3', target: 'c1', label: '生平与居所' },
    { source: '4', target: 'c1', label: '生平与归宋' },
    { source: '3', target: '4', label: '济南二安' },
    { source: '5', target: 'c1', label: '出任总管/描摹鹊华' }
  ]
};

export default function PoetsPage() {
  const router = useRouter();
  const { isAnime, isReal } = useTheme();
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'graph'
  const [selectedDynastyId, setSelectedDynastyId] = useState(null);

  const filteredPoets = useMemo(() => {
    if (!selectedDynastyId) return mockPoetsList;
    return mockPoetsList.filter((p) => p.dynastyId === selectedDynastyId);
  }, [selectedDynastyId]);

  const getPoetAvatar = (poet) => {
    if (!poet) return '';
    return isAnime ? poet.avatarAnimeUrl || poet.avatarUrl : poet.avatarUrl;
  };

  const handleNodeClick = (node) => {
    if (node.type === 'poet') {
      router.push(`/poets/${node.id}`);
    } else if (node.type === 'city') {
      router.push(`/regions/${node.label}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex-grow w-full flex flex-col gap-8 text-left animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--border-light)] pb-6">
        <div className="flex flex-col items-start">
          <div className="cinnabar-seal mb-2 scale-90 select-none">名士图卷</div>
          <h1 className="text-3xl font-black tracking-widest text-[var(--text-primary)] font-serif">
            齐鲁文人廊
          </h1>
          <p className="text-xs text-[var(--text-secondary)] tracking-wide mt-1">
            探寻黄河流域历代齐鲁大家之生平轨迹与文学连结
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[var(--bg-secondary)]/50 p-1.5 rounded-full border border-[var(--border)]/35 shrink-0 self-start select-none">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-2 text-xs font-black tracking-widest rounded-full cursor-pointer transition-all duration-300
              ${activeTab === 'gallery'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            书卷长廊
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-5 py-2 text-xs font-black tracking-widest rounded-full cursor-pointer transition-all duration-300
              ${activeTab === 'graph'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            关系图谱
          </button>
        </div>
      </div>

      {/* 1. GALLERY TAB VIEW */}
      {activeTab === 'gallery' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start animate-fade-in">
          
          {/* Bamboo Scrolls Filters (Left sidebar) */}
          <aside className="md:col-span-1 flex flex-col gap-4">
            <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase border-b border-[var(--border-light)] pb-2 select-none font-serif">
              历朝文脉
            </span>
            <div className="flex flex-row md:flex-col flex-wrap gap-2">
              {dynasties.map((dyn) => (
                <button
                  key={dyn.id}
                  onClick={() => setSelectedDynastyId(dyn.id)}
                  className={`w-full text-left px-4 py-3 rounded text-xs font-bold transition-all border cursor-pointer select-none relative
                    ${selectedDynastyId === dyn.id
                      ? 'bg-[var(--accent)] text-white border-transparent shadow-sm font-black'
                      : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--border)]/45 hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
                >
                  {selectedDynastyId === dyn.id && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-3 bg-white rounded-full" />
                  )}
                  <span className="pl-2">{dyn.name}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Poets Grid (Right panel) */}
          <section className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPoets.map((poet) => (
                <div
                  key={poet.id}
                  onClick={() => router.push(`/poets/${poet.id}`)}
                  className="card hover-lift cursor-pointer flex flex-col overflow-hidden border-[var(--border-light)] rounded-2xl shadow-[0_8px_24px_rgba(61,43,31,0.04)]"
                >
                  {/* Decorative corner brackets inside the card */}
                  <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[var(--accent)]/45 pointer-events-none z-10" />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[var(--accent)]/45 pointer-events-none z-10" />
                  <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[var(--accent)]/45 pointer-events-none z-10" />
                  <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[var(--accent)]/45 pointer-events-none z-10" />

                  {/* Portrait Box */}
                  <div className="w-full h-48 bg-[var(--bg-secondary)]/30 overflow-hidden border-b border-[var(--border-light)] relative select-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPoetAvatar(poet)}
                      alt={poet.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-[var(--accent)]/15 border border-[var(--accent)]/45 text-[var(--accent-dark)] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {getDynastyName(poet.dynastyId)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4.5 flex flex-col gap-2.5 select-text">
                    <div className="flex items-center gap-2 select-none">
                      <h3 className="text-sm font-black text-[var(--text-primary)] font-serif">
                        {poet.name}
                      </h3>
                      {poet.style && (
                        <div className="cinnabar-seal text-[8px] py-0.5 px-1.5 border-[1px] tracking-wider select-none shrink-0 scale-90">
                          {poet.style.split(' / ')[0]}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed h-12 overflow-hidden text-ellipsis font-serif">
                      {poet.biography}
                    </p>
                    {poet.style && (
                      <div className="text-[10px] text-[var(--text-muted)] border-t border-[var(--border-light)]/50 pt-2.5 flex items-center select-none">
                        <span className="font-bold">诗风：</span>
                        <span>{poet.style}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      ) : (
        /* 2. RELATIONSHIP GRAPH TAB VIEW (Interactive Vector SVG) */
        <div className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 shadow-md animate-fade-in flex flex-col gap-6">
          <div className="text-left bg-black/[0.01] border border-[var(--border-light)] p-4 rounded-md">
            <span className="text-[10px] font-black text-[var(--accent)] border border-[var(--accent)]/45 px-1.5 py-0.5 rounded">
              互动说明
            </span>
            <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
              图谱展示了山东黄河流域核心地标与文学大家的连结。<strong>点击诗人节点或城市节点</strong> 可直接进入对应的详情专栏。
            </p>
          </div>

          {/* SVG Vector Sandbox Canvas with Animated Connections */}
          <div className="w-full overflow-x-auto">
            <svg
              className="w-full min-w-[760px] h-[480px] bg-[var(--bg-secondary)]/15 rounded-2xl border border-[var(--border-light)] shadow-inner"
              viewBox="0 0 800 480"
            >
              {/* Draw Edges */}
              {graphData.edges.map((edge, idx) => {
                const sourceNode = graphData.nodes.find((n) => n.id === edge.source);
                const targetNode = graphData.nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isPoetRelation = sourceNode.type === 'poet' && targetNode.type === 'poet';

                return (
                  <g key={`edge-${idx}`} className="group/edge">
                    {/* Line path with animated flow dash effects */}
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isReal ? 'var(--accent)' : '#8e352e'}
                      strokeWidth={isPoetRelation ? 2 : 1.5}
                      className={`opacity-35 group-hover/edge:opacity-85 transition-opacity ${!isPoetRelation ? 'animate-flow-dash' : ''}`}
                    />
                    
                    {/* Label at midpoint */}
                    <foreignObject
                      x={(sourceNode.x + targetNode.x) / 2 - 60}
                      y={(sourceNode.y + targetNode.y) / 2 - 12}
                      width="120"
                      height="24"
                    >
                      <div className="flex justify-center items-center h-full">
                        <span className="text-[9px] font-black text-[var(--text-secondary)] bg-[var(--card-bg)] border border-[var(--border-light)] px-1.5 py-0.5 rounded shadow-sm scale-90 whitespace-nowrap select-none transition-transform group-hover/edge:scale-95 group-hover/edge:border-[var(--accent)]">
                          {edge.label}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {graphData.nodes.map((node) => {
                const isPoet = node.type === 'poet';
                const fillColor = isPoet
                  ? (isReal ? 'var(--accent)' : '#8e352e')
                  : (isReal ? '#ffffff' : '#faf6ee');
                const strokeColor = isPoet
                  ? (isReal ? 'var(--text-primary)' : '#c23a2b')
                  : (isReal ? 'var(--accent)' : '#1a1a1a');
                const textColor = isPoet ? '#ffffff' : 'var(--accent-dark)';

                return (
                  <g
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className="cursor-pointer select-none group/node"
                  >
                    {/* Glowing shadow circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isPoet ? 32 : 26}
                      fill="transparent"
                      className="stroke-[var(--accent)]/10 stroke-[0px] group-hover/node:stroke-[6px] transition-all duration-300"
                    />
                    {/* Main circle shape */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isPoet ? 26 : 22}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={2}
                      className="transition-all duration-300 group-hover/node:r-[28px] group-hover/node:stroke-width-3"
                    />
                    {/* Name inside node */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize={isPoet ? '12px' : '11px'}
                      fontWeight="black"
                      className="font-serif tracking-wider"
                    >
                      {node.label}
                    </text>
                    {/* Secondary Description placard under node */}
                    <text
                      x={node.x}
                      y={node.y + (isPoet ? 44 : 38)}
                      textAnchor="middle"
                      fill="var(--text-primary)"
                      fontSize="9px"
                      fontWeight="black"
                      className="font-serif opacity-80 group-hover/node:opacity-100 transition-opacity"
                    >
                      {node.desc}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
