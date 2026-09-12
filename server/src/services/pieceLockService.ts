import prisma from '../db';

const LOCK_DURATION_MINUTES = 15;

export class PieceLockService {
  /**
   * Release all expired locks
   */
  static async releaseExpiredLocks(): Promise<number> {
    const now = new Date();
    const result = await prisma.moonPiece.updateMany({
      where: {
        status: 'LOCKED',
        lockedUntil: {
          lt: now,
        },
      },
      data: {
        status: 'AVAILABLE',
        lockedBy: null,
        lockedUntil: null,
      },
    });
    return result.count;
  }

  /**
   * Claim an available piece for a session
   * Can accept an optional pieceId if user clicked on a specific piece
   */
  static async claimPiece(sessionId: string, preferredPieceId?: string): Promise<any> {
    if (!sessionId) {
      throw new Error('Thiếu mã phiên (sessionId)');
    }

    // First clean expired locks
    await this.releaseExpiredLocks();

    // Check if this session already holds an active lock
    const existingLock = await prisma.moonPiece.findFirst({
      where: {
        status: 'LOCKED',
        lockedBy: sessionId,
        lockedUntil: {
          gt: new Date(),
        },
      },
      include: {
        moon: true,
      },
    });

    // If session already locked a piece, return it (extend lock)
    if (existingLock) {
      const updated = await prisma.moonPiece.update({
        where: { id: existingLock.id },
        data: {
          lockedUntil: new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000),
        },
      });
      return updated;
    }

    const lockExpiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);

    // If user clicked a specific piece
    if (preferredPieceId) {
      const piece = await prisma.moonPiece.findUnique({
        where: { id: preferredPieceId },
      });

      if (!piece) {
        throw new Error('Mảnh trăng không tồn tại.');
      }

      if (!piece.isWithinMoon) {
        throw new Error('Mảnh này ở ngoài rìa vầng trăng và không thể chọn.');
      }

      if (piece.status === 'COMPLETED') {
        throw new Error('Mảnh trăng này đã được một bạn hoàn thành rồi!');
      }

      // Try to lock atomically
      const updateCount = await prisma.moonPiece.updateMany({
        where: {
          id: preferredPieceId,
          isWithinMoon: true,
          OR: [
            { status: 'AVAILABLE' },
            {
              status: 'LOCKED',
              lockedUntil: { lt: new Date() },
            },
          ],
        },
        data: {
          status: 'LOCKED',
          lockedBy: sessionId,
          lockedUntil: lockExpiresAt,
        },
      });

      if (updateCount.count > 0) {
        return prisma.moonPiece.findUnique({ where: { id: preferredPieceId } });
      } else {
        // Preferred piece was taken just now!
        throw new Error('🌕 Vừa có người nhanh tay hơn một chút! Bạn hãy chọn một mảnh khác nhé.');
      }
    }

    // Otherwise find an available piece (preferably within circle)
    const availablePieces = await prisma.moonPiece.findMany({
      where: {
        status: 'AVAILABLE',
        isWithinMoon: true,
      },
      select: { id: true },
      take: 50,
    });

    if (availablePieces.length === 0) {
      // Check if any pieces outside circle are available or all 400
      const anyAvailable = await prisma.moonPiece.findMany({
        where: { status: 'AVAILABLE' },
        select: { id: true },
        take: 10,
      });

      if (anyAvailable.length === 0) {
        throw new Error('✨ Tất cả mảnh trăng đã được các bạn góp trọn vẹn rồi!');
      }
      availablePieces.push(...anyAvailable);
    }

    // Pick random candidate to distribute evenly across Moon
    const randomIndex = Math.floor(Math.random() * availablePieces.length);
    const candidateId = availablePieces[randomIndex].id;

    const updateCount = await prisma.moonPiece.updateMany({
      where: {
        id: candidateId,
        status: 'AVAILABLE',
      },
      data: {
        status: 'LOCKED',
        lockedBy: sessionId,
        lockedUntil: lockExpiresAt,
      },
    });

    if (updateCount.count > 0) {
      return prisma.moonPiece.findUnique({ where: { id: candidateId } });
    }

    // If concurrency race happened on this piece, retry recursively once
    return this.claimPiece(sessionId);
  }

  /**
   * Release lock voluntarily (e.g. user clicked Cancel)
   */
  static async releaseLock(pieceId: string, sessionId: string) {
    const result = await prisma.moonPiece.updateMany({
      where: {
        id: pieceId,
        lockedBy: sessionId,
        status: 'LOCKED',
      },
      data: {
        status: 'AVAILABLE',
        lockedBy: null,
        lockedUntil: null,
      },
    });
    return result.count > 0;
  }
}
