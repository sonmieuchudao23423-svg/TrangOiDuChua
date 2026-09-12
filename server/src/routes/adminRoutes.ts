import { Router } from 'express';
import { AdminController } from '../controllers/adminController';

const router = Router();

router.get('/stats', AdminController.getStats);
router.get('/pieces', AdminController.getPieces);
router.get('/all-contributions', AdminController.getAllContributions);
router.post('/unlock/:id', AdminController.forceUnlockPiece);
router.post('/moderate/:contributionId', AdminController.moderateContribution);
router.delete('/contribution/:id', AdminController.deleteContribution);
router.post('/reset-empty', AdminController.resetToEmpty);
router.post('/resize-moon', AdminController.resizeMoon);

export default router;
