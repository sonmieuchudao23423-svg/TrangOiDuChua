import { Request, Response } from 'express';
import prisma from '../db';
import { PieceLockService } from '../services/pieceLockService';

export class MoonController {
  /**
   * GET /api/moon
   * Retrieve moon progress and stats
   */
  static async getMoonOverview(req: Request, res: Response) {
    try {
      await PieceLockService.releaseExpiredLocks();

      let moon = await prisma.moon.findFirst();
      if (!moon) {
        moon = await prisma.moon.create({
          data: {
            name: 'Vầng Trăng Trung Thu 2026',
            totalRows: 13,
            totalCols: 13,
            totalPieces: 169,
            activePieces: 101,
            completedPieces: 0,
            status: 'ACTIVE',
          },
        });
      }

      const activePiecesCount = await prisma.moonPiece.count({
        where: { moonId: moon.id, isWithinMoon: true },
      });
      const activePieces = activePiecesCount > 0 ? activePiecesCount : (moon.activePieces || 121);

      const completedCount = await prisma.moonPiece.count({
        where: { moonId: moon.id, isWithinMoon: true, status: 'COMPLETED' },
      });

      const lockedCount = await prisma.moonPiece.count({
        where: { moonId: moon.id, isWithinMoon: true, status: 'LOCKED' },
      });

      const availableCount = activePieces - completedCount - lockedCount;
      const progressPercent = Math.min(100, Math.round((completedCount / activePieces) * 100));

      let milestoneMessage = 'Chưa đâu… Trăng vẫn đang chờ mảnh của bạn!';
      if (progressPercent >= 100) {
        milestoneMessage = '🌕 TRĂNG ƠI, ĐỦ CHƯA? — “ĐỦ RỒI!” 🐺✨';
      } else if (progressPercent >= 99) {
        milestoneMessage = 'Một mảnh nữa thôi… Trăng sắp tròn vẹn rồi!';
      } else if (progressPercent >= 90) {
        milestoneMessage = 'Sắp đủ rồi! Sói ơi, còn thiếu một chút! 🐺🌕';
      } else if (progressPercent >= 50) {
        milestoneMessage = 'Nửa Trăng đã có những câu chuyện của Bầy. 🐺';
      } else if (progressPercent >= 10) {
        milestoneMessage = 'Trăng vừa nhận được những mảnh đầu tiên! 🌕✨';
      }

      return res.json({
        success: true,
        data: {
          id: moon.id,
          name: moon.name,
          totalRows: moon.totalRows,
          totalCols: moon.totalCols,
          totalPieces: moon.totalPieces,
          activePieces: moon.activePieces,
          completedPieces: completedCount,
          lockedPieces: lockedCount,
          availablePieces: Math.max(0, availableCount),
          progressPercent,
          status: progressPercent >= 100 ? 'COMPLETED' : 'ACTIVE',
          milestoneMessage,
        },
      });
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin vầng trăng:', error);
      return res.status(500).json({ success: false, message: 'Không thể tải thông tin vầng trăng' });
    }
  }

  /**
   * GET /api/moon/pieces
   * Optimized payload for rendering the 400-piece community grid
   */
  static async getMoonPieces(req: Request, res: Response) {
    try {
      await PieceLockService.releaseExpiredLocks();

      const pieces = await prisma.moonPiece.findMany({
        select: {
          id: true,
          row: true,
          col: true,
          pieceNumber: true,
          isWithinMoon: true,
          status: true,
          lockedUntil: true,
          lockedBy: true,
          contribution: {
            select: {
              id: true,
              displayName: true,
              message: true,
              thumbnailUrl: true,
              imageUrl: true,
              status: true,
            },
          },
        },
        orderBy: [{ row: 'asc' }, { col: 'asc' }],
      });

      return res.json({
        success: true,
        data: pieces,
      });
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách mảnh trăng:', error);
      return res.status(500).json({ success: false, message: 'Không thể tải các mảnh trăng' });
    }
  }

  /**
   * GET /api/moon/recent
   * Get 12 most recent contributions for landing showcase
   */
  static async getRecentContributions(req: Request, res: Response) {
    try {
      const contributions = await prisma.contribution.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: {
          piece: {
            select: {
              pieceNumber: true,
              row: true,
              col: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        data: contributions,
      });
    } catch (error: any) {
      console.error('Lỗi lấy đóng góp gần đây:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }
}
