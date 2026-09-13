import React, { useState, useMemo } from 'react';
import { Sparkles, Info, Eye } from 'lucide-react';
import { MoonPiece, MoonData } from '../../types';

interface CommunityMoonProps {
  pieces: MoonPiece[];
  moonData?: MoonData | null;
  onSelectPiece: (piece: MoonPiece) => void;
  onViewContribution?: (piece: MoonPiece) => void;
  isLoading?: boolean;
}

export const CommunityMoon: React.FC<CommunityMoonProps> = ({
  pieces,
  moonData,
  onSelectPiece,
  onViewContribution,
  isLoading = false,
}) => {
  const [hoveredPiece, setHoveredPiece] = useState<MoonPiece | null>(null);

  // Group pieces by row dynamically based on moonData
  const gridRows = useMemo(() => {
    const numRows = moonData?.totalRows || 13;
    const rows: MoonPiece[][] = [];
    for (let r = 0; r < numRows; r++) {
      rows.push(pieces.filter((p) => p.row === r).sort((a, b) => a.col - b.col));
    }
    return rows;
  }, [pieces, moonData?.totalRows]);

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Legend / Status Hint - Percentage based without raw numbers */}
      <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-bold text-slate-300 mb-6 px-4">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-yellow-400 border border-yellow-300 shadow-sm shadow-yellow-400/50"></span>
          <span>Đã góp</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-amber-500/60 border border-amber-400 animate-pulse"></span>
          <span>Đang vẽ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-[#141e42] border border-yellow-500/40"></span>
          <span>Còn trống</span>
        </div>
      </div>

      {/* Frameless Floating Moon Container */}
      <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center p-2 sm:p-6 my-2">
        {/* Soft Circular Celestial Radial Halo */}
        <div
          className="absolute w-[560px] h-[560px] max-w-[95vw] max-h-[95vw] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(250, 204, 21, 0.22) 0%, rgba(234, 179, 8, 0.12) 45%, rgba(234, 179, 8, 0.03) 65%, transparent 75%)',
          }}
        />

        {/* Circular Moon Mask */}
        <div
          className="relative w-full h-full max-w-[520px] max-h-[520px] rounded-full overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.25)] border-4 border-yellow-300/40 bg-[#0d1430] flex-shrink-0"
        >
          {isLoading && (
            <div className="absolute inset-0 z-30 bg-night-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-yellow-300 gap-3">
              <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold">Đang nạp vầng trăng...</p>
            </div>
          )}

          {/* Grid of pieces with seamless unified background */}
          <div
            style={{
              gridTemplateRows: `repeat(${moonData?.totalRows || 13}, minmax(0, 1fr))`,
            }}
            className="w-full h-full grid gap-[1.5px] bg-[#0d1430] p-[1.5px]"
          >
            {gridRows.map((rowPieces, rIdx) => (
              <div
                key={`row-${rIdx}`}
                style={{
                  gridTemplateColumns: `repeat(${moonData?.totalCols || 13}, minmax(0, 1fr))`,
                }}
                className="grid gap-[1.5px]"
              >
                {rowPieces.map((piece) => {
                  if (!piece.isWithinMoon) {
                    return (
                      <div
                        key={piece.id}
                        className="aspect-square bg-[#0d1430] pointer-events-none select-none"
                        aria-hidden="true"
                      />
                    );
                  }

                  const isCompleted = piece.status === 'COMPLETED';
                  const isLocked = piece.status === 'LOCKED';
                  const isAvailable = piece.status === 'AVAILABLE';

                  return (
                    <button
                      key={piece.id}
                      onClick={() => {
                        if (isCompleted && onViewContribution) {
                          onViewContribution(piece);
                        } else {
                          onSelectPiece(piece);
                        }
                      }}
                      onMouseEnter={() => setHoveredPiece(piece)}
                      onMouseLeave={() => setHoveredPiece(null)}
                      className={`relative aspect-square transition-all duration-150 group overflow-hidden focus:outline-none ${
                        isCompleted
                          ? 'bg-amber-100 hover:z-20 hover:scale-125 hover:shadow-lg hover:shadow-yellow-400/50'
                          : isLocked
                          ? 'bg-amber-500/40 hover:bg-amber-500/60 animate-pulse border border-amber-400/30'
                          : 'bg-[#141e42] border border-yellow-400/15 hover:bg-yellow-400/40 hover:border-yellow-400/80 hover:z-20 hover:scale-125'
                      }`}
                      title={`Mảnh #${piece.pieceNumber}`}
                      aria-label={`Mảnh ${piece.pieceNumber}: ${piece.status}`}
                    >
                      {/* Completed Artwork Thumbnail */}
                      {isCompleted && (piece.contribution?.imageUrl || piece.contribution?.thumbnailUrl) && (
                        <img
                          src={piece.contribution.imageUrl || piece.contribution.thumbnailUrl}
                          alt={piece.contribution.displayName}
                          loading="lazy"
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      )}

                      {/* Locked indicator */}
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
                        </div>
                      )}

                      {/* Available Hover hint */}
                      {isAvailable && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-yellow-400/60 flex items-center justify-center text-[10px] text-night-950 font-bold">
                          +
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Golden Outer Ring Light */}
          <div className="absolute inset-0 rounded-full border border-yellow-200/30 pointer-events-none" />
        </div>
      </div>

      {/* Hovered Piece Detail Card / Tooltip */}
      <div className="mt-4 min-h-[72px] w-full max-w-md px-4">
        {hoveredPiece && hoveredPiece.isWithinMoon ? (
          <div className="glass-card rounded-2xl p-3 px-4 flex items-center justify-between gap-4 border border-yellow-400/30 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-night-900 flex-shrink-0 flex items-center justify-center border border-yellow-400/30">
                {hoveredPiece.status === 'COMPLETED' && (hoveredPiece.contribution?.imageUrl || hoveredPiece.contribution?.thumbnailUrl) ? (
                  <img
                    src={hoveredPiece.contribution.imageUrl || hoveredPiece.contribution.thumbnailUrl}
                    alt="thumb"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm">🌕</span>
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-yellow-300">
                    Mảnh #{hoveredPiece.pieceNumber}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      hoveredPiece.status === 'COMPLETED'
                        ? 'bg-yellow-400/20 text-yellow-300'
                        : hoveredPiece.status === 'LOCKED'
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-emerald-400/20 text-emerald-300'
                    }`}
                  >
                    {hoveredPiece.status === 'COMPLETED'
                      ? 'Đã góp'
                      : hoveredPiece.status === 'LOCKED'
                      ? 'Đang vẽ'
                      : 'Đang chờ bạn!'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate max-w-[200px] sm:max-w-[240px]">
                  {hoveredPiece.status === 'COMPLETED'
                    ? hoveredPiece.contribution?.displayName +
                      (hoveredPiece.contribution?.message ? `: "${hoveredPiece.contribution.message}"` : '')
                    : hoveredPiece.status === 'LOCKED'
                    ? 'Có bạn đang hoàn thiện mảnh này...'
                    : 'Nhấn để bắt đầu sáng tạo mảnh này!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (hoveredPiece.status === 'COMPLETED' && onViewContribution) {
                  onViewContribution(hoveredPiece);
                } else {
                  onSelectPiece(hoveredPiece);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-yellow-400 text-night-950 font-bold text-xs hover:bg-yellow-300 transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              {hoveredPiece.status === 'COMPLETED' ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  Xem
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Góp ngay
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2 py-3">
            <Info className="w-4 h-4 text-yellow-400/60" />
            <span>Di chuột hoặc chạm vào từng mảnh để xem chi tiết hoặc chọn góp mảnh của bạn.</span>
          </div>
        )}
      </div>
    </div>
  );
};
