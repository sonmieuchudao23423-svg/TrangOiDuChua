import { Router } from 'express';
import { ContributionController } from '../controllers/contributionController';

const router = Router();

router.get('/', ContributionController.getContributions);
router.get('/:id', ContributionController.getContributionById);

export default router;
