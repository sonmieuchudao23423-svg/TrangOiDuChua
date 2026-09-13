import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Smile,
  Type,
  Palette,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  Upload,
  Edit3,
  Download,
  ChevronDown,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Crop,
  Move,
} from 'lucide-react';
import { MoonPiece, StickerItem, BackgroundPreset, FrameItem } from '../../types';
import { STICKERS, BACKGROUND_PRESETS, COLOR_PALETTE, FRAMES } from '../../utils/stickers';
import { saveOrShareImage } from '../../utils/downloadHelper';
import { api } from '../../services/api';

interface CreativeEditorProps {
  piece: MoonPiece;
  onPreview: (artworkDataUrl: string) => void;
  onCancel: () => void;
}

type EditorTab = 'draw' | 'stickers' | 'text' | 'bg' | 'frames';

export const FONT_OPTIONS = [
  { id: 'quicksand', name: 'Tròn trịa (Quicksand)', family: '"Quicksand", sans-serif', sample: 'Trung Thu sum vầy' },
  { id: 'baloo2', name: 'Ngộ nghĩnh (Baloo 2)', family: '"Baloo 2", cursive', sample: 'Rước đèn ông sao' },
  { id: 'pacifico', name: 'Nghệ thuật (Pacifico)', family: '"Pacifico", cursive', sample: 'Ánh trăng rằm' },
  { id: 'dancing', name: 'Thư pháp (Dancing)', family: '"Dancing Script", cursive', sample: 'Bầy Tiên Sa 2026' },
  { id: 'vietnam', name: 'Hiện đại (Vietnam)', family: '"Be Vietnam Pro", sans-serif', sample: 'Góp trọn vầng trăng' },
  { id: 'comfortaa', name: 'Mềm mại (Comfortaa)', family: '"Comfortaa", cursive', sample: 'Đêm hội trăng rằm' },
];

export const PRESET_COLORS = [
  '#ffffff',
  '#fef08a',
  '#facc15',
  '#fb923c',
  '#ef4444',
  '#f43f5e',
  '#ec4899',
  '#c084fc',
  '#38bdf8',
  '#4ade80',
];

export interface DraggableText {
  id: string;
  text: string;
  x: number; // 0..600
  y: number; // 0..600
  color: string;
  fontSize: number;
  fontFamily?: string;
}

export interface CanvasStickerItem {
  id: string;
  stickerId: string;
  svgOrImgUrl: string;
  isCustomImage?: boolean;
  name: string;
  x: number; // 0..600
  y: number; // 0..600
  size: number; // in px
}

interface VisualFontSelectProps {
  value: string;
  onChange: (family: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  label?: string;
  previewText?: string;
}

const VisualFontSelect: React.FC<VisualFontSelectProps> = ({
  value,
  onChange,
  isOpen,
  setIsOpen,
  label = 'Kiểu chữ:',
  previewText,
}) => {
  const currentFont = FONT_OPTIONS.find((f) => f.family === value) || FONT_OPTIONS[0];

  return (
    <div className="space-y-1 relative">
      <div className="flex justify-between text-[11px] text-slate-300">
        <span>{label}</span>
        <span className="text-yellow-300 font-semibold text-[10px]">
          {currentFont.name}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl bg-night-950 border border-white/20 hover:border-yellow-400/50 text-left flex items-center justify-between transition-all group shadow-sm"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            style={{ fontFamily: currentFont.family }}
            className="text-yellow-300 text-sm font-bold truncate"
          >
            {currentFont.name}
          </span>
          <span
            style={{ fontFamily: currentFont.family }}
            className="text-slate-400 text-xs truncate hidden sm:inline"
          >
            — {previewText && previewText.trim() ? previewText : currentFont.sample}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-yellow-400 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Visual Font List with actual rendered shapes */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 z-40 p-2 rounded-2xl glass-panel bg-night-950/95 border border-yellow-400/40 shadow-2xl space-y-1 max-h-[240px] overflow-y-auto backdrop-blur-xl animate-fadeIn">
            {FONT_OPTIONS.map((f) => {
              const isSelected = value === f.family;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    onChange(f.family);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all border ${
                    isSelected
                      ? 'bg-yellow-400/20 border-yellow-400/60 text-yellow-300 shadow-md'
                      : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-200 hover:border-yellow-400/30'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-sans font-medium">
                      {f.name}
                    </p>
                    <p
                      style={{ fontFamily: f.family }}
                      className="text-sm font-bold text-yellow-200 truncate mt-0.5"
                    >
                      {previewText && previewText.trim() ? previewText : f.sample}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-yellow-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

interface ImageCropModalProps {
  imageSrc: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageSrc,
  onConfirm,
  onCancel,
}) => {
  const [uiZoom, setUiZoom] = useState(1);
  const [uiRotation, setUiRotation] = useState(0);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isImgLoadedRef = useRef(false);

  // Transform ref for ultra-smooth 60fps direct canvas rendering (zero React re-render lag)
  const transformRef = useRef({
    x: 0,
    y: 0,
    zoom: 1,
    rotation: 0,
  });

  const rafIdRef = useRef<number | null>(null);

  // Core render canvas function
  const renderCanvas = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !isImgLoadedRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width; // 320px
    ctx.clearRect(0, 0, size, size);

    // Background fill
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, size, size);

    const { x, y, zoom, rotation } = transformRef.current;

    ctx.save();
    ctx.translate(size / 2 + x, size / 2 + y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Base scale to cover 320x320
    const baseScale = Math.max(size / img.width, size / img.height);
    const drawW = img.width * baseScale;
    const drawH = img.height * baseScale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, []);

  const scheduleRender = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      renderCanvas();
    });
  }, [renderCanvas]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      isImgLoadedRef.current = true;
      transformRef.current = { x: 0, y: 0, zoom: 1, rotation: 0 };
      setUiZoom(1);
      setUiRotation(0);
      scheduleRender();
    };
    img.src = imageSrc;
  }, [imageSrc, scheduleRender]);

  // Gesture Tracking Ref for 1-finger pan and 2-finger pinch
  const gestureRef = useRef<{
    isDragging: boolean;
    isPinching: boolean;
    startTouches: { id: number; x: number; y: number }[];
    startOffset: { x: number; y: number };
    startDist: number;
    startZoom: number;
    lastCenter: { x: number; y: number };
  }>({
    isDragging: false,
    isPinching: false,
    startTouches: [],
    startOffset: { x: 0, y: 0 },
    startDist: 0,
    startZoom: 1,
    lastCenter: { x: 0, y: 0 },
  });

  // Native Touch Event listeners with { passive: false } to prevent browser pinch/scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getTouchPoint = (touch: Touch) => {
      const rect = container.getBoundingClientRect();
      return {
        id: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    };

    const getCenter = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touches = Array.from(e.touches).map(getTouchPoint);

      if (touches.length === 1) {
        // Single finger pan
        gestureRef.current = {
          isDragging: true,
          isPinching: false,
          startTouches: touches,
          startOffset: { x: transformRef.current.x, y: transformRef.current.y },
          startDist: 0,
          startZoom: transformRef.current.zoom,
          lastCenter: touches[0],
        };
      } else if (touches.length >= 2) {
        // Two finger pinch & pan
        const dist = getDistance(touches[0], touches[1]);
        const center = getCenter(touches[0], touches[1]);
        gestureRef.current = {
          isDragging: true,
          isPinching: true,
          startTouches: [touches[0], touches[1]],
          startOffset: { x: transformRef.current.x, y: transformRef.current.y },
          startDist: Math.max(dist, 10),
          startZoom: transformRef.current.zoom,
          lastCenter: center,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!gestureRef.current.isDragging) return;

      const touches = Array.from(e.touches).map(getTouchPoint);

      if (touches.length === 1 && !gestureRef.current.isPinching) {
        // Single finger dragging
        const dx = touches[0].x - gestureRef.current.startTouches[0].x;
        const dy = touches[0].y - gestureRef.current.startTouches[0].y;

        transformRef.current.x = gestureRef.current.startOffset.x + dx;
        transformRef.current.y = gestureRef.current.startOffset.y + dy;
        scheduleRender();
      } else if (touches.length >= 2) {
        // Two fingers: Pinch zoom + Pan
        const p1 = touches[0];
        const p2 = touches[1];
        const currentDist = getDistance(p1, p2);
        const currentCenter = getCenter(p1, p2);

        // 1. Calculate new zoom
        if (gestureRef.current.startDist > 0) {
          const scaleRatio = currentDist / gestureRef.current.startDist;
          const newZoom = Math.min(3.5, Math.max(0.5, gestureRef.current.startZoom * scaleRatio));
          transformRef.current.zoom = newZoom;
        }

        // 2. Calculate center pan delta
        const deltaCenterX = currentCenter.x - gestureRef.current.lastCenter.x;
        const deltaCenterY = currentCenter.y - gestureRef.current.lastCenter.y;
        transformRef.current.x += deltaCenterX;
        transformRef.current.y += deltaCenterY;
        gestureRef.current.lastCenter = currentCenter;

        scheduleRender();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 0) {
        gestureRef.current.isDragging = false;
        gestureRef.current.isPinching = false;
        setUiZoom(+transformRef.current.zoom.toFixed(2));
      } else if (e.touches.length === 1) {
        const touches = Array.from(e.touches).map(getTouchPoint);
        gestureRef.current = {
          isDragging: true,
          isPinching: false,
          startTouches: touches,
          startOffset: { x: transformRef.current.x, y: transformRef.current.y },
          startDist: 0,
          startZoom: transformRef.current.zoom,
          lastCenter: touches[0],
        };
        setUiZoom(+transformRef.current.zoom.toFixed(2));
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [scheduleRender]);

  // Desktop Mouse Handlers
  const mouseDragRef = useRef<{ isDown: boolean; startX: number; startY: number; startOffset: { x: number; y: number } }>({
    isDown: false,
    startX: 0,
    startY: 0,
    startOffset: { x: 0, y: 0 },
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDragRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffset: { x: transformRef.current.x, y: transformRef.current.y },
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseDragRef.current.isDown) return;
    const dx = e.clientX - mouseDragRef.current.startX;
    const dy = e.clientY - mouseDragRef.current.startY;
    transformRef.current.x = mouseDragRef.current.startOffset.x + dx;
    transformRef.current.y = mouseDragRef.current.startOffset.y + dy;
    scheduleRender();
  };

  const handleMouseUp = () => {
    mouseDragRef.current.isDown = false;
  };

  // Desktop Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(3.5, Math.max(0.5, +(transformRef.current.zoom + delta).toFixed(2)));
    transformRef.current.zoom = newZoom;
    setUiZoom(newZoom);
    scheduleRender();
  };

  // UI Zoom Slider change
  const handleSliderZoom = (val: number) => {
    transformRef.current.zoom = val;
    setUiZoom(val);
    scheduleRender();
  };

  const handleStepZoom = (delta: number) => {
    const newZoom = Math.min(3.5, Math.max(0.5, +(transformRef.current.zoom + delta).toFixed(2)));
    transformRef.current.zoom = newZoom;
    setUiZoom(newZoom);
    scheduleRender();
  };

  const handleRotate = () => {
    const nextRot = (transformRef.current.rotation + 90) % 360;
    transformRef.current.rotation = nextRot;
    setUiRotation(nextRot);
    scheduleRender();
  };

  const handleReset = () => {
    transformRef.current = { x: 0, y: 0, zoom: 1, rotation: 0 };
    setUiZoom(1);
    setUiRotation(0);
    scheduleRender();
  };

  // Confirm crop - render to high-res 600x600 canvas
  const handleConfirmCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 600;
    exportCanvas.height = 600;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, 600, 600);

    const { x, y, zoom, rotation } = transformRef.current;

    ctx.save();
    // Scale offset from 320px viewport to 600px export
    const scaleFactor = 600 / 320;
    ctx.translate(300 + x * scaleFactor, 300 + y * scaleFactor);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const baseScale = Math.max(600 / img.width, 600 / img.height);
    const drawW = img.width * baseScale;
    const drawH = img.height * baseScale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const croppedUrl = exportCanvas.toDataURL('image/png', 0.95);
    onConfirm(croppedUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-night-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl p-4 sm:p-6 border border-yellow-400/40 shadow-2xl space-y-3.5 sm:space-y-4 text-left max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display font-bold text-base sm:text-lg text-yellow-300">
              Cắt & Căn Chỉnh Ảnh
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropper Viewport with touch-none */}
        <div className="flex flex-col items-center gap-2">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ touchAction: 'none' }}
            className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-2xl overflow-hidden border-2 border-yellow-400/60 shadow-2xl bg-night-950 cursor-grab active:cursor-grabbing select-none touch-none group"
          >
            <canvas
              ref={previewCanvasRef}
              width={320}
              height={320}
              className="w-full h-full pointer-events-none"
            />

            {/* Grid Overlay (Rule of Thirds) */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-yellow-400/30">
              <div className="border-r border-b border-yellow-400/20" />
              <div className="border-r border-b border-yellow-400/20" />
              <div className="border-b border-yellow-400/20" />
              <div className="border-r border-b border-yellow-400/20" />
              <div className="border-r border-b border-yellow-400/20" />
              <div className="border-b border-yellow-400/20" />
              <div className="border-r border-yellow-400/20" />
              <div className="border-r border-yellow-400/20" />
              <div />
            </div>

            {/* Drag hint badge */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-night-950/85 backdrop-blur-sm text-[10px] text-yellow-200 font-semibold border border-yellow-400/30 flex items-center gap-1.5 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
              <Move className="w-3 h-3 text-yellow-400" />
              <span>1 ngón để dời • 2 ngón để phóng to</span>
            </div>
          </div>
        </div>

        {/* Zoom & Adjustment Controls */}
        <div className="space-y-3 pt-1">
          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-yellow-400" />
                <span>Phóng to / Thu nhỏ:</span>
              </span>
              <span className="text-yellow-300 font-bold">{Math.round(uiZoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepZoom(-0.2)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={uiZoom}
                onChange={(e) => handleSliderZoom(parseFloat(e.target.value))}
                className="flex-1 accent-yellow-400 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleStepZoom(0.2)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rotate & Reset Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
              >
                <RotateCw className="w-3.5 h-3.5 text-yellow-400" />
                <span>Xoay {uiRotation !== 0 ? `${uiRotation}°` : '90°'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 italic">Khung 1:1 chuẩn Trăng</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/3 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-bold transition-all text-center"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-night-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-yellow-400/30 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Áp dụng ảnh này</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreativeEditor: React.FC<CreativeEditorProps> = ({
  piece,
  onPreview,
  onCancel,
}) => {
  // Layer 1: Background Canvas (Photo or Preset Color)
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Layer 2: Drawing Canvas (Brush Strokes & Eraser)
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<EditorTab>('draw');

  // Drawing tools
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushColor, setBrushColor] = useState<string>('#facc15');
  const [brushSize, setBrushSize] = useState<number>(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Background state
  const [currentBg, setCurrentBg] = useState<BackgroundPreset>(BACKGROUND_PRESETS[0]);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Selected Photo Frame (Overlay on top of background & under stickers/text)
  const [selectedFrame, setSelectedFrame] = useState<FrameItem | null>(FRAMES[0] || null);
  const frameImageRef = useRef<HTMLImageElement | null>(null);

  const handleSelectFrame = (frame: FrameItem | null) => {
    setSelectedFrame(frame);
    if (!frame) {
      frameImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      frameImageRef.current = img;
    };
    img.src = frame.imageUrl;
  };

  const handleSelectBackground = (preset: BackgroundPreset) => {
    setCurrentBg(preset);
    if (preset.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        bgImageRef.current = img;
        renderBackgroundLayer();
      };
      img.src = preset.imageUrl;
    } else {
      bgImageRef.current = null;
      renderBackgroundLayer();
    }
  };

  // Draggable Stickers (Sticker objects on top of drawing)
  const [stickerItems, setStickerItems] = useState<CanvasStickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Draggable Text Items (NO border when unselected, NO move icon)
  const [textItems, setTextItems] = useState<DraggableText[]>([
    {
      id: 'default-wish',
      text: 'Chúc bạn Trung Thu vui vẻ! 🏮',
      x: 300,
      y: 520,
      color: '#fef08a',
      fontSize: 24,
      fontFamily: '"Quicksand", sans-serif',
    },
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // State for creating new text
  const [textInput, setTextInput] = useState('');
  const [newTextFont, setNewTextFont] = useState('"Quicksand", sans-serif');
  const [newTextColor, setNewTextColor] = useState('#fef08a');
  const [newTextSize, setNewTextSize] = useState(24);
  const [isNewFontDropdownOpen, setIsNewFontDropdownOpen] = useState(false);
  const [isEditFontDropdownOpen, setIsEditFontDropdownOpen] = useState(false);

  // Dragging state for both text and stickers
  const draggingItemRef = useRef<{
    type: 'text' | 'sticker';
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // History stack for Undo / Redo on drawing canvas
  const drawHistory = useRef<ImageData[]>([]);
  const drawHistoryIndex = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Canvas internal dimensions
  const CANVAS_SIZE = 600;

  // Selected active items
  const selectedSticker = stickerItems.find((s) => s.id === selectedStickerId);

  // Push drawing canvas state to history
  const pushDrawHistory = useCallback(() => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;
    const ctx = drawCanvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (drawHistoryIndex.current < drawHistory.current.length - 1) {
      drawHistory.current = drawHistory.current.slice(0, drawHistoryIndex.current + 1);
    }
    drawHistory.current.push(imgData);
    drawHistoryIndex.current = drawHistory.current.length - 1;
    setCanUndo(drawHistoryIndex.current > 0);
    setCanRedo(false);
  }, []);

  // Render Background Layer (Color, Gradient, or Image)
  const renderBackgroundLayer = useCallback(() => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (bgImageRef.current) {
      // Draw uploaded background photo or preset illustration
      const img = bgImageRef.current;
      const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (CANVAS_SIZE - w) / 2;
      const y = (CANVAS_SIZE - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    } else {
      // Draw background preset gradient / color
      ctx.save();
      if (currentBg.gradient) {
        const grad = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        if (currentBg.id === 'night-sky') {
          grad.addColorStop(0, '#0a0e27');
          grad.addColorStop(1, '#1e1b4b');
        } else if (currentBg.id === 'moonlight-gold') {
          grad.addColorStop(0, '#fef9c3');
          grad.addColorStop(1, '#fde047');
        } else if (currentBg.id === 'purple-dream') {
          grad.addColorStop(0, '#2e1065');
          grad.addColorStop(1, '#4c1d95');
        } else {
          grad.addColorStop(0, '#0a0e27');
          grad.addColorStop(1, '#1e1b4b');
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = currentBg.color || '#0a0e27';
      }
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Subtle star speckles on dark backgrounds
      if (currentBg.id === 'night-sky' || currentBg.id === 'purple-dream') {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        for (let i = 0; i < 25; i++) {
          const sx = (i * 97) % CANVAS_SIZE;
          const sy = (i * 131) % CANVAS_SIZE;
          const sr = (i % 3) + 1;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }, [currentBg]);

  // Initialize both canvases
  useEffect(() => {
    renderBackgroundLayer();

    const drawCanvas = drawCanvasRef.current;
    if (drawCanvas) {
      const ctx = drawCanvas.getContext('2d');
      if (ctx && drawHistory.current.length === 0) {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        pushDrawHistory();
      }
    }
  }, [renderBackgroundLayer, pushDrawHistory]);

  // Undo / Redo on drawing layer
  const handleUndo = () => {
    if (drawHistoryIndex.current <= 0 || !drawCanvasRef.current) return;
    const ctx = drawCanvasRef.current.getContext('2d');
    if (!ctx) return;

    drawHistoryIndex.current -= 1;
    ctx.putImageData(drawHistory.current[drawHistoryIndex.current], 0, 0);
    setCanUndo(drawHistoryIndex.current > 0);
    setCanRedo(true);
  };

  const handleRedo = () => {
    if (
      drawHistoryIndex.current >= drawHistory.current.length - 1 ||
      !drawCanvasRef.current
    )
      return;
    const ctx = drawCanvasRef.current.getContext('2d');
    if (!ctx) return;

    drawHistoryIndex.current += 1;
    ctx.putImageData(drawHistory.current[drawHistoryIndex.current], 0, 0);
    setCanUndo(true);
    setCanRedo(drawHistoryIndex.current < drawHistory.current.length - 1);
  };

  // Clear all
  const handleClear = () => {
    if (confirm('Bạn có muốn xóa vẽ lại từ đầu không?')) {
      bgImageRef.current = null;
      renderBackgroundLayer();

      const drawCanvas = drawCanvasRef.current;
      if (drawCanvas) {
        const ctx = drawCanvas.getContext('2d');
        ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        pushDrawHistory();
      }

      setStickerItems([]);
      setTextItems([]);
      setSelectedStickerId(null);
      setSelectedTextId(null);
    }
  };

  // Coordinates helper
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return { x: 0, y: 0 };
    const rect = drawCanvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Drawing Handlers
  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    // Only allow drawing when user is specifically on the 'draw' (Vẽ) tab!
    if (activeTab !== 'draw') return;

    setSelectedTextId(null);
    setSelectedStickerId(null);

    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    lastPoint.current = coords;

    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;
    const ctx = drawCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);

    if (tool === 'eraser') {
      // True transparency eraser: keeps background photo/color visible!
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = brushColor;
    }
    ctx.fill();
    ctx.restore();
  };

  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTab !== 'draw' || !isDrawing || !lastPoint.current) return;
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;
    const ctx = drawCanvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }
    ctx.stroke();
    ctx.restore();

    lastPoint.current = coords;
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPoint.current = null;
    pushDrawHistory();
  };

  // PHOTO UPLOAD HANDLER: Opens Crop, Zoom & Pan adjuster modal
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCropImageSrc(dataUrl); // Opens the Crop & Zoom modal!
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // When photo crop is confirmed
  const handleConfirmCroppedPhoto = (croppedDataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      bgImageRef.current = img;
      renderBackgroundLayer(); // Renders as background layer under drawing strokes!
    };
    img.src = croppedDataUrl;
    setCropImageSrc(null);
  };

  // Add Built-in or Asset Sticker
  const handleAddDraggableSticker = (sticker: StickerItem) => {
    const isImage = !!sticker.imageUrl || (!sticker.svg?.includes('<svg'));
    const source = sticker.imageUrl || sticker.svg || '';
    const newId = 'stk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newItem: CanvasStickerItem = {
      id: newId,
      stickerId: sticker.id,
      svgOrImgUrl: source,
      isCustomImage: isImage,
      name: sticker.name,
      x: 300 + (Math.random() * 60 - 30),
      y: 280 + (Math.random() * 60 - 30),
      size: 150,
    };
    setStickerItems((prev) => [...prev, newItem]);
    setSelectedStickerId(newId);
    setSelectedTextId(null);
    setActiveTab('stickers');
  };

  // Update selected sticker
  const handleUpdateSelectedSticker = (updates: Partial<CanvasStickerItem>) => {
    if (!selectedStickerId) return;
    setStickerItems((prev) =>
      prev.map((s) => (s.id === selectedStickerId ? { ...s, ...updates } : s))
    );
  };

  // Delete selected sticker
  const handleDeleteSelectedSticker = (id: string) => {
    setStickerItems((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  // Selected Text item helper
  const selectedText = textItems.find((t) => t.id === selectedTextId);

  // Update existing selected text item
  const handleUpdateSelectedText = (updates: Partial<DraggableText>) => {
    if (!selectedTextId) return;
    setTextItems((prev) =>
      prev.map((t) => (t.id === selectedTextId ? { ...t, ...updates } : t))
    );
  };

  // Remove selected text item
  const handleDeleteSelectedText = (id: string) => {
    setTextItems((prev) => prev.filter((t) => t.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  // Add New Draggable Text Item
  const handleAddDraggableText = () => {
    const content = textInput.trim() || 'Chúc bạn Trung Thu vui vẻ! 🏮';
    const newId = 'text_' + Date.now();
    const newItem: DraggableText = {
      id: newId,
      text: content,
      x: 300,
      y: 250 + (textItems.length * 40) % 200,
      color: newTextColor,
      fontSize: newTextSize,
      fontFamily: newTextFont,
    };
    setTextItems((prev) => [...prev, newItem]);
    setSelectedTextId(newId);
    setSelectedStickerId(null);
    setTextInput('');
  };

  // Generic Item Pointer Down Handler (for sticker or text)
  const handleItemPointerDown = (
    e: React.PointerEvent,
    type: 'text' | 'sticker',
    item: { id: string; x: number; y: number }
  ) => {
    e.stopPropagation();

    if (type === 'text') {
      setSelectedTextId(item.id);
      setSelectedStickerId(null);
      setActiveTab('text');
    } else {
      setSelectedStickerId(item.id);
      setSelectedTextId(null);
      setActiveTab('stickers');
    }

    draggingItemRef.current = {
      type,
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleItemPointerMove = (e: React.PointerEvent) => {
    if (!draggingItemRef.current || !containerRef.current) return;
    const { type, id, startX, startY, origX, origY } = draggingItemRef.current;

    const rect = containerRef.current.getBoundingClientRect();
    const scale = CANVAS_SIZE / rect.width;

    const deltaX = (e.clientX - startX) * scale;
    const deltaY = (e.clientY - startY) * scale;

    const newX = Math.max(30, Math.min(570, origX + deltaX));
    const newY = Math.max(30, Math.min(570, origY + deltaY));

    if (type === 'text') {
      setTextItems((prev) =>
        prev.map((t) => (t.id === id ? { ...t, x: newX, y: newY } : t))
      );
    } else {
      setStickerItems((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x: newX, y: newY } : s))
      );
    }
  };

  const handleItemPointerUp = (e: React.PointerEvent) => {
    if (draggingItemRef.current) {
      draggingItemRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  };

  // Trigger Preview with Flattened Composite:
  // Layer 1 (Bg) + Layer 2 (Strokes on top) + Layer 3 (Stickers on top) + Layer 4 (Text on top)
  const handleProceedToPreview = async () => {
    const bgCanvas = bgCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!bgCanvas || !drawCanvas) return;

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = CANVAS_SIZE;
    finalCanvas.height = CANVAS_SIZE;
    const fCtx = finalCanvas.getContext('2d');
    if (!fCtx) return;

    // 1. Draw Background (Photo or Color)
    fCtx.drawImage(bgCanvas, 0, 0);

    // 2. Draw Brush Strokes ON TOP of background photo
    fCtx.drawImage(drawCanvas, 0, 0);

    // 3. Draw Photo Frame Overlay if selected (frames background photo into center cutout)
    if (selectedFrame) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          fCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = selectedFrame.imageUrl;
      });
    }

    // 4. Draw Draggable Stickers ON TOP
    for (const stk of stickerItems) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        if (stk.isCustomImage) {
          img.onload = () => {
            fCtx.save();
            fCtx.drawImage(
              img,
              stk.x - stk.size / 2,
              stk.y - stk.size / 2,
              stk.size,
              stk.size
            );
            fCtx.restore();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = stk.svgOrImgUrl;
        } else {
          const blob = new Blob([stk.svgOrImgUrl], {
            type: 'image/svg+xml;charset=utf-8',
          });
          const url = URL.createObjectURL(blob);
          img.onload = () => {
            fCtx.save();
            fCtx.drawImage(
              img,
              stk.x - stk.size / 2,
              stk.y - stk.size / 2,
              stk.size,
              stk.size
            );
            fCtx.restore();
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url;
        }
      });
    }

    // 4. Draw Draggable Text ON TOP
    textItems.forEach((t) => {
      fCtx.save();
      const fontFam = t.fontFamily || '"Quicksand", sans-serif';
      fCtx.font = `bold ${t.fontSize}px ${fontFam}`;
      fCtx.fillStyle = t.color;
      fCtx.textAlign = 'center';
      fCtx.textBaseline = 'middle';
      fCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      fCtx.shadowBlur = 10;
      fCtx.shadowOffsetX = 2;
      fCtx.shadowOffsetY = 2;
      fCtx.fillText(t.text, t.x, t.y);
      fCtx.restore();
    });

    const finalDataUrl = finalCanvas.toDataURL('image/png');
    onPreview(finalDataUrl);
  };

  // Direct download current artwork to device
  const handleDownloadCurrentArtwork = async () => {
    const bgCanvas = bgCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!bgCanvas || !drawCanvas) return;

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = CANVAS_SIZE;
    finalCanvas.height = CANVAS_SIZE;
    const fCtx = finalCanvas.getContext('2d');
    if (!fCtx) return;

    // 1. Draw Background
    fCtx.drawImage(bgCanvas, 0, 0);

    // 2. Draw Brush Strokes
    fCtx.drawImage(drawCanvas, 0, 0);

    // 3. Draw Frame if selected
    if (selectedFrame) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          fCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = selectedFrame.imageUrl;
      });
    }

    // 4. Draw Stickers
    for (const stk of stickerItems) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        if (stk.isCustomImage) {
          img.onload = () => {
            fCtx.save();
            fCtx.drawImage(
              img,
              stk.x - stk.size / 2,
              stk.y - stk.size / 2,
              stk.size,
              stk.size
            );
            fCtx.restore();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = stk.svgOrImgUrl;
        } else {
          const blob = new Blob([stk.svgOrImgUrl], {
            type: 'image/svg+xml;charset=utf-8',
          });
          const url = URL.createObjectURL(blob);
          img.onload = () => {
            fCtx.save();
            fCtx.drawImage(
              img,
              stk.x - stk.size / 2,
              stk.y - stk.size / 2,
              stk.size,
              stk.size
            );
            fCtx.restore();
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url;
        }
      });
    }

    // 5. Draw Text
    textItems.forEach((t) => {
      fCtx.save();
      const fontFam = t.fontFamily || '"Quicksand", sans-serif';
      fCtx.font = `bold ${t.fontSize}px ${fontFam}`;
      fCtx.fillStyle = t.color;
      fCtx.textAlign = 'center';
      fCtx.textBaseline = 'middle';
      fCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      fCtx.shadowBlur = 10;
      fCtx.shadowOffsetX = 2;
      fCtx.shadowOffsetY = 2;
      fCtx.fillText(t.text, t.x, t.y);
      fCtx.restore();
    });

    const finalDataUrl = finalCanvas.toDataURL('image/png');
    await saveOrShareImage(
      finalDataUrl,
      `Manh_trang_${piece.pieceNumber}_Bay_Tien_Sa.png`
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Hidden File Input for Background Photo */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/png, image/jpeg, image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between glass-panel rounded-2xl p-2.5 sm:p-4 border border-yellow-400/30 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-yellow-400 text-night-950 font-bold flex items-center justify-center text-xs sm:text-base shadow-md flex-shrink-0">
            #{piece.pieceNumber}
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-xs sm:text-base text-yellow-300 truncate">
              MẢNH #{piece.pieceNumber}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-300 hidden md:block truncate">
              Vẽ, dán sticker, ảnh & kéo thả chữ!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleDownloadCurrentArtwork}
            className="p-2 sm:px-3 sm:py-2 rounded-xl glass-panel text-yellow-300 hover:bg-yellow-400/20 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Tải ảnh tác phẩm này về máy"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Lưu ảnh</span>
          </button>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1"
            title="Đóng editor"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Hủy</span>
          </button>
          <button
            onClick={handleProceedToPreview}
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-night-950 font-bold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-yellow-400/40 flex items-center gap-1.5 transform active:scale-95 transition-transform"
          >
            <span>🌕 GÓP MẢNH</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Canvas Center Area: Multi-layer Stack */}
        <div className="lg:col-span-8 flex flex-col items-center gap-3">
          <div
            ref={containerRef}
            className="relative w-full max-w-[460px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-400/40 glass-panel bg-night-900 select-none touch-none"
          >
            {/* Layer 1: Background Canvas (Photo or Preset Color) */}
            <canvas
              ref={bgCanvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            />

            {/* Layer 2: Drawing Canvas (Brush Strokes & Eraser on top of background) */}
            <canvas
              ref={drawCanvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDrawMove}
              onMouseUp={handleEndDraw}
              onMouseLeave={handleEndDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDrawMove}
              onTouchEnd={handleEndDraw}
              className={`absolute inset-0 w-full h-full select-none z-10 transition-opacity ${
                activeTab === 'draw'
                  ? 'cursor-crosshair pointer-events-auto'
                  : 'pointer-events-none'
              }`}
            />

            {/* Layer 3: Frame Overlay (Placed on top of background photo with transparent cutout) */}
            {selectedFrame && (
              <img
                src={selectedFrame.imageUrl}
                alt={selectedFrame.name}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-15 select-none drop-shadow-xl"
              />
            )}

            {/* Layer 4: Draggable Stickers Layer (Transparent cutouts) */}
            {stickerItems.map((stk) => {
              const isSelected = selectedStickerId === stk.id;
              const leftPercent = (stk.x / CANVAS_SIZE) * 100;
              const topPercent = (stk.y / CANVAS_SIZE) * 100;
              const renderSizePx = (stk.size / CANVAS_SIZE) * 460;

              return (
                <div
                  key={stk.id}
                  onPointerDown={(e) => handleItemPointerDown(e, 'sticker', stk)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${renderSizePx}px`,
                    height: `${renderSizePx}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-20 cursor-grab active:cursor-grabbing select-none flex items-center justify-center transition-transform ${isSelected
                    ? 'ring-2 ring-yellow-400 rounded-2xl bg-yellow-400/10 shadow-xl'
                    : 'hover:ring-1 hover:ring-yellow-400/40 rounded-xl'
                    }`}
                  title={`${stk.name} (Chạm và kéo thả)`}
                >
                  {stk.isCustomImage ? (
                    <img
                      src={stk.svgOrImgUrl}
                      alt={stk.name}
                      className="w-full h-full object-contain pointer-events-none drop-shadow-md"
                    />
                  ) : (
                    <div
                      className="w-full h-full pointer-events-none drop-shadow-md flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:overflow-visible"
                      dangerouslySetInnerHTML={{ __html: stk.svgOrImgUrl }}
                    />
                  )}
                </div>
              );
            })}

            {/* Layer 4: Draggable Text Layer (NO border when unselected, NO move icon) */}
            {textItems.map((item) => {
              const isSelected = selectedTextId === item.id;
              const leftPercent = (item.x / CANVAS_SIZE) * 100;
              const topPercent = (item.y / CANVAS_SIZE) * 100;

              return (
                <div
                  key={item.id}
                  onPointerDown={(e) => handleItemPointerDown(e, 'text', item)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    color: item.color,
                    fontSize: `${(item.fontSize / CANVAS_SIZE) * 460}px`,
                    fontFamily: item.fontFamily || '"Quicksand", sans-serif',
                  }}
                  className={`absolute z-30 cursor-grab active:cursor-grabbing px-2 py-0.5 whitespace-nowrap font-bold select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-all ${isSelected
                    ? 'ring-1.5 ring-yellow-400 rounded-lg bg-black/20'
                    : 'bg-transparent border-none'
                    }`}
                >
                  {/* PURE TEXT: NO move icon, clean aesthetic */}
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-2.5 rounded-xl glass-panel text-slate-300 disabled:opacity-30 hover:text-yellow-300 transition-colors"
              title="Hoàn tác nét vẽ"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-2.5 rounded-xl glass-panel text-slate-300 disabled:opacity-30 hover:text-yellow-300 transition-colors"
              title="Làm lại nét vẽ"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => photoInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl glass-panel text-yellow-300 hover:bg-yellow-400/20 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Tải ảnh kỷ niệm từ thiết bị của bạn"
            >
              <Upload className="w-4 h-4" />
              <span>Tải ảnh lên</span>
            </button>
            <button
              onClick={handleClear}
              className="p-2.5 rounded-xl glass-panel text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Xóa làm lại"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tools Panel */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-4 border border-yellow-500/20 space-y-4">
          {/* Tabs header */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-night-950/60 rounded-2xl border border-white/5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('draw')}
              className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'draw'
                ? 'bg-yellow-400 text-night-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Paintbrush className="w-4 h-4" />
              <span>Vẽ</span>
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'stickers'
                ? 'bg-yellow-400 text-night-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Smile className="w-4 h-4" />
              <span>Hình</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'text'
                ? 'bg-yellow-400 text-night-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Type className="w-4 h-4" />
              <span>Chữ</span>
            </button>
            <button
              onClick={() => setActiveTab('bg')}
              className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'bg'
                ? 'bg-yellow-400 text-night-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Palette className="w-4 h-4" />
              <span>Nền</span>
            </button>
            <button
              onClick={() => setActiveTab('frames')}
              className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'frames'
                ? 'bg-yellow-400 text-night-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Khung</span>
            </button>
          </div>

          {/* Tab 1: Draw */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTool('brush')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${tool === 'brush'
                    ? 'bg-amber-400 text-night-950'
                    : 'bg-white/5 text-slate-300'
                    }`}
                >
                  <Paintbrush className="w-4 h-4" />
                  Bút lông
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${tool === 'eraser'
                    ? 'bg-amber-400 text-night-950'
                    : 'bg-white/5 text-slate-300'
                    }`}
                >
                  <Eraser className="w-4 h-4" />
                  Cục tẩy
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>Cỡ nét:</span>
                  <span>{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="36"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-300 font-semibold block">
                  Bảng màu Trung Thu:
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setBrushColor(c);
                        setTool('brush');
                      }}
                      style={{ backgroundColor: c }}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform ${brushColor === c && tool === 'brush'
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-transparent hover:scale-105'
                        }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Stickers (Transparent Background Items) */}
          {activeTab === 'stickers' && (
            <div className="space-y-3">
              {/* Selected Sticker Controls */}
              {selectedSticker && (
                <div className="p-3 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-yellow-300">
                      Đang chọn: {selectedSticker.name}
                    </span>
                    <button
                      onClick={() => handleDeleteSelectedSticker(selectedSticker.id)}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 text-xs"
                      title="Xóa sticker này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Size slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Kích cỡ:</span>
                      <span>{selectedSticker.size}px</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="280"
                      value={selectedSticker.size}
                      onChange={(e) =>
                        handleUpdateSelectedSticker({ size: parseInt(e.target.value) })
                      }
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <span className="text-xs text-slate-300 font-semibold block">
                Bộ sưu tập sticker Trung Thu không nền (Chạm để thêm & kéo thả):
              </span>
              <div className="grid grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                {STICKERS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleAddDraggableSticker(st)}
                    className="p-2 rounded-2xl bg-white/5 hover:bg-yellow-400/20 hover:border-yellow-400/40 border border-white/5 flex flex-col items-center gap-1 group transition-all"
                  >
                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {st.imageUrl || (!st.svg?.includes('<svg')) ? (
                        <img
                          src={st.imageUrl || st.svg}
                          alt={st.name}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      ) : (
                        <div
                          className="w-full h-full pointer-events-none flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: st.svg || '' }}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-300 truncate w-full text-center">
                      {st.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Text */}
          {activeTab === 'text' && (
            <div className="space-y-4 animate-fadeIn text-left">
              {/* If a text item is selected on canvas, show Edit Card */}
              {selectedText ? (
                <div className="p-3 rounded-2xl bg-white/5 border border-yellow-400/40 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-300">
                        Chỉnh sửa chữ đang chọn
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedTextId(null)}
                        className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px]"
                        title="Bỏ chọn"
                      >
                        Bỏ chọn
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSelectedText(selectedText.id)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 text-xs font-semibold"
                        title="Xóa chữ này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Edit Content */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      maxLength={45}
                      value={selectedText.text}
                      onChange={(e) => handleUpdateSelectedText({ text: e.target.value })}
                      style={{
                        fontFamily: selectedText.fontFamily || '"Quicksand", sans-serif',
                        color: selectedText.color,
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-night-950 border border-white/20 text-xs font-bold focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  {/* Font dropdown for selected text */}
                  <VisualFontSelect
                    value={selectedText.fontFamily || '"Quicksand", sans-serif'}
                    onChange={(family) => handleUpdateSelectedText({ fontFamily: family })}
                    isOpen={isEditFontDropdownOpen}
                    setIsOpen={setIsEditFontDropdownOpen}
                    label="Kiểu chữ:"
                    previewText={selectedText.text}
                  />

                  {/* Size slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Cỡ chữ:</span>
                      <span className="text-yellow-300 font-bold">{selectedText.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="48"
                      value={selectedText.fontSize}
                      onChange={(e) =>
                        handleUpdateSelectedText({ fontSize: parseInt(e.target.value) })
                      }
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>

                  {/* Color selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>Màu sắc:</span>
                      <span className="font-mono text-[10px] text-slate-400 uppercase">
                        {selectedText.color}
                      </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleUpdateSelectedText({ color: c })}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            selectedText.color.toLowerCase() === c.toLowerCase()
                              ? 'border-white scale-125 shadow-md ring-2 ring-yellow-400/60 z-10'
                              : 'border-white/20 hover:scale-110'
                          }`}
                          title={c}
                        />
                      ))}
                      <label
                        className="relative w-6 h-6 rounded-full cursor-pointer flex items-center justify-center border-2 border-white/60 shadow-md hover:scale-125 transition-transform overflow-hidden flex-shrink-0"
                        style={{
                          background:
                            'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                        }}
                        title="Bấm để mở bảng màu tròn tùy chọn"
                      >
                        <input
                          type="color"
                          value={selectedText.color}
                          onChange={(e) => handleUpdateSelectedText({ color: e.target.value })}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-slate-400 italic">
                  Chạm vào chữ trên tranh để kéo thả di chuyển hoặc sửa nội dung.
                </div>
              )}

              {/* Add New Text Form */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <span className="text-xs text-slate-300 font-semibold block">
                  Thêm một dòng chữ mới:
                </span>

                <input
                  type="text"
                  maxLength={45}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="VD: Cầu chúc vạn sự an lành! 🏮"
                  style={{
                    fontFamily: newTextFont,
                    color: newTextColor,
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-night-950 border border-white/20 text-xs font-bold focus:outline-none focus:border-yellow-400 shadow-inner"
                />

                {/* Font Selector for new text with visual shapes preview */}
                <VisualFontSelect
                  value={newTextFont}
                  onChange={setNewTextFont}
                  isOpen={isNewFontDropdownOpen}
                  setIsOpen={setIsNewFontDropdownOpen}
                  label="Kiểu chữ:"
                  previewText={textInput}
                />

                {/* Size slider for new text */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Cỡ chữ:</span>
                    <span className="text-yellow-300 font-bold">{newTextSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="48"
                    value={newTextSize}
                    onChange={(e) => setNewTextSize(parseInt(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                {/* Color swatches + Rainbow Picker for new text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Màu sắc:</span>
                    <span className="font-mono text-[10px] text-slate-400 uppercase">
                      {newTextColor}
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewTextColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          newTextColor.toLowerCase() === c.toLowerCase()
                            ? 'border-white scale-125 shadow-md ring-2 ring-yellow-400/60 z-10'
                            : 'border-white/20 hover:scale-110'
                        }`}
                        title={c}
                      />
                    ))}
                    <label
                      className="relative w-6 h-6 rounded-full cursor-pointer flex items-center justify-center border-2 border-white/60 shadow-md hover:scale-125 transition-transform overflow-hidden flex-shrink-0"
                      style={{
                        background:
                          'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                      }}
                      title="Bấm để mở bảng màu tròn tùy chọn"
                    >
                      <input
                        type="color"
                        value={newTextColor}
                        onChange={(e) => setNewTextColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddDraggableText}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 text-night-950 font-bold text-xs hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm chữ có thể kéo thả</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Backgrounds */}
          {activeTab === 'bg' && (
            <div className="space-y-3 animate-fadeIn text-left">
              <span className="text-xs text-slate-300 font-semibold block">
                Chọn hình nền hoặc phông màu Trung Thu:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {BACKGROUND_PRESETS.map((preset) => {
                  const isSelected = currentBg.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectBackground(preset)}
                      className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all relative overflow-hidden group ${preset.previewClass ? preset.previewClass : 'bg-slate-900'
                        } ${isSelected
                          ? 'border-yellow-400 scale-[1.02] shadow-lg ring-2 ring-yellow-400/40'
                          : 'border-white/10 opacity-90 hover:opacity-100 hover:border-yellow-400/40'
                        }`}
                    >
                      {preset.imageUrl ? (
                        <>
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end justify-center p-1.5">
                            <span className="text-[11px] font-bold text-white drop-shadow-md truncate w-full text-center">
                              {preset.name}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span
                          className={`text-[11px] font-bold ${preset.id === 'moonlight-gold' ? 'text-night-950 font-extrabold' : 'text-white'
                            } drop-shadow-md`}
                        >
                          {preset.name}
                        </span>
                      )}
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-yellow-400 text-night-950 flex items-center justify-center shadow">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 5: Photo Frames */}
          {activeTab === 'frames' && (
            <div className="space-y-4 animate-fadeIn text-left">
              {/* Frame Control Info */}
              {selectedFrame && (
                <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-500/15 to-yellow-500/5 border border-yellow-400/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-300 truncate">
                    Đang dùng: {selectedFrame.name}
                  </span>
                  <button
                    onClick={() => handleSelectFrame(null)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    Gỡ khung
                  </button>
                </div>
              )}

              {/* Frames List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-200 block">
                  Bộ sưu tập khung Trung Thu:
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {FRAMES.map((frame) => {
                    const isSelected = selectedFrame?.id === frame.id;
                    return (
                      <button
                        key={frame.id}
                        onClick={() => handleSelectFrame(frame)}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all group ${isSelected
                          ? 'border-yellow-400 bg-yellow-400/15 scale-[1.01] shadow-xl'
                          : 'border-white/10 bg-white/5 hover:border-yellow-400/40 hover:bg-white/10'
                          }`}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-night-950/60 p-1 flex items-center justify-center relative flex-shrink-0 group-hover:scale-105 transition-transform">
                          <img
                            src={frame.imageUrl}
                            alt={frame.name}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-yellow-400 text-night-950 flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-200 group-hover:text-yellow-300">
                            {frame.name}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                            {frame.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Crop, Zoom & Pan Adjuster Modal */}
      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onConfirm={handleConfirmCroppedPhoto}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </div>
  );
};

