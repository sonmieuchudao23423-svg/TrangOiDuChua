import { Request, Response } from 'express';
import prisma from '../db';
import { PieceLockService } from '../services/pieceLockService';
import fs from 'fs';
import path from 'path';

export class AdminController {
  /**
   * GET /api/admin/stats
   */
  static async getStats(req: Request, res: Response) {
    try {
      await PieceLockService.releaseExpiredLocks();

      const [totalPieces, completedPieces, lockedPieces, availablePieces, totalContributions] =
        await Promise.all([
          prisma.moonPiece.count({ where: { isWithinMoon: true } }),
          prisma.moonPiece.count({ where: { isWithinMoon: true, status: 'COMPLETED' } }),
          prisma.moonPiece.count({ where: { isWithinMoon: true, status: 'LOCKED' } }),
          prisma.moonPiece.count({ where: { isWithinMoon: true, status: 'AVAILABLE' } }),
          prisma.contribution.count(),
        ]);

      return res.json({
        success: true,
        data: {
          totalPieces,
          completedPieces,
          lockedPieces,
          availablePieces,
          totalContributions,
          progress: totalPieces > 0 ? Math.round((completedPieces / totalPieces) * 100) : 0,
        },
      });
    } catch (error: any) {
      console.error('Lỗi admin stats:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  /**
   * GET /api/admin/pieces
   */
  static async getPieces(req: Request, res: Response) {
    try {
      const { status, page = '1', limit = '50' } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;

      const where: any = { isWithinMoon: true };
      if (status && typeof status === 'string') {
        where.status = status;
      }

      const [total, pieces] = await Promise.all([
        prisma.moonPiece.count({ where }),
        prisma.moonPiece.findMany({
          where,
          include: { contribution: true },
          orderBy: { pieceNumber: 'asc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
      ]);

      return res.json({
        success: true,
        data: {
          items: pieces,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error: any) {
      console.error('Lỗi admin pieces:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  /**
   * POST /api/admin/unlock/:id
   */
  static async forceUnlockPiece(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const piece = await prisma.moonPiece.findUnique({ where: { id } });

      if (!piece) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy mảnh trăng' });
      }

      await prisma.moonPiece.update({
        where: { id },
        data: {
          status: 'AVAILABLE',
          lockedBy: null,
          lockedUntil: null,
        },
      });

      return res.json({ success: true, message: `Đã mở khóa mảnh #${piece.pieceNumber}` });
    } catch (error: any) {
      console.error('Lỗi mở khóa mảnh:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  /**
   * POST /api/admin/moderate/:contributionId
   */
  static async moderateContribution(req: Request, res: Response) {
    try {
      const { contributionId } = req.params;
      const { status, note } = req.body;

      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Trạng thái kiểm duyệt không hợp lệ' });
      }

      const updated = await prisma.contribution.update({
        where: { id: contributionId },
        data: {
          status,
          moderationNote: note || null,
        },
      });

      return res.json({
        success: true,
        message: `Đã cập nhật trạng thái kiểm duyệt thành ${status}`,
        data: updated,
      });
    } catch (error: any) {
      console.error('Lỗi kiểm duyệt:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  /**
   * POST /api/admin/reset-empty
   * Resets the entire moon to 0% with 400 empty available pieces for REAL LIVE DATA
   */
  static async resetToEmpty(req: Request, res: Response) {
    try {
      const { adminKey } = req.body;
      const expectedKey = process.env.ADMIN_SECRET_KEY || 'trungthu2026admin';

      if (adminKey !== expectedKey) {
        return res.status(401).json({ success: false, message: 'Mật mã quản trị không chính xác!' });
      }

      // 1. Delete all contributions
      await prisma.contribution.deleteMany();

      // 2. Reset all pieces to AVAILABLE
      await prisma.moonPiece.updateMany({
        data: {
          status: 'AVAILABLE',
          lockedBy: null,
          lockedUntil: null,
        },
      });

      // 3. Reset Moon completed count to 0
      await prisma.moon.updateMany({
        data: {
          completedPieces: 0,
          status: 'ACTIVE',
        },
      });

      return res.json({
        success: true,
        message: '🌕 Vầng trăng đã được đưa về trạng thái trống (0/400 mảnh) để sẵn sàng đón nhận toàn bộ tác phẩm thật của cộng đồng!',
      });
    } catch (error: any) {
      console.error('Lỗi reset vầng trăng:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }

  /**
   * POST /api/admin/resize-moon
   * Expand/resize moon grid (e.g. 13, 15, 17, 19, 21, 25) while preserving all completed contributions
   * and scattering them randomly across the moon circle
   */
  static async resizeMoon(req: Request, res: Response) {
    try {
      const { gridSize } = req.body;
      const size = parseInt(gridSize, 10);
      if (!size || size < 7 || size > 35) {
        return res.status(400).json({ success: false, message: 'Kích thước lưới không hợp lệ (7 - 35)' });
      }

      let moon = await prisma.moon.findFirst();
      if (!moon) {
        moon = await prisma.moon.create({
          data: {
            name: 'Vầng Trăng Trung Thu 2026',
            totalRows: size,
            totalCols: size,
            totalPieces: size * size,
            activePieces: size * size,
            completedPieces: 0,
            status: 'ACTIVE',
          },
        });
      }

      // 1. Fetch and backup all existing contributions
      const existingContributions = await prisma.contribution.findMany({
        orderBy: { createdAt: 'asc' },
      });

      // 2. Pre-calculate valid pieces count for new grid to prevent any data loss
      const center = (size - 1) / 2;
      const radius = (size - 1) / 2;
      let validCount = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (Math.hypot(r - center, c - center) <= radius + 0.1) {
            validCount++;
          }
        }
      }

      // Safety check: ensure no contribution is lost
      if (validCount < existingContributions.length) {
        return res.status(400).json({
          success: false,
          message: `⚠️ Lưới ${size}x${size} chỉ có ${validCount} ô hợp lệ, nhưng hiện đang có ${existingContributions.length} bài nộp. Vui lòng chọn kích thước lớn hơn để đảm bảo không làm mất dữ liệu!`,
        });
      }

      // 3. Clear old contributions and pieces for this moon
      await prisma.contribution.deleteMany();
      await prisma.moonPiece.deleteMany({
        where: { moonId: moon.id },
      });

      // 4. Generate new grid
      const newPiecesData: Array<{
        moonId: string;
        row: number;
        col: number;
        pieceNumber: number;
        isWithinMoon: boolean;
        status: string;
      }> = [];

      let pieceNum = 1;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const isWithin = Math.hypot(r - center, c - center) <= radius + 0.1;
          newPiecesData.push({
            moonId: moon.id,
            row: r,
            col: c,
            pieceNumber: isWithin ? pieceNum++ : 0,
            isWithinMoon: isWithin,
            status: 'AVAILABLE',
          });
        }
      }

      // Batch create all pieces
      await prisma.moonPiece.createMany({
        data: newPiecesData,
      });

      // 5. Recreate and rebind all contributions to the new valid pieces scattered randomly
      const validPieces = await prisma.moonPiece.findMany({
        where: { moonId: moon.id, isWithinMoon: true },
      });

      // Fisher-Yates shuffle to randomize piece assignment
      const shuffledPieces = [...validPieces];
      for (let i = shuffledPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPieces[i], shuffledPieces[j]] = [shuffledPieces[j], shuffledPieces[i]];
      }

      for (let i = 0; i < existingContributions.length; i++) {
        if (shuffledPieces[i]) {
          const old = existingContributions[i];
          await prisma.contribution.create({
            data: {
              pieceId: shuffledPieces[i].id,
              sessionId: old.sessionId,
              displayName: old.displayName,
              message: old.message,
              imageUrl: old.imageUrl,
              thumbnailUrl: old.thumbnailUrl,
              status: old.status,
              moderationNote: old.moderationNote,
              createdAt: old.createdAt,
            },
          });
          await prisma.moonPiece.update({
            where: { id: shuffledPieces[i].id },
            data: { status: 'COMPLETED' },
          });
        }
      }

      // Update moon metadata
      await prisma.moon.update({
        where: { id: moon.id },
        data: {
          totalRows: size,
          totalCols: size,
          totalPieces: size * size,
          activePieces: validCount,
          completedPieces: existingContributions.length,
          status: existingContributions.length >= validCount ? 'COMPLETED' : 'ACTIVE',
        },
      });

      return res.json({
        success: true,
        message: `🌕 Đã đổi sang lưới ${size}x${size} (${validCount} mảnh trăng tròn). Toàn bộ ${existingContributions.length} bài nộp đã được phân bố ngẫu nhiên và bảo toàn 100% dữ liệu!`,
        data: {
          totalRows: size,
          totalCols: size,
          totalPieces: size * size,
          activePieces: validCount,
          completedPieces: existingContributions.length,
        },
      });
    } catch (error: any) {
      console.error('Lỗi resize vầng trăng:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi mở rộng vầng trăng' });
    }
  }

  /**
   * POST /api/admin/shuffle-pieces
   * Randomize / shuffle positions of all existing contributions across available moon pieces
   */
  static async shuffleMoonPieces(req: Request, res: Response) {
    try {
      const moon = await prisma.moon.findFirst();
      if (!moon) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy vầng trăng' });
      }

      const existingContributions = await prisma.contribution.findMany({
        orderBy: { createdAt: 'asc' },
      });

      if (existingContributions.length === 0) {
        return res.json({ success: true, message: 'Chưa có bài nộp nào để xáo trộn' });
      }

      const validPieces = await prisma.moonPiece.findMany({
        where: { moonId: moon.id, isWithinMoon: true },
      });

      if (validPieces.length < existingContributions.length) {
        return res.status(400).json({ success: false, message: 'Số ô hợp lệ không đủ' });
      }

      // Fisher-Yates shuffle
      const shuffledPieces = [...validPieces];
      for (let i = shuffledPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPieces[i], shuffledPieces[j]] = [shuffledPieces[j], shuffledPieces[i]];
      }

      // Recreate contributions to avoid pieceId unique collision
      await prisma.contribution.deleteMany();
      await prisma.moonPiece.updateMany({
        where: { moonId: moon.id },
        data: { status: 'AVAILABLE', lockedBy: null, lockedUntil: null },
      });

      for (let i = 0; i < existingContributions.length; i++) {
        const old = existingContributions[i];
        const piece = shuffledPieces[i];
        await prisma.contribution.create({
          data: {
            pieceId: piece.id,
            sessionId: old.sessionId,
            displayName: old.displayName,
            message: old.message,
            imageUrl: old.imageUrl,
            thumbnailUrl: old.thumbnailUrl,
            status: old.status,
            moderationNote: old.moderationNote,
            createdAt: old.createdAt,
          },
        });
        await prisma.moonPiece.update({
          where: { id: piece.id },
          data: { status: 'COMPLETED' },
        });
      }

      // Update moon completed count
      await prisma.moon.update({
        where: { id: moon.id },
        data: {
          completedPieces: existingContributions.length,
          status: existingContributions.length >= validPieces.length ? 'COMPLETED' : 'ACTIVE',
        },
      });

      return res.json({
        success: true,
        message: `🎲 Đã xáo trộn ngẫu nhiên vị trí của ${existingContributions.length} bài nộp thành công!`,
      });
    } catch (error: any) {
      console.error('Lỗi xáo trộn vị trí:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi xáo trộn vị trí' });
    }
  }

  /**
   * PUT /api/admin/contribution/:id
   */
  static async updateContribution(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { displayName, message } = req.body;

      const contribution = await prisma.contribution.update({
        where: { id },
        data: {
          displayName: displayName?.trim() || 'Người bạn nhỏ',
          message: message?.trim() || '',
        },
      });

      return res.json({
        success: true,
        message: 'Đã cập nhật thông tin bài nộp thành công!',
        data: contribution,
      });
    } catch (error: any) {
      console.error('Lỗi cập nhật đóng góp:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật bài nộp' });
    }
  }

  /**
   * DELETE /api/admin/contribution/:id
   */
  static async deleteContribution(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contribution = await prisma.contribution.findUnique({
        where: { id },
      });

      if (contribution) {
        await prisma.moonPiece.update({
          where: { id: contribution.pieceId },
          data: {
            status: 'AVAILABLE',
            lockedBy: null,
            lockedUntil: null,
          },
        });

        await prisma.contribution.delete({
          where: { id },
        });
      }

      // Recount completed pieces
      const completedCount = await prisma.moonPiece.count({
        where: { status: 'COMPLETED' },
      });

      await prisma.moon.updateMany({
        data: { completedPieces: completedCount },
      });

      return res.json({
        success: true,
        message: 'Đã xóa tác phẩm và giải phóng mảnh trăng thành công!',
      });
    } catch (error: any) {
      console.error('Lỗi xóa đóng góp:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }

  /**
   * GET /api/admin/all-contributions
   */
  static async getAllContributions(req: Request, res: Response) {
    try {
      const contributions = await prisma.contribution.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          piece: {
            select: {
              id: true,
              pieceNumber: true,
              row: true,
              col: true,
              status: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        data: contributions,
      });
    } catch (error: any) {
      console.error('Lỗi lấy tất cả đóng góp:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }
}
