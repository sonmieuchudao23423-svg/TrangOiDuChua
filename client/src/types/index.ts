export interface MoonData {
  id: string;
  name: string;
  totalRows: number;
  totalCols: number;
  totalPieces: number;
  activePieces: number;
  completedPieces: number;
  lockedPieces: number;
  availablePieces: number;
  progressPercent: number;
  status: 'ACTIVE' | 'COMPLETED';
  milestoneMessage: string;
}

export interface MoonPiece {
  id: string;
  row: number;
  col: number;
  pieceNumber: number;
  isWithinMoon: boolean;
  status: 'AVAILABLE' | 'LOCKED' | 'COMPLETED';
  lockedUntil?: string | null;
  lockedBy?: string | null;
  contribution?: {
    id: string;
    displayName: string;
    message: string | null;
    thumbnailUrl: string;
    imageUrl: string;
    status: string;
  } | null;
}

export interface Contribution {
  id: string;
  pieceId: string;
  sessionId: string;
  displayName: string;
  message: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  status: string;
  createdAt: string;
  piece?: {
    pieceNumber: number;
    row: number;
    col: number;
  };
}

export interface PlacedSticker {
  id: string;
  svg: string;
  name: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface StickerItem {
  id: string;
  name: string;
  svg?: string;
  imageUrl?: string;
  category: 'moon' | 'lantern' | 'character' | 'deco';
}

export interface BackgroundPreset {
  id: string;
  name: string;
  color: string;
  gradient?: string;
  previewClass?: string;
  imageUrl?: string;
}

export interface FrameItem {
  id: string;
  name: string;
  imageUrl: string;
  previewUrl?: string;
  description?: string;
}

