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
          prisma.moonPiece.count(),
          prisma.moonPiece.count({ where: { status: 'COMPLETED' } }),
          prisma.moonPiece.count({ where: { status: 'LOCKED' } }),
          prisma.moonPiece.count({ where: { status: 'AVAILABLE' } }),
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
          progress: Math.round((completedPieces / totalPieces) * 100),
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

      const where: any = {};
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
   */
  static async resizeMoon(req: Request, res: Response) {
    try {
      const { gridSize } = req.body;
      const size = parseInt(gridSize, 10);
      if (!size || size < 11 || size > 35) {
        return res.status(400).json({ success: false, message: 'Kích thước lưới không hợp lệ (11 - 35)' });
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

      // 1. Fetch all existing contributions
      const contributions = await prisma.contribution.findMany({
        orderBy: { createdAt: 'asc' },
      });

      // 2. Clear old pieces for this moon
      await prisma.moonPiece.deleteMany({
        where: { moonId: moon.id },
      });

      // 3. Generate new grid
      const center = size / 2;
      const radius = size / 2;
      const newPiecesData: Array<{
        moonId: string;
        row: number;
        col: number;
        pieceNumber: number;
        isWithinMoon: boolean;
        status: string;
      }> = [];

      let pieceNum = 1;
      let validCount = 0;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const d1 = Math.hypot(r - center, c - center);
          const d2 = Math.hypot(r - center, c + 1 - center);
          const d3 = Math.hypot(r + 1 - center, c - center);
          const d4 = Math.hypot(r + 1 - center, c + 1 - center);
          const isWithin = d1 <= radius && d2 <= radius && d3 <= radius && d4 <= radius;

          if (isWithin) validCount++;

          newPiecesData.push({
            moonId: moon.id,
            row: r,
            col: c,
            pieceNumber: pieceNum++,
            isWithinMoon: isWithin,
            status: 'AVAILABLE',
          });
        }
      }

      // Batch create all pieces
      await prisma.moonPiece.createMany({
        data: newPiecesData,
      });

      // Remap existing contributions to the newly created pieces inside moon
      const validPieces = await prisma.moonPiece.findMany({
        where: { moonId: moon.id, isWithinMoon: true },
        orderBy: { pieceNumber: 'asc' },
        take: contributions.length,
      });

      for (let i = 0; i < contributions.length; i++) {
        if (validPieces[i]) {
          await prisma.contribution.update({
            where: { id: contributions[i].id },
            data: { pieceId: validPieces[i].id },
          });
          await prisma.moonPiece.update({
            where: { id: validPieces[i].id },
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
          completedPieces: contributions.length,
          status: contributions.length >= validCount ? 'COMPLETED' : 'ACTIVE',
        },
      });

      return res.json({
        success: true,
        message: `🌕 Đã mở rộng vầng trăng thành công lên lưới ${size}x${size} (${validCount} mảnh tròn). Toàn bộ ${contributions.length} bài nộp trước đó đã được giữ nguyên!`,
        data: {
          totalRows: size,
          totalCols: size,
          totalPieces: size * size,
          activePieces: validCount,
          completedPieces: contributions.length,
        },
      });
    } catch (error: any) {
      console.error('Lỗi resize vầng trăng:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi mở rộng vầng trăng' });
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
