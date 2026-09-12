import { Router } from 'express';
import { MoonController } from '../controllers/moonController';

const router = Router();

router.get('/', MoonController.getMoonOverview);
router.get('/pieces', MoonController.getMoonPieces);
router.get('/recent', MoonController.getRecentContributions);

export default router;
