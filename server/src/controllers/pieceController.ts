import { Request, Response } from 'express';
import prisma from '../db';
import { PieceLockService } from '../services/pieceLockService';
import { ImageService } from '../services/imageService';

export class PieceController {
  /**
   * POST /api/pieces/claim
   * Atomically claims an available piece for 15 minutes
   */
  static async claimPiece(req: Request, res: Response) {
    try {
      const { sessionId, pieceId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu mã định danh phiên làm việc (sessionId)',
        });
      }

      const claimedPiece = await PieceLockService.claimPiece(sessionId, pieceId);

      return res.json({
        success: true,
        message: 'Bạn vừa nhận được một mảnh trăng!',
        data: claimedPiece,
      });
    } catch (error: any) {
      console.error('Lỗi khi giữ mảnh trăng:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể giữ mảnh trăng lúc này',
      });
    }
  }

  /**
   * GET /api/pieces/:id
   * Get piece details including contribution if any
   */
  static async getPieceDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const piece = await prisma.moonPiece.findUnique({
        where: { id },
        include: {
          contribution: true,
        },
      });

      if (!piece) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy mảnh trăng',
        });
      }

      return res.json({
        success: true,
        data: piece,
      });
    } catch (error: any) {
      console.error('Lỗi lấy chi tiết mảnh:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }

  /**
   * POST /api/pieces/:id/submit
   * Submits artwork, saves with Sharp, marks piece COMPLETED
   */
  static async submitPiece(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { sessionId, artworkData, displayName, message } = req.body;

      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'Thiếu mã phiên làm việc' });
      }

      if (!artworkData) {
        return res.status(400).json({ success: false, message: 'Mảnh trăng của bạn chưa có nét vẽ nào!' });
      }

      // Check piece
      const piece = await prisma.moonPiece.findUnique({
        where: { id },
      });

      if (!piece) {
        return res.status(404).json({ success: false, message: 'Mảnh trăng không tồn tại' });
      }

      if (piece.status === 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'Mảnh trăng này đã được hoàn thành trước đó rồi!',
        });
      }

      // Verify lock ownership or expired lock
      if (piece.status === 'LOCKED' && piece.lockedBy && piece.lockedBy !== sessionId) {
        if (piece.lockedUntil && piece.lockedUntil > new Date()) {
          return res.status(403).json({
            success: false,
            message: 'Mảnh trăng này đang được một bạn khác sáng tạo.',
          });
        }
      }

      // Clean/sanitize inputs
      const sanitizedName = (displayName || 'Người bạn nhỏ').toString().trim().slice(0, 40);
      const sanitizedMessage = (message || '').toString().trim().slice(0, 150);

      // Process and save artwork via Sharp
      const { imageUrl, thumbnailUrl } = await ImageService.saveArtworkFromBase64(artworkData);

      // Save contribution & update piece status atomically
      const result = await prisma.$transaction(async (tx) => {
        const contribution = await tx.contribution.create({
          data: {
            pieceId: piece.id,
            sessionId,
            displayName: sanitizedName || 'Người bạn nhỏ',
            message: sanitizedMessage,
            imageUrl,
            thumbnailUrl,
            status: 'APPROVED',
          },
        });

        const updatedPiece = await tx.moonPiece.update({
          where: { id: piece.id },
          data: {
            status: 'COMPLETED',
            lockedBy: null,
            lockedUntil: null,
            contributionId: contribution.id,
          },
        });

        // Increment Moon's completed count
        const moon = await tx.moon.update({
          where: { id: piece.moonId },
          data: {
            completedPieces: { increment: 1 },
          },
        });

        return { contribution, updatedPiece, moon };
      });

      return res.json({
        success: true,
        message: '✨ Bạn vừa góp một mảnh cho vầng trăng chung!',
        data: {
          piece: result.updatedPiece,
          contribution: result.contribution,
          moonProgress: Math.min(
            100,
            Math.round((result.moon.completedPieces / result.moon.activePieces) * 100)
          ),
          totalCompleted: result.moon.completedPieces,
        },
      });
    } catch (error: any) {
      console.error('Lỗi khi gửi mảnh trăng:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Không thể lưu mảnh trăng lúc này. Vui lòng thử lại!',
      });
    }
  }

  /**
   * POST /api/pieces/:id/release
   * Release piece lock
   */
  static async releasePiece(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'Thiếu mã phiên' });
      }

      await PieceLockService.releaseLock(id, sessionId);

      return res.json({
        success: true,
        message: 'Đã hủy giữ mảnh trăng thành công',
      });
    } catch (error: any) {
      console.error('Lỗi nhả mảnh trăng:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }
}
