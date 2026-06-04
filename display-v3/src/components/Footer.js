import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--bg-secondary)]/30 border-t border-[var(--border)]/40 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] tracking-wide leading-relaxed">
          数字人文视域下黄河流域（山东段）文学景观构建与教学应用研究
        </p>
        <div className="w-12 h-[1px] bg-[var(--border)] mx-auto my-3" />
        <p className="text-[10px] md:text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase">
          Digital Humanities · Literary Landscapes of the Yellow River Basin
        </p>
      </div>
    </footer>
  );
}
