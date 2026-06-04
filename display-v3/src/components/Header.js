'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import ThemeSwitcher from './ThemeSwitcher';

const cities = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营'];

const getCityPinyin = (city) => {
  const mapping = {
    '菏泽': 'HEZE',
    '济宁': 'JINING',
    '泰安': 'TAIAN',
    '聊城': 'LIAOCHENG',
    '济南': 'JINAN',
    '德州': 'DEZHOU',
    '滨州': 'BINZHOU',
    '淄博': 'ZIBO',
    '东营': 'DONGYING'
  };
  return mapping[city] || '';
};

export default function Header() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExploreOpen(false);
  }, [pathname]);

  const isMapActive = pathname.startsWith('/map') || pathname.startsWith('/regions') || pathname.startsWith('/spots');
  const isPoetsActive = pathname.startsWith('/poets') || pathname.startsWith('/poems');
  const isTimelineActive = pathname === '/timeline';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[var(--nav-height)] flex items-center transition-all duration-500 border-b border-transparent
          ${scrolled ? 'bg-[var(--bg-primary)]/80 backdrop-blur-xl shadow-sm border-[var(--border-light)] h-[calc(var(--nav-height)-10px)]' : 'bg-transparent'}
          ${theme === 'inkwash' ? 'border-b border-[var(--border)]/30' : ''}`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Site Brand Logo */}
          <Link href="/map" className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded-md bg-[var(--accent)] text-white font-bold flex items-center justify-center text-lg shadow-sm border border-[var(--accent-dark)]">
              黄
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black tracking-wider leading-none text-[var(--text-primary)]">SHANDONG</span>
              <span className="text-[10px] font-bold tracking-widest leading-none text-[var(--text-muted)] mt-0.5">YELLOW RIVER</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/map"
              className={`flex items-center gap-2 py-2 px-1 text-sm font-semibold tracking-wider transition-colors duration-300 border-b-2 border-transparent hover:text-[var(--accent)] ${
                isMapActive ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
              </svg>
              山河图志
            </Link>

            <Link
              href="/poets"
              className={`flex items-center gap-2 py-2 px-1 text-sm font-semibold tracking-wider transition-colors duration-300 border-b-2 border-transparent hover:text-[var(--accent)] ${
                isPoetsActive ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              齐鲁名士
            </Link>

            <Link
              href="/timeline"
              className={`flex items-center gap-2 py-2 px-1 text-sm font-semibold tracking-wider transition-colors duration-300 border-b-2 border-transparent hover:text-[var(--accent)] ${
                isTimelineActive ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 2h14M5 22h14M19 2v4c0 3.3-2.7 6-6 6h-2c-3.3 0-6-2.7-6-6V2M5 22v-4c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6v4" />
              </svg>
              文脉长河
            </Link>
          </nav>

          {/* Desktop Right (Dropdown Explorer + Switcher) */}
          <div className="hidden md:flex items-center gap-5">
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className="px-4 py-2 text-sm font-semibold tracking-wider bg-[var(--bg-secondary)]/50 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border)]/40 transition-all select-none cursor-pointer flex items-center gap-1.5"
              >
                探索山东
                <span className={`text-[9px] transition-transform duration-300 ${exploreOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {exploreOpen && (
                <div className="absolute right-0 mt-3 w-80 p-5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-xl z-50 text-left animate-slide-up">
                  <h4 className="text-xs font-black tracking-widest text-[var(--accent)] border-b border-[var(--border-light)] pb-2 mb-3">
                    沿黄九市文学景观
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {cities.map((city) => (
                      <Link
                        key={city}
                        href={`/regions/${city}`}
                        className="flex flex-col p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border)]/50 group"
                      >
                        <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                          {city}
                        </span>
                        <span className="text-[8px] text-[var(--text-muted)] tracking-wider mt-0.5">
                          {getCityPinyin(city)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ThemeSwitcher />
          </div>

          {/* Mobile Menu Icon & Switcher */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 rounded-full hover:bg-[var(--bg-secondary)]/60 cursor-pointer relative z-50"
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            >
              <span className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-[var(--text-primary)] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[990] md:hidden transition-opacity duration-300"
        />
      )}

      {/* Mobile Drawer Navigation Panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-72 bg-[var(--bg-primary)] border-l border-[var(--border)]/65 z-[995] pt-24 px-6 pb-10 flex flex-col gap-8 shadow-2xl transition-transform duration-500 md:hidden
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="border-b border-[var(--border-light)] pb-4">
          <span className="text-xs font-black tracking-widest text-[var(--text-muted)]">文旅导航</span>
        </div>
        <nav className="flex flex-col gap-4">
          <Link
            href="/map"
            className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-semibold tracking-wider transition-colors hover:bg-[var(--bg-secondary)]/50 ${
              isMapActive ? 'text-[var(--accent)] bg-[var(--bg-secondary)]/80' : 'text-[var(--text-secondary)]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
            </svg>
            山河图志
          </Link>

          <Link
            href="/poets"
            className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-semibold tracking-wider transition-colors hover:bg-[var(--bg-secondary)]/50 ${
              isPoetsActive ? 'text-[var(--accent)] bg-[var(--bg-secondary)]/80' : 'text-[var(--text-secondary)]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            齐鲁名士
          </Link>

          <Link
            href="/timeline"
            className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-semibold tracking-wider transition-colors hover:bg-[var(--bg-secondary)]/50 ${
              isTimelineActive ? 'text-[var(--accent)] bg-[var(--bg-secondary)]/80' : 'text-[var(--text-secondary)]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 2h14M5 22h14M19 2v4c0 3.3-2.7 6-6 6h-2c-3.3 0-6-2.7-6-6V2M5 22v-4c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6v4" />
            </svg>
            文脉长河
          </Link>
        </nav>

        <div className="flex flex-col gap-3 mt-auto">
          <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase border-b border-[var(--border-light)] pb-2 mb-1">
            沿黄城市探索
          </span>
          <div className="grid grid-cols-2 gap-2 text-center">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/regions/${city}`}
                className="py-1.5 px-2 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[11px] font-bold border border-[var(--border)]/30 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors select-none"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
