import { Router } from 'express';
import albumRoutes from './albumRoutes';
import artistRoutes from './artistRoutes';
import genreRoutes from './genreRoutes';
import userRoutes from './userRoutes';

const router = Router();

// Monter les routes
router.use('/albums', albumRoutes);
router.use('/artists', artistRoutes);
router.use('/genres', genreRoutes);
router.use('/users', userRoutes);

export default router;
