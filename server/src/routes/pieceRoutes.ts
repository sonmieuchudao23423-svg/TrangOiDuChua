import { Router } from 'express';
import { PieceController } from '../controllers/pieceController';

const router = Router();

router.post('/claim', PieceController.claimPiece);
router.get('/:id', PieceController.getPieceDetails);
router.post('/:id/submit', PieceController.submitPiece);
router.post('/:id/release', PieceController.releasePiece);

export default router;
