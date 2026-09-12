import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();

router.post('/generate', AIController.generateImage);

export default router;
