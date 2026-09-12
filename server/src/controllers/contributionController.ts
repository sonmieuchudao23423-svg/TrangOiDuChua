import { Request, Response } from 'express';
import prisma from '../db';

export class ContributionController {
  /**
   * GET /api/contributions
   * Public gallery of contributions
   */
  static async getContributions(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
      const search = (req.query.search as string || '').trim();

      const where: any = {
        status: 'APPROVED',
      };

      if (search) {
        where.OR = [
          { displayName: { contains: search } },
          { message: { contains: search } },
        ];
      }

      const [total, contributions] = await Promise.all([
        prisma.contribution.count({ where }),
        prisma.contribution.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            piece: {
              select: {
                pieceNumber: true,
                row: true,
                col: true,
              },
            },
          },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          items: contributions,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      console.error('Lỗi lấy danh sách gallery:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  /**
   * GET /api/contributions/:id
   */
  static async getContributionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contribution = await prisma.contribution.findUnique({
        where: { id },
        include: {
          piece: true,
        },
      });

      if (!contribution) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đóng góp này' });
      }

      return res.json({
        success: true,
        data: contribution,
      });
    } catch (error: any) {
      console.error('Lỗi xem chi tiết đóng góp:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }
}
