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

    // Initial lock cleanup
    const released = await PieceLockService.releaseExpiredLocks();
    if (released > 0) {
      console.log(`🧹 [Cleaner] Đã dọn dẹp ${released} mảnh trăng hết hạn giữ.`);
    }

    // Periodic lock cleanup every 60 seconds
    setInterval(async () => {
      try {
        await PieceLockService.releaseExpiredLocks();
      } catch (err) {
        console.error('Lỗi khi chạy dọn dẹp khóa định kỳ:', err);
      }
    }, 60 * 1000);

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
