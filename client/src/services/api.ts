import { MoonData, MoonPiece, Contribution } from '../types';

// Production API URL or fallback to local proxy /api
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
    : '/api');

/**
 * Get or create a persistent anonymous session ID
 */
export function getSessionId(): string {
  let sessionId = localStorage.getItem('trung_thu_session_id');
  if (!sessionId) {
    sessionId = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('trung_thu_session_id', sessionId);
  }
  return sessionId;
}

export const api = {
  // Moon overview
  async getMoonOverview(): Promise<MoonData> {
    const res = await fetch(`${API_BASE}/moon`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải thông tin vầng trăng');
    return json.data;
  },

  // All 400 pieces
  async getMoonPieces(): Promise<MoonPiece[]> {
    const res = await fetch(`${API_BASE}/moon/pieces`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách mảnh trăng');
    return json.data;
  },

  // Recent contributions
  async getRecentContributions(): Promise<Contribution[]> {
    const res = await fetch(`${API_BASE}/moon/recent`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải đóng góp gần đây');
    return json.data;
  },

  // Claim a piece
  async claimPiece(pieceId?: string): Promise<MoonPiece> {
    const sessionId = getSessionId();
    const res = await fetch(`${API_BASE}/pieces/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, pieceId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Không thể nhận mảnh trăng lúc này');
    return json.data;
  },

  // Submit piece artwork
  async submitPiece(
    pieceId: string,
    data: {
      artworkData: string;
      displayName?: string;
      message?: string;
    }
  ): Promise<{
    piece: MoonPiece;
    contribution: Contribution;
    moonProgress: number;
    totalCompleted: number;
  }> {
    const sessionId = getSessionId();
    const res = await fetch(`${API_BASE}/pieces/${pieceId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        ...data,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gửi mảnh trăng không thành công');
    return json.data;
  },

  // Release locked piece
  async releasePiece(pieceId: string): Promise<void> {
    const sessionId = getSessionId();
    await fetch(`${API_BASE}/pieces/${pieceId}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
  },

  // Send heartbeat to extend piece lock while user is actively drawing
  async heartbeatPiece(pieceId: string): Promise<boolean> {
    try {
      const sessionId = getSessionId();
      const res = await fetch(`${API_BASE}/pieces/${pieceId}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const json = await res.json();
      return !!json.success;
    } catch (e) {
      return false;
    }
  },

  // Release locked piece via beacon / keepalive on tab close or navigation
  releasePieceBeacon(pieceId: string): void {
    const sessionId = getSessionId();
    const url = `${API_BASE}/pieces/${pieceId}/release`;
    const data = JSON.stringify({ sessionId });
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  },

  // Gallery
  async getContributions(page = 1, limit = 24, search = ''): Promise<{
    items: Contribution[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    const res = await fetch(`${API_BASE}/contributions?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải gallery');
    return json.data;
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`);
    const json = await res.json();
    return json.data;
  },

  async getAdminPieces(page = 1, limit = 50, status = '') {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status,
    });
    const res = await fetch(`${API_BASE}/admin/pieces?${query.toString()}`);
    const json = await res.json();
    return json.data;
  },

  async adminUnlockPiece(pieceId: string) {
    const res = await fetch(`${API_BASE}/admin/unlock/${pieceId}`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json;
  },

  async adminModerateContribution(contributionId: string, status: 'APPROVED' | 'REJECTED', note?: string) {
    const res = await fetch(`${API_BASE}/admin/moderate/${contributionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json;
  },

  async adminResetToEmpty(adminKey: string) {
    const res = await fetch(`${API_BASE}/admin/reset-empty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi đặt lại vầng trăng');
    return json;
  },

  async adminResizeMoon(gridSize: number) {
    const res = await fetch(`${API_BASE}/admin/resize-moon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gridSize }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi mở rộng vầng trăng');
    return json;
  },

  async adminShufflePieces() {
    const res = await fetch(`${API_BASE}/admin/shuffle-pieces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xáo trộn vị trí mảnh trăng');
    return json;
  },

  async adminDeleteContribution(contributionId: string) {
    const res = await fetch(`${API_BASE}/admin/contribution/${contributionId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xóa bài đóng góp');
    return json;
  },

  async adminUpdateContribution(contributionId: string, displayName: string, message: string) {
    const res = await fetch(`${API_BASE}/admin/contribution/${contributionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, message }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật bài nộp');
    return json;
  },

  async adminGetAllContributions() {
    const res = await fetch(`${API_BASE}/admin/all-contributions`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách tác phẩm');
    return json.data;
  },

  // AI Image Generation
  async generateAIImage(prompt: string): Promise<{ imageUrl: string; prompt: string }> {
    const res = await fetch(`${API_BASE}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Không thể tạo ảnh bằng AI');
    return json.data;
  },
};
