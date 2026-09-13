import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Contribution } from '../../types';
import { api } from '../../services/api';

interface GalleryPageProps {
  onSelectContribution?: (contribution: Contribution) => void;
  onGoToContribute: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onGoToContribute }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  const fetchContributions = async (pageToFetch = 1, searchQuery = '') => {
    try {
      setIsLoading(true);
      const data = await api.getContributions(pageToFetch, 18, searchQuery);
      setContributions(data.items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalCount(data.pagination.total || 0);
      setPage(data.pagination.page);
    } catch (err) {
      console.error('Lỗi tải gallery:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContributions(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="text-center space-y-3.5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-bold">
          <span>🏮</span>
          <span>Tết Trung Thu 2026 • Bầy Tiên Sa</span>
          <span>🏮</span>
        </div>

        <h1 className="font-bold text-2xl sm:text-4xl text-yellow-300 bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent leading-relaxed py-1">
          Một mảnh từ bạn, một vầng trăng của Bầy.
        </h1>

        <p className="text-sm sm:text-base text-amber-100/90 font-medium max-w-2xl mx-auto">
          “Trăng không tự tròn. Trăng tròn vì có bạn.” 🌕
        </p>

        {/* Search Bar */}
        <div className="pt-2 relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc lời chúc..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel bg-night-900/90 border border-white/15 text-sm text-white focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-yellow-300">
          <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Đang tải những câu chuyện trăng rằm...</p>
        </div>
      ) : contributions.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl p-8 border border-white/10 max-w-md mx-auto space-y-4">
          <span className="text-4xl">🌕</span>
          <p className="text-sm text-slate-300 font-semibold">
            {search
              ? 'Không tìm thấy lời chúc nào khớp với tìm kiếm.'
              : 'Vầng trăng vẫn đang chờ những mảnh đầu tiên.'}
          </p>
          <button
            onClick={onGoToContribute}
            className="px-5 py-2.5 rounded-xl bg-yellow-400 text-night-950 font-bold text-xs hover:bg-yellow-300"
          >
            Góp mảnh đầu tiên ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {contributions.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedContribution(item)}
              className="glass-card rounded-2xl overflow-hidden border border-yellow-400/20 hover:border-yellow-400/60 transition-all hover:scale-[1.03] cursor-pointer group flex flex-col justify-between shadow-md"
            >
              {/* Artwork Box */}
              <div className="aspect-square relative overflow-hidden bg-night-900">
                <img
                  src={item.imageUrl || item.thumbnailUrl}
                  alt={item.displayName}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-night-950/80 backdrop-blur-sm text-[10px] font-bold text-yellow-300 border border-yellow-400/30">
                  #{item.piece?.pieceNumber || '?'}
                </div>
              </div>

              {/* Meta details */}
              <div className="p-3 text-left space-y-1 bg-night-950/50">
                <p className="font-bold text-xs text-yellow-300 truncate">
                  {item.displayName}
                </p>
                {item.message ? (
                  <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                    “{item.message}”
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Góp ánh sáng cho vầng trăng</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => fetchContributions(page - 1, search)}
            disabled={page <= 1}
            className="p-2 rounded-xl glass-panel text-slate-300 disabled:opacity-30 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-300 px-3">
            Trang {page} / {totalPages} ({totalCount} tác phẩm)
          </span>
          <button
            onClick={() => fetchContributions(page + 1, search)}
            disabled={page >= totalPages}
            className="p-2 rounded-xl glass-panel text-slate-300 disabled:opacity-30 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lightbox for Selected Contribution */}
      {selectedContribution && (
        <div className="fixed inset-0 z-50 bg-night-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-yellow-400/30 shadow-2xl space-y-5 animate-fadeIn relative text-center">
            <button
              onClick={() => setSelectedContribution(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <span className="inline-block px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 font-bold text-xs">
              Mảnh trăng #{selectedContribution.piece?.pieceNumber || '?'}
            </span>

            <h3 className="font-display font-bold text-lg text-white">
              {selectedContribution.displayName}
            </h3>

            <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-yellow-400/40 shadow-xl bg-night-900">
              <img
                src={selectedContribution.imageUrl || selectedContribution.thumbnailUrl}
                alt={selectedContribution.displayName}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedContribution.message && (
              <div className="glass-card rounded-2xl p-4 border border-yellow-500/20">
                <p className="text-sm italic text-amber-100 font-medium">
                  “{selectedContribution.message}”
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedContribution(null)}
              className="px-6 py-2 rounded-xl bg-yellow-400 text-night-950 font-bold text-xs hover:bg-yellow-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
