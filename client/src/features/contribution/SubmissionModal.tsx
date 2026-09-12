import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Download,
  AlertCircle,
  Moon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MoonPiece } from '../../types';
import { api } from '../../services/api';
import { saveOrShareImage } from '../../utils/downloadHelper';

interface SubmissionModalProps {
  piece: MoonPiece;
  artworkDataUrl: string;
  onBackToEditor: () => void;
  onSuccess: (result: any) => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  piece,
  artworkDataUrl,
  onBackToEditor,
  onSuccess,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFlyingToMoon, setIsFlyingToMoon] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Submit piece handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // STRICT VALIDATION AS REQUESTED:
    if (!displayName.trim()) {
      setErrorMsg('Vui lòng nhập họ tên hoặc biệt danh của bạn!');
      return;
    }

    if (!message.trim()) {
      setErrorMsg('Vui lòng nhập một câu chúc hoặc điều ước gửi lên vầng trăng!');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const result = await api.submitPiece(piece.id, {
        artworkData: artworkDataUrl,
        displayName: displayName.trim(),
        message: message.trim(),
      });

      // Clear local draft
      localStorage.removeItem(`trung_thu_draft_${piece.id}`);

      // Start Flying to Moon animation
      setIsFlyingToMoon(true);

      setTimeout(() => {
        setIsFlyingToMoon(false);
        setSubmissionResult(result);
        onSuccess(result);

        // Fire celebratory confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#facc15', '#f59e0b', '#ec4899', '#38bdf8', '#ffffff'],
        });
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi mảnh trăng. Vui lòng thử lại!');
      setIsSubmitting(false);
    }
  };

  // Direct download raw artwork PNG
  const handleDownloadDirectArtwork = async () => {
    const cleanName = (displayName || 'BanNho').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
    await saveOrShareImage(
      artworkDataUrl,
      `Manh_${piece.pieceNumber}_${cleanName}_TrungThu2026.png`
    );
  };

  // Generate downloadable souvenir card
  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 1000);
    grad.addColorStop(0, '#060814');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1000);

    // Decorative golden frame
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 740, 940);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
    ctx.strokeRect(40, 40, 720, 920);

    // Header Title
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 36px "Quicksand", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRĂNG ƠI, ĐỦ CHƯA? 🌕', 400, 95);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Quicksand", sans-serif';
    ctx.fillText('“Trăng không tự tròn. Trăng tròn vì có bạn.”', 400, 135);

    // Artwork
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      ctx.drawImage(img, 150, 175, 500, 500);

      // Card Metadata
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 28px "Quicksand", sans-serif';
      ctx.fillText(`Mảnh trăng #${piece.pieceNumber}`, 400, 725);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Quicksand", sans-serif';
      ctx.fillText(
        `Người góp: ${submissionResult?.contribution.displayName || displayName}`,
        400,
        770
      );

      ctx.fillStyle = '#fef3c7';
      ctx.font = 'italic 18px "Quicksand", sans-serif';
      const wishText = `“${submissionResult?.contribution.message || message}”`;
      ctx.fillText(wishText, 400, 815);

      // Footer
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px "Quicksand", sans-serif';
      ctx.fillText('Một mảnh từ bạn, một vầng trăng của Bầy • Bầy Tiên Sa 2026', 400, 890);

      // Trigger download or native share sheet
      const cardDataUrl = canvas.toDataURL('image/png');
      await saveOrShareImage(
        cardDataUrl,
        `The_Ky_Niem_Trang_Oi_Du_Chua_Manh_${piece.pieceNumber}.png`
      );
    };
    img.src = artworkDataUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-950/85 backdrop-blur-md overflow-y-auto">
      {/* Flying Piece Animation Overlay */}
      {isFlyingToMoon && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="relative animate-bounce">
            <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(250,204,21,0.8)] border-4 border-yellow-300 transform scale-110 transition-all duration-1000 animate-pulse">
              <img src={artworkDataUrl} alt="Flying Piece" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-6 -right-6 text-3xl animate-spin">✨</div>
            <div className="absolute -bottom-6 -left-6 text-3xl animate-spin">🌕</div>
          </div>
          <p className="mt-6 text-yellow-300 font-display font-bold text-xl drop-shadow-lg animate-pulse">
            🌕 Đang đưa mảnh về Bầy...
          </p>
        </div>
      )}

      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-yellow-400/40 shadow-2xl relative my-auto">
        {!submissionResult ? (
          /* Step 1: Preview & Required Name + Wish Submission */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Modal Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-bold mb-1">
                <span>🌕 MẢNH #{piece.pieceNumber}</span>
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-yellow-300">
                GỬI MẢNH TRĂNG VỀ BẦY
              </h2>
              <p className="text-xs text-slate-300">
                “Trăng không tự tròn. Trăng tròn vì có bạn.”
              </p>
            </div>

            {/* Artwork Preview Card */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-yellow-400/50 shadow-xl group">
                <img
                  src={artworkDataUrl}
                  alt={`Mảnh ghép #${piece.pieceNumber}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-night-950/80 text-[11px] font-bold text-yellow-300">
                  #{piece.pieceNumber}
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadDirectArtwork}
                className="text-[11px] font-semibold text-yellow-300 hover:text-yellow-200 flex items-center gap-1 transition-colors"
                title="Lưu ảnh mảnh trăng vừa làm về thiết bị"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh mảnh trăng về máy</span>
              </button>
            </div>

            {/* Required Input Form */}
            <div className="space-y-3.5 text-left">
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                  <span>Tên / Biệt danh của bạn:</span>
                  <span className="text-rose-400 font-semibold text-[11px]">* Bắt buộc</span>
                </label>
                <input
                  type="text"
                  maxLength={40}
                  required
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="VD: Bé Minh Anh, Sói con Bầy Tiên Sa,..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-night-950 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                  <span>Câu chúc / điều ước gửi lên vầng trăng:</span>
                  <span className="text-rose-400 font-semibold text-[11px]">* Bắt buộc</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={140}
                  required
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="VD: Chúc Bầy Tiên Sa và mọi người một mùa Trung Thu ấm áp, tràn ngập tiếng cười!"
                  className="w-full px-3.5 py-2 rounded-xl bg-night-950 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400 resize-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-night-950 font-bold text-sm sm:text-base hover:brightness-110 shadow-lg shadow-yellow-400/40 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-98 order-1 sm:order-2 whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-night-950 border-t-transparent rounded-full animate-spin" />
                    <span>Đang gửi về Bầy...</span>
                  </>
                ) : (
                  <span>🌕 ĐƯA MẢNH VỀ BẦY</span>
                )}
              </button>
              <button
                type="button"
                onClick={onBackToEditor}
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-2.5 sm:py-3.5 px-4 rounded-xl glass-panel text-slate-300 hover:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại sửa</span>
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Delightful Celebration & Souvenir Card */
          <div ref={cardRef} className="text-center space-y-5 animate-scaleUp">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-2xl">
              🐺
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-yellow-300">
                Mảnh Trăng của bạn đã về Bầy 🐺✨
              </h2>
              <p className="text-sm text-amber-200 font-semibold italic">
                “Trăng không tự tròn. Trăng tròn vì có bạn.”
              </p>
            </div>

            {/* Souvenir Badge Box */}
            <div className="glass-card rounded-2xl p-4 border border-yellow-400/40 space-y-3 shadow-xl">
              <div className="w-36 h-36 mx-auto rounded-xl overflow-hidden border border-yellow-400/50 shadow-md">
                <img
                  src={artworkDataUrl}
                  alt="Artwork Souvenir"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="font-bold text-sm text-yellow-300">
                  Mảnh trăng #{piece.pieceNumber}
                </p>
                <p className="text-xs text-white font-semibold">
                  {submissionResult.contribution.displayName}
                </p>
                {submissionResult.contribution.message && (
                  <p className="text-xs italic text-slate-300 mt-1 max-w-xs mx-auto">
                    “{submissionResult.contribution.message}”
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-amber-300 flex items-center justify-center gap-1">
                <Moon className="w-3.5 h-3.5" />
                <span>Tiến độ vầng trăng hiện tại: </span>
                <span className="font-bold text-yellow-300">
                  {submissionResult.totalCompleted} mảnh ({submissionResult.moonProgress}%)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadDirectArtwork}
                  className="py-2.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/50 text-yellow-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  title="Tải file ảnh vuông tranh vẽ chất lượng cao"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh tranh vẽ (PNG)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCard}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-night-950 font-bold text-xs hover:brightness-110 flex items-center justify-center gap-1.5 shadow-md transition-all"
                  title="Tải thẻ kỷ niệm trang trọng có tên & lời chúc"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải thẻ kỷ niệm</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 rounded-xl glass-panel text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Moon className="w-4 h-4 text-yellow-400" />
                <span>Xem vầng trăng Bầy Tiên Sa</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
