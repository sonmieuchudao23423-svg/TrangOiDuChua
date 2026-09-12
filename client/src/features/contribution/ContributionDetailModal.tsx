import React from 'react';
import { X, Calendar, User, Heart, Sparkles, Download } from 'lucide-react';
import { MoonPiece } from '../../types';
import { saveOrShareImage } from '../../utils/downloadHelper';

interface ContributionDetailModalProps {
  piece: MoonPiece;
  onClose: () => void;
}

export const ContributionDetailModal: React.FC<ContributionDetailModalProps> = ({
  piece,
  onClose,
}) => {
  const contribution = piece.contribution;
  if (!contribution) return null;

  const handleDownload = async () => {
    const url = contribution.imageUrl || contribution.thumbnailUrl;
    if (!url) return;
    const cleanName = (contribution.displayName || 'BanNho').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
    await saveOrShareImage(url, `Manh_${piece.pieceNumber}_${cleanName}_TrungThu2026.png`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-night-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-yellow-400/30 shadow-2xl space-y-5 animate-fadeIn relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 font-bold text-xs border border-yellow-400/30">
            Mảnh trăng #{piece.pieceNumber}
          </span>
          <h3 className="font-display font-bold text-lg text-white">
            {contribution.displayName}
          </h3>
        </div>

        {/* Artwork Image */}
        <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-yellow-400/40 shadow-xl bg-night-900">
          <img
            src={contribution.imageUrl || contribution.thumbnailUrl}
            alt={contribution.displayName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Wish / Message */}
        {contribution.message && (
          <div className="glass-card rounded-2xl p-4 border border-yellow-500/20 text-center">
            <p className="text-sm italic text-amber-100 font-medium">
              “{contribution.message}”
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleDownload}
            className="px-5 py-2 rounded-xl bg-yellow-400/20 hover:bg-yellow-400 text-yellow-300 hover:text-night-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Tải ảnh tác phẩm này về máy"
          >
            <Download className="w-4 h-4" />
            <span>Tải ảnh về máy</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl glass-panel text-slate-300 hover:text-white font-bold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
