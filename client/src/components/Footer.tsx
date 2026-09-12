import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-amber-500/30 bg-[#060919] text-slate-100 z-20">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src="/stickers/Footer.png"
          alt="Bầy Tiên Sa Trung Thu"
          className="w-full h-full object-cover object-center opacity-80"
        />
        {/* Soft dark gradient to keep text crisp without needing heavy boxes */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060919]/90 via-[#060919]/55 to-[#060919]/85 pointer-events-none" />
      </div>

      {/* Top golden accent line */}
      <div className="relative z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

      {/* Content - Compact & Clean without cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="flex flex-col items-center text-center space-y-3.5">
          {/* Main Title */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl animate-pulse">🏮</span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-normal text-yellow-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              TRĂNG ƠI, ĐỦ CHƯA?
            </h2>
            <span className="text-xl sm:text-2xl">🌕</span>
          </div>

          {/* Key Message */}
          <p className="text-amber-100 text-sm sm:text-base font-medium italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] max-w-xl mx-auto">
            “Trăng không tự tròn. Trăng tròn vì có bạn.”
          </p>

          {/* Scout Organization Hierarchy Text */}
          <div className="text-xs sm:text-sm font-bold text-yellow-300 tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] flex flex-wrap items-center justify-center gap-2 pt-0.5">
            <span className="text-amber-200">BẦY TIÊN SA</span>
            <span className="text-amber-400/70">•</span>
            <span className="text-slate-200">LIÊN ĐOÀN NGŨ HÀNH SƠN</span>
            <span className="text-amber-400/70">•</span>
            <span className="text-slate-200">ĐẠO ĐIỆN HẢI</span>
            <span className="text-amber-400/70">•</span>
            <span className="text-slate-200">CHÂU ĐÀ NẴNG</span>
          </div>

          {/* Bottom info */}
          <div className="pt-3 border-t border-white/20 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] gap-2">
            <p className="font-medium">
            </p>
            <p className="text-slate-400 text-xs">
              Tết Trung Thu 2026 • Hướng Đạo Việt Nam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
