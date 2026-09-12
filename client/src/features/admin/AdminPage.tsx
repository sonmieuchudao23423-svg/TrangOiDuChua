import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  RefreshCw,
  Lock,
  Trash2,
  Key,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Download,
  Eye,
  Maximize2,
  Layers,
  MessageSquare,
  Sparkles,
  PlusCircle,
  X,
  Check,
  Ban,
  Calendar,
  User,
  Grid,
  Archive,
  ArrowRight,
} from 'lucide-react';
import JSZip from 'jszip';
import { api } from '../../services/api';

export const AdminPage: React.FC = () => {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Tab: 'contributions' (Tác phẩm & Lời nhắn), 'pieces' (Bản đồ mảnh), 'resize' (Mở rộng trăng)
  const [activeTab, setActiveTab] = useState<'contributions' | 'pieces' | 'resize'>('contributions');

  const [stats, setStats] = useState<any>(null);
  const [moonOverview, setMoonOverview] = useState<any>(null);
  const [pieces, setPieces] = useState<any[]>([]);
  const [allContributions, setAllContributions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // ZIP batch download progress
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<string>('');

  // Selected contribution modal for full inspection
  const [inspectItem, setInspectItem] = useState<any | null>(null);

  // Full Moon Preview Modal State
  const [showFullMoonModal, setShowFullMoonModal] = useState(false);
  const [fullMoonPreviewUrl, setFullMoonPreviewUrl] = useState<string | null>(null);
  const [isGeneratingFullMoon, setIsGeneratingFullMoon] = useState(false);

  // Resize Grid State
  const [selectedGridSize, setSelectedGridSize] = useState<number>(15);
  const [isResizing, setIsResizing] = useState(false);

  // Helper to calculate exact circle cells for any grid size
  const calculateCirclePiecesCount = (size: number): number => {
    const center = size / 2;
    const radius = size / 2;
    let count = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const d1 = Math.hypot(r - center, c - center);
        const d2 = Math.hypot(r - center, c + 1 - center);
        const d3 = Math.hypot(r + 1 - center, c - center);
        const d4 = Math.hypot(r + 1 - center, c + 1 - center);
        if (d1 <= radius && d2 <= radius && d3 <= radius && d4 <= radius) {
          count++;
        }
      }
    }
    return count;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === 'trungthu2026admin' || adminKey === 'trungthu2026') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Mật mã quản trị chưa đúng. Vui lòng thử lại!');
    }
  };

  const loadData = async (filter = statusFilter, pageNum = page) => {
    try {
      setIsLoading(true);
      const [statsData, overviewData, piecesData, contribsData] = await Promise.all([
        api.getAdminStats(),
        api.getMoonOverview(),
        api.getAdminPieces(pageNum, 60, filter),
        api.adminGetAllContributions(),
      ]);
      setStats(statsData);
      setMoonOverview(overviewData);
      setPieces(piecesData.items);
      setAllContributions(contribsData || []);
      setTotalPages(piecesData.pagination.totalPages || 1);
      setPage(piecesData.pagination.page);

      // Default next size if current grid is known
      const currSize = overviewData.totalRows || 13;
      if (currSize >= 13 && currSize < 15) setSelectedGridSize(15);
      else if (currSize >= 15 && currSize < 17) setSelectedGridSize(17);
      else if (currSize >= 17 && currSize < 19) setSelectedGridSize(19);
      else if (currSize >= 19 && currSize < 21) setSelectedGridSize(21);
      else if (currSize >= 21) setSelectedGridSize(25);
    } catch (err: any) {
      console.error('Lỗi tải trang quản trị:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData(statusFilter, 1);
    }
  }, [isAuthenticated, statusFilter]);

  // Download single individual image helper
  const handleDownloadPieceImage = async (imageUrl: string, pieceNum: number | string, authorName: string) => {
    try {
      const cleanName = (authorName || 'BanNho').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
      const filename = `Manh_${pieceNum}_${cleanName}_TrungThu2026.png`;

      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      setActionMsg(`📥 Đã tải ảnh mảnh #${pieceNum} của ${authorName}!`);
      setTimeout(() => setActionMsg(null), 3500);
    } catch (err: any) {
      // Fallback
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `Manh_${pieceNum}.png`;
      link.target = '_blank';
      link.click();
    }
  };

  // Batch Download ALL Contribution Images as a single ZIP file
  const handleDownloadAllZip = async () => {
    if (allContributions.length === 0) {
      alert('Hiện chưa có tác phẩm nào để tải về!');
      return;
    }

    try {
      setIsZipping(true);
      setZipProgress('Đang chuẩn bị tạo file nén ZIP...');

      const zip = new JSZip();
      const folder = zip.folder('Tranh_Trung_Thu_2026_Bay_Tien_Sa') || zip;

      let textSummary = `======================================================\n`;
      textSummary += `BỘ SƯU TẬP TÁC PHẨM & LỜI CHÚC TRUNG THU 2026 - BẦY TIÊN SA\n`;
      textSummary += `Thời gian xuất file: ${new Date().toLocaleString('vi-VN')}\n`;
      textSummary += `Tổng số tác phẩm: ${allContributions.length}\n`;
      textSummary += `======================================================\n\n`;

      let count = 0;
      for (const item of allContributions) {
        count++;
        setZipProgress(`Đang tải ảnh ${count}/${allContributions.length} (${item.displayName})...`);

        const cleanName = (item.displayName || 'BanNho').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
        const pieceNum = item.piece?.pieceNumber || count;
        const filename = `Manh_${pieceNum}_${cleanName}.png`;

        textSummary += `[${count}] MẢNH #${pieceNum}\n`;
        textSummary += `    Tác giả: ${item.displayName || 'Ẩn danh'}\n`;
        textSummary += `    Thời gian: ${item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '—'}\n`;
        textSummary += `    Lời chúc: "${item.message || 'Không có lời nhắn'}"\n`;
        textSummary += `    File ảnh: ${filename}\n\n`;

        if (item.imageUrl) {
          try {
            const imgRes = await fetch(item.imageUrl);
            const imgBlob = await imgRes.blob();
            folder.file(filename, imgBlob);
          } catch (fetchErr) {
            console.warn('Không thể tải ảnh cho item:', item.id, fetchErr);
          }
        }
      }

      // Add text log file
      folder.file('Danh_Sach_Loi_Chuc_Trung_Thu_2026.txt', textSummary);

      setZipProgress('Đang nén file ZIP hoàn chỉnh...');
      const zipContent = await zip.generateAsync({ type: 'blob' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipContent);
      link.download = `Bo_Suu_Tap_Tranh_Trung_Thu_2026_Bay_Tien_Sa.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setActionMsg(`📦 Đã nén và tải trọn bộ ${allContributions.length} tác phẩm thành công!`);
      setTimeout(() => setActionMsg(null), 4000);
    } catch (err: any) {
      console.error('Lỗi khi nén ZIP:', err);
      alert('Không thể tạo file ZIP: ' + err.message);
    } finally {
      setIsZipping(false);
      setZipProgress('');
    }
  };

  // Generate & Preview Full Moon Composite
  const handlePreviewFullMoon = async () => {
    try {
      setIsGeneratingFullMoon(true);
      setShowFullMoonModal(true);

      // Fetch all pieces & overview
      const allMoonPieces = await api.getMoonPieces();
      const overview = await api.getMoonOverview();

      const totalRows = overview.totalRows || 13;
      const totalCols = overview.totalCols || 13;

      const canvasSize = 2400;
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Không thể khởi tạo Canvas 2D');

      // 1. Deep night sky gradient
      const bgGrad = ctx.createRadialGradient(
        canvasSize / 2,
        canvasSize / 2,
        200,
        canvasSize / 2,
        canvasSize / 2,
        canvasSize / 2
      );
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.6, '#080c1d');
      bgGrad.addColorStop(1, '#030712');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // 2. Stars
      ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
      for (let i = 0; i < 160; i++) {
        const sx = (i * 137) % canvasSize;
        const sy = (i * 283) % canvasSize;
        const sr = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Glowing Moon Halo
      const moonCenter = canvasSize / 2;
      const moonRadius = canvasSize * 0.41;

      const haloGrad = ctx.createRadialGradient(
        moonCenter,
        moonCenter,
        moonRadius * 0.6,
        moonCenter,
        moonCenter,
        moonRadius * 1.3
      );
      haloGrad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
      haloGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)');
      haloGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(moonCenter, moonCenter, moonRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 4. Base Circular Moon Background
      ctx.save();
      ctx.beginPath();
      ctx.arc(moonCenter, moonCenter, moonRadius, 0, Math.PI * 2);
      ctx.clip();

      const moonGrad = ctx.createRadialGradient(
        moonCenter * 0.9,
        moonCenter * 0.9,
        100,
        moonCenter,
        moonCenter,
        moonRadius
      );
      moonGrad.addColorStop(0, '#fef9c3');
      moonGrad.addColorStop(0.4, '#fde047');
      moonGrad.addColorStop(0.8, '#f59e0b');
      moonGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = moonGrad;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // 5. Draw completed piece images
      const gridW = (moonRadius * 2) / totalCols;
      const gridH = (moonRadius * 2) / totalRows;
      const startX = moonCenter - moonRadius;
      const startY = moonCenter - moonRadius;

      // Load all completed images in parallel
      const completedPiecesWithImg = allMoonPieces.filter(
        (p) => p.isWithinMoon && p.contribution?.imageUrl
      );
      const loadedImages: { [key: string]: HTMLImageElement } = {};

      await Promise.all(
        completedPiecesWithImg.map((p) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              loadedImages[p.id] = img;
              resolve();
            };
            img.onerror = () => resolve();
            img.src = p.contribution!.imageUrl;
          });
        })
      );

      // Draw each piece on the grid
      for (const p of allMoonPieces) {
        if (!p.isWithinMoon) continue;
        const px = startX + p.col * gridW;
        const py = startY + p.row * gridH;

        if (loadedImages[p.id]) {
          ctx.drawImage(loadedImages[p.id], px, py, gridW, gridH);
        } else {
          // Empty piece tile
          ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
          ctx.fillRect(px, py, gridW, gridH);
        }

        // Cell border
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, gridW, gridH);
      }

      ctx.restore();

      // 6. Outer Golden Ring & Moon Border
      ctx.save();
      ctx.beginPath();
      ctx.arc(moonCenter, moonCenter, moonRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 14;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 28;
      ctx.stroke();
      ctx.restore();

      // 7. Decorative Text / Banner at bottom
      ctx.save();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 52px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.95)';
      ctx.shadowBlur = 14;
      ctx.fillText('TRĂNG ƠI, ĐỦ CHƯA? • BẦY TIÊN SA 2026', moonCenter, canvasSize - 75);

      ctx.fillStyle = '#fde68a';
      ctx.font = 'italic 32px Montserrat, sans-serif';
      ctx.fillText('“Trăng không tự tròn. Trăng tròn vì có bạn.”', moonCenter, canvasSize - 25);
      ctx.restore();

      const resultDataUrl = canvas.toDataURL('image/png');
      setFullMoonPreviewUrl(resultDataUrl);
    } catch (err: any) {
      console.error('Lỗi kết xuất vầng trăng:', err);
      alert('Không thể kết xuất vầng trăng: ' + err.message);
    } finally {
      setIsGeneratingFullMoon(false);
    }
  };

  // Download rendered full moon PNG
  const handleDownloadFullMoonPng = () => {
    if (!fullMoonPreviewUrl) return;
    const link = document.createElement('a');
    link.href = fullMoonPreviewUrl;
    link.download = `Vang_Trang_Tron_Trung_Thu_2026_Bay_Tien_Sa.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionMsg('🌕 Đã tải file ảnh toàn cảnh Vầng Trăng Tròn HD!');
    setTimeout(() => setActionMsg(null), 3500);
  };

  // Resize moon
  const handleResizeMoon = async () => {
    const currPieces = moonOverview?.activePieces || calculateCirclePiecesCount(moonOverview?.totalRows || 13);
    const targetPieces = calculateCirclePiecesCount(selectedGridSize);
    const addedDiff = targetPieces - currPieces;

    const confirmed = confirm(
      `🌕 XÁC NHẬN MỞ RỘNG VẦNG TRĂNG:\n\n• Quy mô hiện tại: ${moonOverview?.totalRows || 13}x${moonOverview?.totalCols || 13} (${currPieces} mảnh)\n• Quy mô mới: ${selectedGridSize}x${selectedGridSize} (${targetPieces} mảnh)\n• Số lượng mảnh mở rộng thêm: +${addedDiff > 0 ? addedDiff : 0} mảnh mới!\n• Dữ liệu bài nộp cũ: BẢO LƯU 100% (${allContributions.length} bài nộp)\n\nBạn có chắc chắn muốn áp dụng?`
    );
    if (!confirmed) return;

    try {
      setIsResizing(true);
      const res = await api.adminResizeMoon(selectedGridSize);
      alert(res.message);
      loadData();
    } catch (err: any) {
      alert('Lỗi mở rộng vầng trăng: ' + err.message);
    } finally {
      setIsResizing(false);
    }
  };

  const handleUnlock = async (pieceId: string) => {
    try {
      await api.adminUnlockPiece(pieceId);
      setActionMsg('Đã mở khóa mảnh thành công.');
      setTimeout(() => setActionMsg(null), 3000);
      loadData();
    } catch (err: any) {
      alert('Không thể mở khóa: ' + err.message);
    }
  };

  const handleModerate = async (
    contributionId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      await api.adminModerateContribution(contributionId, status);
      setActionMsg(`Đã cập nhật trạng thái kiểm duyệt sang ${status}`);
      setTimeout(() => setActionMsg(null), 3000);
      loadData();
      if (inspectItem && inspectItem.id === contributionId) {
        setInspectItem({ ...inspectItem, status });
      }
    } catch (err: any) {
      alert('Lỗi kiểm duyệt: ' + err.message);
    }
  };

  const handleDeleteContribution = async (contributionId: string, authorName: string) => {
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa bài nộp của "${authorName}"? Thao tác này sẽ giải phóng mảnh trăng về trạng thái trống.`);
    if (!confirmed) return;

    try {
      await api.adminDeleteContribution(contributionId);
      setActionMsg('Đã xóa bài nộp và giải phóng mảnh trăng thành công.');
      setTimeout(() => setActionMsg(null), 3000);
      if (inspectItem?.id === contributionId) {
        setInspectItem(null);
      }
      loadData();
    } catch (err: any) {
      alert('Lỗi xóa bài: ' + err.message);
    }
  };

  // Reset to empty live moon
  const handleResetToEmpty = async () => {
    const confirmed = confirm(
      '⚠️ CẢNH BÁO QUAN TRỌNG:\n\nThao tác này sẽ xóa toàn bộ tranh mẫu và đưa vầng trăng về 0% (các mảnh trống hoàn toàn) để bắt đầu sự kiện thật cho cộng đồng.\n\nBạn có chắc chắn muốn thực hiện?'
    );
    if (!confirmed) return;

    try {
      const res = await api.adminResetToEmpty(adminKey || 'trungthu2026admin');
      alert(res.message);
      loadData();
    } catch (err: any) {
      alert('Lỗi đặt lại vầng trăng: ' + err.message);
    }
  };

  // Current moon values for UI calculations
  const currentGridSize = moonOverview?.totalRows || 13;
  const currentActivePieces = moonOverview?.activePieces || calculateCirclePiecesCount(currentGridSize);
  const targetPiecesCount = calculateCirclePiecesCount(selectedGridSize);
  const addedCount = targetPiecesCount - currentActivePieces;

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8 border border-yellow-400/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 flex items-center justify-center text-3xl shadow-lg">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="font-display font-bold text-xl text-yellow-300">
              TRANG QUẢN TRỊ RIÊNG BIỆT
            </h2>
            <p className="text-xs text-slate-300">
              Dành riêng cho Ban tổ chức & Huynh trưởng Bầy Tiên Sa
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Nhập mã bí mật quản trị..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-night-950 border border-white/20 text-sm text-white focus:outline-none focus:border-yellow-400"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-semibold">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-night-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-yellow-400/30 transition-all"
            >
              Vào bảng điều hành
            </button>
          </form>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-yellow-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang chủ Vầng Trăng</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-yellow-400/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-night-950 flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-yellow-300">
              BẢNG ĐIỀU HÀNH & KIỂM DUYỆT
            </h1>
            <p className="text-xs text-slate-300">
              Đường dẫn bảo mật riêng: <code className="text-yellow-300">/admin</code>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Full Moon Preview & Download Button */}
          <button
            onClick={handlePreviewFullMoon}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-night-950 font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow-lg shadow-yellow-400/20 active:scale-98 transition-all"
            title="Xem vầng trăng ghép nối toàn bộ tác phẩm và tải ảnh chất lượng cao"
          >
            <Eye className="w-4 h-4" />
            <span>Xem & Tải Trăng Tròn</span>
          </button>

          {/* Batch Download ZIP Button */}
          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping || allContributions.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40"
            title="Tải toàn bộ ảnh tranh vẽ và lời nhắn của tất cả mọi người vào 1 file ZIP duy nhất"
          >
            <Archive className="w-4 h-4" />
            <span>{isZipping ? 'Đang nén ZIP...' : `Tải Trọn Bộ Ảnh (${allContributions.length} ZIP)`}</span>
          </button>

          <button
            onClick={handleResetToEmpty}
            className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Đưa vầng trăng về 0% để bắt đầu nhận tranh thật của các bạn nhỏ"
          >
            <Trash2 className="w-4 h-4" />
            <span>Khởi động sự kiện thật (0% Trắng)</span>
          </button>

          <button
            onClick={() => loadData()}
            className="px-3.5 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-yellow-300" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center animate-fadeIn shadow-lg">
          {actionMsg}
        </div>
      )}

      {isZipping && (
        <div className="p-3 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-semibold text-center animate-pulse shadow-lg flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>{zipProgress || 'Đang đóng gói file ZIP toàn bộ tác phẩm...'}</span>
        </div>
      )}

      {/* Stats Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-yellow-400/20">
            <span className="text-xs text-slate-400 font-semibold">Quy mô hiện tại</span>
            <p className="text-2xl font-bold text-white mt-1">
              {stats.totalPieces} <span className="text-xs text-slate-400">({moonOverview?.activePieces || '~101'} tròn)</span>
            </p>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-yellow-400/20">
            <span className="text-xs text-slate-400 font-semibold">Đã đóng góp</span>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {stats.completedPieces}{' '}
              <span className="text-xs font-normal text-yellow-300">
                ({stats.progress}%)
              </span>
            </p>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-yellow-400/20">
            <span className="text-xs text-slate-400 font-semibold">Đang giữ chỗ</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.lockedPieces}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-yellow-400/20">
            <span className="text-xs text-slate-400 font-semibold">Mảnh còn trống</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {stats.availablePieces}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-night-950/70 rounded-2xl border border-white/10 w-fit max-w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab('contributions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'contributions'
              ? 'bg-yellow-400 text-night-950 shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tác Phẩm & Lời Nhắn ({allContributions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pieces')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'pieces'
              ? 'bg-yellow-400 text-night-950 shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Quản Lý Mảnh Trăng</span>
        </button>

        <button
          onClick={() => setActiveTab('resize')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'resize'
              ? 'bg-yellow-400 text-night-950 shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Mở Rộng Thêm Mảnh</span>
        </button>
      </div>

      {/* TAB 1: CONTRIBUTIONS & MESSAGES */}
      {activeTab === 'contributions' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-bold text-base text-yellow-300 flex items-center gap-2">
                <span>Tất cả các bài nộp từ cộng đồng</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-semibold">
                  {allContributions.length} bài
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem hình ảnh, lời nhắn, tải ảnh riêng của từng người hoặc tải trọn bộ bằng file ZIP
              </p>
            </div>

            {/* Quick Batch Download Button */}
            {allContributions.length > 0 && (
              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="px-4 py-2 rounded-xl bg-yellow-400 text-night-950 font-bold text-xs hover:brightness-110 flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
              >
                <Archive className="w-4 h-4" />
                <span>{isZipping ? 'Đang nén...' : 'Tải Tất Cả Ảnh Về Máy (.ZIP)'}</span>
              </button>
            )}
          </div>

          {allContributions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 text-yellow-400/50 mx-auto animate-pulse" />
              <p className="text-sm font-semibold">Chưa có bài đóng góp nào được gửi.</p>
              <p className="text-xs text-slate-500">
                Các tác phẩm của các bạn nhỏ khi nộp sẽ hiển thị đầy đủ tại đây!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allContributions.map((c) => (
                <div
                  key={c.id}
                  className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail Image (Click to inspect) */}
                    <div
                      onClick={() => setInspectItem(c)}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-night-950/80 border border-white/10 cursor-pointer flex-shrink-0 relative group-hover:border-yellow-400 transition-colors"
                    >
                      <img
                        src={c.thumbnailUrl || c.imageUrl}
                        alt={c.displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Author & Piece Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-yellow-300">
                          Mảnh #{c.piece?.pieceNumber || '?'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            c.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {c.status === 'APPROVED' ? 'Đã duyệt' : 'Đang ẩn'}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-white truncate mt-0.5">
                        {c.displayName || 'Người bạn nhỏ'}
                      </p>

                      <p className="text-[11px] text-slate-300 italic line-clamp-2 mt-1 bg-night-950/40 p-1.5 rounded-lg border border-white/5">
                        "{c.message || 'Chúc Trung Thu vui vẻ!'}"
                      </p>
                    </div>
                  </div>

                  {/* Actions for this individual contribution */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                    {/* ONLY SHOW DOWNLOAD BUTTON IF PIECE HAS IMAGE */}
                    {c.imageUrl && (
                      <button
                        onClick={() =>
                          handleDownloadPieceImage(
                            c.imageUrl,
                            c.piece?.pieceNumber || 'X',
                            c.displayName
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-yellow-400/20 hover:bg-yellow-400 text-yellow-300 hover:text-night-950 font-bold text-[11px] flex items-center gap-1 transition-all"
                        title="Tải ảnh gốc của bài này về máy"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải ảnh</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          handleModerate(
                            c.id,
                            c.status === 'APPROVED' ? 'REJECTED' : 'APPROVED'
                          )
                        }
                        className={`p-1.5 rounded-lg text-xs font-semibold ${
                          c.status === 'APPROVED'
                            ? 'text-slate-300 hover:bg-rose-500/20 hover:text-rose-300'
                            : 'text-emerald-300 hover:bg-emerald-500/20'
                        }`}
                        title={c.status === 'APPROVED' ? 'Ẩn bài này' : 'Duyệt bài này'}
                      >
                        {c.status === 'APPROVED' ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeleteContribution(c.id, c.displayName)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Xóa bài nộp này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PIECES LIST & STATUS */}
      {activeTab === 'pieces' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-bold text-sm text-yellow-300">
              Danh sách chi tiết các mảnh trăng
            </h2>
            <div className="flex items-center gap-2">
              {[
                { id: '', label: 'Tất cả' },
                { id: 'COMPLETED', label: 'Đã hoàn thành' },
                { id: 'LOCKED', label: 'Đang khóa' },
                { id: 'AVAILABLE', label: 'Còn trống' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    statusFilter === f.id
                      ? 'bg-yellow-400 text-night-950 font-bold'
                      : 'glass-panel text-slate-300 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pieces Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-night-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3">Mảnh #</th>
                  <th className="p-3">Tọa độ (H, C)</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Người góp</th>
                  <th className="p-3">Lời nhắn</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pieces.map((p) => {
                  const hasContributionImage = !!p.contribution?.imageUrl;

                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-yellow-300">#{p.pieceNumber}</td>
                      <td className="p-3">
                        Hàng {p.row}, Cột {p.col}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'COMPLETED'
                              ? 'bg-yellow-400/20 text-yellow-300'
                              : p.status === 'LOCKED'
                              ? 'bg-amber-400/20 text-amber-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-white">
                        {p.contribution ? (
                          <div className="flex items-center gap-2">
                            {p.contribution.thumbnailUrl && (
                              <img
                                src={p.contribution.thumbnailUrl}
                                alt=""
                                className="w-7 h-7 rounded-md object-cover border border-white/10"
                              />
                            )}
                            <span>{p.contribution.displayName}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 max-w-[200px] truncate text-slate-300">
                        {p.contribution?.message || '—'}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {/* ONLY SHOW DOWNLOAD BUTTON IF PIECE HAS CONTRIBUTION WITH IMAGE */}
                        {hasContributionImage && (
                          <button
                            onClick={() =>
                              handleDownloadPieceImage(
                                p.contribution.imageUrl,
                                p.pieceNumber,
                                p.contribution.displayName
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400 hover:text-night-950 font-semibold inline-flex items-center gap-1 transition-colors"
                            title="Tải ảnh mảnh này"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải ảnh</span>
                          </button>
                        )}

                        {p.status === 'LOCKED' && (
                          <button
                            onClick={() => handleUnlock(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold"
                            title="Mở khóa mảnh"
                          >
                            Mở khóa
                          </button>
                        )}

                        {p.contribution && (
                          <button
                            onClick={() =>
                              handleModerate(
                                p.contribution.id,
                                p.contribution.status === 'APPROVED' ? 'REJECTED' : 'APPROVED'
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg font-semibold ${
                              p.contribution.status === 'APPROVED'
                                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            }`}
                          >
                            {p.contribution.status === 'APPROVED' ? 'Ẩn' : 'Duyệt'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESIZE & EXPAND MOON GRID (CLEAR STATS & VISUAL PREVIEW) */}
      {activeTab === 'resize' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
          {/* Header */}
          <div>
            <h2 className="font-bold text-base sm:text-lg text-yellow-300 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span>Mở Rộng Quy Mô Vầng Trăng (Khi Trăng Đầy)</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Xem rõ số lượng mảnh hiện tại, số mảnh sẽ được thêm vào và xem hình ảnh mô phỏng trực quan trước khi thực hiện mở rộng.
            </p>
          </div>

          {/* Current vs Target Comparison Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-r from-night-950/80 via-yellow-950/30 to-night-950/80 border border-yellow-400/30">
            {/* Current State */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">1. Quy mô hiện tại:</span>
              <p className="text-lg font-bold text-white">
                Lưới {currentGridSize}x{currentGridSize}{' '}
                <span className="text-yellow-300">({currentActivePieces} mảnh tròn)</span>
              </p>
              <p className="text-xs text-slate-400">
                Đã nộp: <strong className="text-yellow-400">{allContributions.length}</strong> | Còn trống:{' '}
                <strong className="text-emerald-400">{Math.max(0, currentActivePieces - allContributions.length)}</strong>
              </p>
            </div>

            {/* Target Selected State */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-300">2. Quy mô sau khi mở rộng:</span>
              <p className="text-lg font-bold text-yellow-300">
                Lưới {selectedGridSize}x{selectedGridSize}{' '}
                <span className="text-white">({targetPiecesCount} mảnh tròn)</span>
              </p>
              <p className="text-xs text-amber-200">
                Mở rộng thêm: <strong className="text-emerald-400">+{addedCount > 0 ? addedCount : 0} ô mới</strong>
              </p>
            </div>

            {/* Safety Guarantee */}
            <div className="space-y-1 flex flex-col justify-center">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bảo lưu 100% dữ liệu cũ:</span>
              </span>
              <p className="text-xs text-slate-300">
                Toàn bộ <strong className="text-yellow-300">{allContributions.length} bài nộp</strong> của các bạn nhỏ được giữ nguyên vẹn hoàn toàn!
              </p>
            </div>
          </div>

          {/* Grid Selection Cards */}
          <div>
            <span className="text-xs font-bold text-slate-200 block mb-2">
              Chọn mức quy mô bạn muốn nâng cấp:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { size: 13, name: 'Lưới 13x13', pieces: '~101 mảnh' },
                { size: 15, name: 'Lưới 15x15', pieces: '~137 mảnh' },
                { size: 17, name: 'Lưới 17x17', pieces: '~181 mảnh' },
                { size: 19, name: 'Lưới 19x19', pieces: '~233 mảnh' },
                { size: 21, name: 'Lưới 21x21', pieces: '~289 mảnh' },
                { size: 25, name: 'Lưới 25x25', pieces: '~400 mảnh' },
              ].map((g) => {
                const isSelected = selectedGridSize === g.size;
                const isCurrent = currentGridSize === g.size;
                const count = calculateCirclePiecesCount(g.size);
                const diff = count - currentActivePieces;

                return (
                  <button
                    key={g.size}
                    type="button"
                    onClick={() => setSelectedGridSize(g.size)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all relative ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/20 shadow-xl scale-[1.02] ring-2 ring-yellow-400/30'
                        : 'border-white/10 bg-white/5 hover:border-yellow-400/40 hover:bg-white/10'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-400 text-night-950 font-extrabold">
                        HIỆN TẠI
                      </span>
                    )}
                    <span className="font-bold text-xs text-white block">{g.name}</span>
                    <span className="text-xs text-yellow-300 font-extrabold block mt-0.5">
                      {count} mảnh
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {diff > 0 ? `+${diff} mảnh mới` : isCurrent ? 'Quy mô đang dùng' : `${diff} mảnh`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VISUAL PREVIEW: Simulated Moon Grid Map */}
          <div className="p-5 rounded-2xl bg-night-950/80 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>Hình ảnh mô phỏng vầng trăng sau khi mở rộng ({selectedGridSize}x{selectedGridSize}):</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Các ô màu xanh lá / viền sáng là những mảnh mới sẽ được mở thêm xung quanh vầng trăng.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] font-semibold flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-yellow-400 shadow-[0_0_6px_#facc15]" />
                  <span className="text-yellow-200">Đã nộp ({allContributions.length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-slate-700/80 border border-slate-600" />
                  <span className="text-slate-300">Đang có sẵn</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-300 shadow-[0_0_6px_#10b981]" />
                  <span className="text-emerald-300 font-bold">Mảnh mới (+{addedCount > 0 ? addedCount : 0})</span>
                </div>
              </div>
            </div>

            {/* Interactive Simulated Moon Grid */}
            <div className="flex items-center justify-center p-4 overflow-hidden">
              <div
                className="relative aspect-square max-w-[340px] w-full rounded-full p-2.5 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border-2 border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.25)] flex items-center justify-center"
              >
                <div
                  className="w-full h-full grid gap-[1.5px]"
                  style={{
                    gridTemplateColumns: `repeat(${selectedGridSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${selectedGridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: selectedGridSize * selectedGridSize }).map((_, idx) => {
                    const r = Math.floor(idx / selectedGridSize);
                    const c = idx % selectedGridSize;
                    const center = selectedGridSize / 2;
                    const radius = selectedGridSize / 2;

                    const d1 = Math.hypot(r - center, c - center);
                    const d2 = Math.hypot(r - center, c + 1 - center);
                    const d3 = Math.hypot(r + 1 - center, c - center);
                    const d4 = Math.hypot(r + 1 - center, c + 1 - center);
                    const isWithin = d1 <= radius && d2 <= radius && d3 <= radius && d4 <= radius;

                    if (!isWithin) {
                      return <div key={idx} className="w-full h-full opacity-0 pointer-events-none" />;
                    }

                    // Check if this piece belongs to existing moon or is a new expansion piece
                    const currCenter = currentGridSize / 2;
                    const currRadius = currentGridSize / 2;
                    // Approximate mapping to old grid
                    const isOldCell = selectedGridSize === currentGridSize || (
                      Math.abs(r - center) < currRadius - 0.5 &&
                      Math.abs(c - center) < currRadius - 0.5
                    );

                    return (
                      <div
                        key={idx}
                        className={`w-full h-full rounded-[2px] transition-all ${
                          !isOldCell
                            ? 'bg-emerald-500/80 border border-emerald-300 shadow-[0_0_4px_#10b981]'
                            : 'bg-slate-700/80 border border-slate-600 hover:border-yellow-400'
                        }`}
                        title={`Tọa độ: Hàng ${r}, Cột ${c}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Confirm Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleResizeMoon}
              disabled={isResizing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-night-950 font-bold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-yellow-400/30 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-98"
            >
              {isResizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang mở rộng vầng trăng...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    Xác Nhận Mở Rộng Lên {selectedGridSize}x{selectedGridSize} ({targetPiecesCount} mảnh)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* FULL MOON PREVIEW & DOWNLOAD MODAL */}
      {showFullMoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-950/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-4xl rounded-3xl p-6 border border-yellow-400/40 shadow-2xl flex flex-col max-h-[90vh] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌕</span>
                <h3 className="font-bold text-base sm:text-lg text-yellow-300">
                  Xem Toàn Cảnh Vầng Trăng Tròn
                </h3>
              </div>
              <button
                onClick={() => setShowFullMoonModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Image Box */}
            <div className="flex-1 overflow-auto flex items-center justify-center min-h-[350px] bg-night-950/60 rounded-2xl border border-white/10 p-4">
              {isGeneratingFullMoon ? (
                <div className="text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-yellow-300">
                    Đang ghép nối toàn bộ {allContributions.length} tác phẩm lên vầng trăng 4K...
                  </p>
                </div>
              ) : fullMoonPreviewUrl ? (
                <img
                  src={fullMoonPreviewUrl}
                  alt="Vầng Trăng Tròn Hoàn Tất"
                  className="max-h-[60vh] object-contain rounded-2xl shadow-2xl border border-yellow-400/30"
                />
              ) : (
                <p className="text-xs text-slate-400">Không thể tạo ảnh xem trước.</p>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-300">
                Đã ghép hoàn tất: <strong className="text-yellow-300">{allContributions.length}</strong> tác phẩm của các bạn nhỏ.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFullMoonModal(false)}
                  className="px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-bold"
                >
                  Đóng
                </button>
                <button
                  onClick={handleDownloadFullMoonPng}
                  disabled={!fullMoonPreviewUrl || isGeneratingFullMoon}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-night-950 font-bold text-xs hover:brightness-110 flex items-center gap-2 shadow-lg shadow-yellow-400/30 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Ảnh Vầng Trăng (HD PNG)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT INDIVIDUAL CONTRIBUTION MODAL */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-950/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-yellow-400/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm font-bold text-yellow-300">
                Tác phẩm Mảnh #{inspectItem.piece?.pieceNumber || '?'}
              </span>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Artwork Image */}
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-night-950 border border-white/10 flex items-center justify-center relative shadow-inner">
              <img
                src={inspectItem.imageUrl || inspectItem.thumbnailUrl}
                alt={inspectItem.displayName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Author info & message */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Người gửi: <strong className="text-white">{inspectItem.displayName}</strong></span>
                <span className="text-slate-400">
                  {inspectItem.createdAt ? new Date(inspectItem.createdAt).toLocaleDateString('vi-VN') : ''}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-night-950/60 border border-white/10 text-amber-200 italic">
                "{inspectItem.message || 'Không có lời nhắn'}"
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() =>
                  handleDownloadPieceImage(
                    inspectItem.imageUrl,
                    inspectItem.piece?.pieceNumber || 'X',
                    inspectItem.displayName
                  )
                }
                className="px-4 py-2 rounded-xl bg-yellow-400 text-night-950 font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh về máy</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleModerate(
                      inspectItem.id,
                      inspectItem.status === 'APPROVED' ? 'REJECTED' : 'APPROVED'
                    )
                  }
                  className={`px-3 py-2 rounded-xl font-bold text-xs ${
                    inspectItem.status === 'APPROVED'
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {inspectItem.status === 'APPROVED' ? 'Ẩn tác phẩm' : 'Duyệt tác phẩm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
