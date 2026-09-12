import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommunityMoon } from './features/moon/CommunityMoon';
import { CreativeEditor } from './features/editor/CreativeEditor';
import { SubmissionModal } from './features/contribution/SubmissionModal';
import { ContributionDetailModal } from './features/contribution/ContributionDetailModal';
import { GalleryPage } from './features/gallery/GalleryPage';
import { AdminPage } from './features/admin/AdminPage';
import { MoonData, MoonPiece, Contribution } from './types';
import { api } from './services/api';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';

export const App: React.FC = () => {
  // Check if current URL path or search query is /admin
  const isAdminPath =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') ||
      window.location.search.includes('view=admin') ||
      window.location.search.includes('page=admin'));

  const [currentTab, setCurrentTab] = useState<string>(isAdminPath ? 'admin' : 'moon');
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [pieces, setPieces] = useState<MoonPiece[]>([]);
  const [recentContributions, setRecentContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active creative flow (unified on Moon page)
  const [activePiece, setActivePiece] = useState<MoonPiece | null>(null);
  const [previewArtworkUrl, setPreviewArtworkUrl] = useState<string | null>(null);
  const [inspectingPiece, setInspectingPiece] = useState<MoonPiece | null>(null);

  // Status message
  const [notice, setNotice] = useState<string | null>(null);

  // Listen to browser URL changes (e.g. user navigates to /admin)
  useEffect(() => {
    const handlePopState = () => {
      const isNowAdmin =
        window.location.pathname.startsWith('/admin') ||
        window.location.search.includes('view=admin');
      if (isNowAdmin) {
        setCurrentTab('admin');
      } else if (window.location.pathname.startsWith('/gallery')) {
        setCurrentTab('gallery');
      } else {
        setCurrentTab('moon');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch moon overview and pieces
  const loadMoonState = useCallback(async () => {
    try {
      const [overview, pieceList, recents] = await Promise.all([
        api.getMoonOverview(),
        api.getMoonPieces(),
        api.getRecentContributions(),
      ]);
      setMoonData(overview);
      setPieces(pieceList);
      setRecentContributions(recents);
    } catch (error: any) {
      console.error('Lỗi nạp dữ liệu vầng trăng:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMoonState();

    // Auto refresh progress every 30 seconds
    const interval = setInterval(loadMoonState, 30000);
    return () => clearInterval(interval);
  }, [loadMoonState]);

  // Handle start contributing
  const handleStartContribute = async (preferredPieceId?: string) => {
    try {
      setNotice('🌕 Đang chuẩn bị mảnh trăng cho bạn...');
      const piece = await api.claimPiece(preferredPieceId);
      setActivePiece(piece);
      setNotice(null);
      // Scroll to editor smoothly
      setTimeout(() => {
        const editorEl = document.getElementById('creative-editor-anchor');
        if (editorEl) {
          editorEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      setNotice(err.message || 'Mảnh trăng vừa có bạn khác chọn rồi!');
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Select piece on Moon
  const handleSelectPieceOnMoon = (piece: MoonPiece) => {
    if (piece.status === 'AVAILABLE') {
      handleStartContribute(piece.id);
    } else if (piece.status === 'LOCKED') {
      setNotice('✨ Mảnh này đang có một bạn nhỏ đang sáng tạo.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Inspect completed piece
  const handleViewContribution = (piece: MoonPiece) => {
    setInspectingPiece(piece);
  };

  // Cancel creative flow
  const handleCancelEditor = async () => {
    if (activePiece) {
      try {
        await api.releasePiece(activePiece.id);
      } catch (e) {
        // ignore
      }
      setActivePiece(null);
    }
    setPreviewArtworkUrl(null);
  };

  // Auto release lock when user closes tab/browser or when 2 minutes pass
  useEffect(() => {
    if (!activePiece) return;

    const currentPieceId = activePiece.id;

    const handleUnload = () => {
      api.releasePieceBeacon(currentPieceId);
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // 2 minutes auto-release timer (120 seconds)
    const timer = setTimeout(async () => {
      await handleCancelEditor();
      setNotice('⏱️ Đã hết 2 phút giữ mảnh trăng. Mảnh trăng đã được tự động mở lại cho các bạn khác!');
      setTimeout(() => setNotice(null), 6000);
    }, 120 * 1000);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      clearTimeout(timer);
    };
  }, [activePiece]);

  // Submission success
  const handleSubmissionSuccess = () => {
    loadMoonState();
  };

  const handleNavigate = (tab: string) => {
    if (activePiece) {
      if (confirm('Bạn đang sáng tạo mảnh trăng. Bạn có muốn hủy bỏ để chuyển trang?')) {
        handleCancelEditor();
        setCurrentTab(tab);
        if (tab === 'moon') window.history.pushState({}, '', '/');
        if (tab === 'gallery') window.history.pushState({}, '', '/gallery');
      }
    } else {
      setCurrentTab(tab);
      if (tab === 'moon') window.history.pushState({}, '', '/');
      if (tab === 'gallery') window.history.pushState({}, '', '/gallery');
    }
  };

  // If on Admin page route
  if (currentTab === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-night-950 text-slate-100 selection:bg-yellow-400 selection:text-night-950 relative">
        <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:32px_32px] z-0" />
        <header className="glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌕</span>
            <span className="font-bold text-yellow-300 font-display">QUẢN TRỊ VẦNG TRĂNG</span>
          </div>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              setCurrentTab('moon');
            }}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-xs font-bold text-slate-300"
          >
            ← Về trang Vầng Trăng
          </button>
        </header>
        <main className="flex-grow z-10">
          <AdminPage />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-night-950 text-slate-100 selection:bg-yellow-400 selection:text-night-950 relative">
      {/* Background celestial stars */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:32px_32px] z-0" />

      {/* Floating Notice Toast */}
      {notice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card px-5 py-3 rounded-2xl border border-yellow-400/40 text-yellow-300 text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{notice}</span>
        </div>
      )}

      {/* Navigation (Only Vầng Trăng & Góp Mảnh + Phòng Tranh) */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} moonData={moonData} />

      {/* Main Content */}
      <main className="flex-grow z-10">
        {/* UNIFIED PAGE: VẦNG TRĂNG & GÓP MẢNH */}
        {currentTab === 'moon' && (
          <div className="space-y-12 py-8 sm:py-12">
            {/* Header Title & Concept */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs sm:text-sm font-bold shadow-sm leading-normal overflow-visible">
                <span>🏮</span>
                <span className="leading-normal">Tết Trung Thu 2026 • Bầy Tiên Sa</span>
                <span>🏮</span>
              </div>

              <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl text-yellow-300 max-w-4xl mx-auto leading-relaxed sm:leading-[1.35] tracking-normal py-2 drop-shadow-md overflow-visible">
                <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent inline-block py-2 px-1">
                  TRĂNG ƠI, ĐỦ CHƯA?
                </span>{' '}
                <span className="inline-block align-middle">🌕</span>
              </h1>

              {/* Progress Bar & Milestone Text */}
              {moonData && (
                <div className="max-w-md mx-auto glass-panel rounded-2xl p-4 sm:p-5 border border-yellow-400/30 space-y-3 shadow-lg">
                  <div className="flex items-center justify-center text-xs font-bold text-amber-200">
                    <span className="flex items-center gap-1.5 text-sm font-extrabold text-yellow-300">
                      <span className="text-base">🌕</span>
                      TRĂNG ĐÃ ĐỦ {moonData.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full h-3.5 rounded-full bg-night-950/80 border border-yellow-400/20 overflow-hidden p-[1px]">
                    <div
                      style={{ width: `${moonData.progressPercent}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-yellow-300 transition-all duration-700 shadow-sm shadow-yellow-400/60"
                    />
                  </div>

                  <p className="text-xs sm:text-sm text-yellow-200 font-semibold italic">{moonData.milestoneMessage}</p>
                </div>
              )}

              {/* CTA Button */}
              {!activePiece && (
                <div className="pt-2">
                  <button
                    onClick={() => handleStartContribute()}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-night-950 font-display font-bold text-base sm:text-lg hover:brightness-110 shadow-xl shadow-yellow-400/30 flex items-center justify-center gap-2.5 mx-auto transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="text-xl">🐺</span>
                    <span>GÓP MẢNH CỦA BẠN</span>
                  </button>
                </div>
              )}
            </section>

            {/* CREATIVE EDITOR (OPENS RIGHT ON THIS PAGE IF A PIECE IS ACTIVE) */}
            {activePiece && (
              <section id="creative-editor-anchor" className="animate-fadeIn py-4 relative z-20">
                <CreativeEditor
                  piece={activePiece}
                  onPreview={(artworkUrl) => setPreviewArtworkUrl(artworkUrl)}
                  onCancel={handleCancelEditor}
                />
              </section>
            )}

            {/* COMMUNITY MOON DISPLAY */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 my-4">
              <CommunityMoon
                pieces={pieces}
                moonData={moonData}
                onSelectPiece={handleSelectPieceOnMoon}
                onViewContribution={handleViewContribution}
                isLoading={isLoading}
              />
            </section>

            {/* RECENT PIECES SHOWCASE */}
            {recentContributions.length > 0 && (
              <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-base sm:text-lg text-yellow-300">
                    MẢNH GHÉP GẦN ĐÂY ✨
                  </h2>
                  <button
                    onClick={() => handleNavigate('gallery')}
                    className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                  >
                    <span>Xem tất cả</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {recentContributions.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        const targetPiece = pieces.find((p) => p.id === c.pieceId);
                        if (targetPiece) setInspectingPiece(targetPiece);
                      }}
                      className="glass-card rounded-2xl overflow-hidden border border-yellow-400/20 hover:border-yellow-400/60 cursor-pointer transition-all hover:scale-105 group shadow-md"
                    >
                      <div className="aspect-square relative overflow-hidden bg-night-900">
                        <img
                          src={c.thumbnailUrl}
                          alt={c.displayName}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-night-950/80 text-[10px] font-bold text-yellow-300">
                          #{c.piece?.pieceNumber || '?'}
                        </div>
                      </div>
                      <div className="p-2.5 text-left bg-night-950/60">
                        <p className="font-bold text-xs text-yellow-300 truncate">
                          {c.displayName}
                        </p>
                        <p className="text-[10px] text-slate-300 truncate italic">
                          {c.message || 'Gửi ánh sáng lên trăng!'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => handleNavigate('gallery')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel text-yellow-300 hover:bg-yellow-400/20 text-xs font-bold transition-all border border-yellow-400/30 shadow-sm"
                  >
                    <span>Xem toàn bộ các mảnh trăng tại trang Mảnh Trăng</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB 2: GALLERY */}
        {currentTab === 'gallery' && (
          <GalleryPage
            onGoToContribute={() => {
              setCurrentTab('moon');
              handleStartContribute();
            }}
          />
        )}
      </main>

      {/* Submission Modal & Card Generation */}
      {previewArtworkUrl && activePiece && (
        <SubmissionModal
          piece={activePiece}
          artworkDataUrl={previewArtworkUrl}
          onBackToEditor={() => setPreviewArtworkUrl(null)}
          onSuccess={() => {
            handleSubmissionSuccess();
            setActivePiece(null);
            setPreviewArtworkUrl(null);
          }}
        />
      )}

      {/* Contribution Detail / Lightbox Modal */}
      {inspectingPiece && (
        <ContributionDetailModal
          piece={inspectingPiece}
          onClose={() => setInspectingPiece(null)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
