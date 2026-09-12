import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import moonRoutes from './routes/moonRoutes';
import pieceRoutes from './routes/pieceRoutes';
import contributionRoutes from './routes/contributionRoutes';
import adminRoutes from './routes/adminRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'BẠN GÓP GÌ CHO VẦNG TRĂNG? 🌕',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/moon', moonRoutes);
app.use('/api/pieces', pieceRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Đường dẫn không tồn tại trên hệ thống Vầng Trăng.',
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Đã xảy ra sự cố ngoài ý muốn. Vui lòng thử lại sau!',
  });
});

export default app;
