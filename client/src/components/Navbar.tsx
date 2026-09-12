import React, { useState } from 'react';
import { Moon, Sparkles, Image, Menu, X } from 'lucide-react';
import { MoonData } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  moonData?: MoonData | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, moonData }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simplified navigation: Only Vầng Trăng & Mảnh Trăng
  const navItems = [
    { id: 'moon', label: 'Vầng Trăng & Góp Mảnh', icon: Moon, highlight: true },
    { id: 'gallery', label: 'Mảnh Trăng', icon: Image },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-yellow-500/20 bg-night-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Brand */}
          <button
            onClick={() => handleItemClick('moon')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
              🌕
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-yellow-300 block tracking-normal leading-normal py-0.5">
                TRĂNG ƠI, ĐỦ CHƯA? 🌕
              </span>
              <span className="text-xs text-amber-200/70 hidden sm:block leading-normal">
                Bầy Tiên Sa • Trung Thu 2026
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400 text-night-950 shadow-md shadow-amber-400/25 font-bold scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-night-950' : 'text-amber-300'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right side stats pill */}
          <div className="flex items-center gap-3">
            {moonData && (
              <div
                onClick={() => handleItemClick('moon')}
                className="cursor-pointer flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-bold hover:bg-yellow-400/20 transition-colors shadow-sm"
                title="Tiến độ vầng trăng"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                <span>TRĂNG ĐÃ ĐỦ {moonData.progressPercent}%</span>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-yellow-500/20 px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                  isActive
                    ? 'bg-amber-400 text-night-950 font-bold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 text-amber-300" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
