import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './db';
import { PieceLockService } from './services/pieceLockService';

const PORT = parseInt(process.env.PORT || '5001', 10);

async function bootstrap() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log('🌕 [Database] Kết nối cơ sở dữ liệu SQLite/Prisma thành công!');

    // Auto initialize pieces if database is empty (fresh deploy)
    let moon = await prisma.moon.findFirst();
    if (!moon) {
      console.log('🌕 [Init] Khởi tạo cơ sở dữ liệu Vầng Trăng (13x13)...');
      moon = await prisma.moon.create({
        data: {
          name: 'Vầng Trăng Trung Thu 2026 - Bầy Tiên Sa',
          totalRows: 13,
          totalCols: 13,
          totalPieces: 169,
          activePieces: 101,
          completedPieces: 0,
        },
      });

      const gridSize = 13;
      const radius = 6;
      const center = 6;
      const pieceDataList: Array<{
        moonId: string;
        row: number;
        col: number;
        pieceNumber: number;
        isWithinMoon: boolean;
        status: string;
      }> = [];

      let pieceNumber = 1;
      let validCount = 0;

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const cornerDist = Math.hypot(r - center, c - center);
          const isWithin = cornerDist <= radius + 0.1;
          if (isWithin) validCount++;

          pieceDataList.push({
            moonId: moon.id,
            row: r,
            col: c,
            pieceNumber: pieceNumber++,
            isWithinMoon: isWithin,
            status: 'AVAILABLE',
          });
        }
      }

      await prisma.moon.update({
        where: { id: moon.id },
        data: { activePieces: validCount },
      });

      await prisma.moonPiece.createMany({
        data: pieceDataList,
      });
      console.log(`🌕 [Init] Đã khởi tạo thành công ${validCount} mảnh trăng hợp lệ!`);
    }

    // Initial lock cleanup
    const released = await PieceLockService.releaseExpiredLocks();
    if (released > 0) {
      console.log(`🧹 [Cleaner] Đã dọn dẹp ${released} mảnh trăng hết hạn giữ.`);
    }

    // Periodic lock cleanup every 15 seconds
    setInterval(async () => {
      try {
        await PieceLockService.releaseExpiredLocks();
      } catch (err) {
        console.error('Lỗi khi chạy dọn dẹp khóa định kỳ:', err);
      }
    }, 15 * 1000);

    const server = app.listen(PORT, () => {
      console.log(`✨ [Server] "BẠN GÓP GÌ CHO VẦNG TRĂNG?" đang chạy tại http://localhost:${PORT}`);
      console.log(`📸 [Storage] Thư mục tải lên: ${process.env.UPLOAD_DIR || './uploads'}`);
    });

    const shutdown = async () => {
      console.log('Đang tắt server an toàn...');
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Lỗi khởi động server:', error);
    process.exit(1);
  }
}

bootstrap();
