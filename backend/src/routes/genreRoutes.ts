import { Router } from 'express';
import {
  getAllGenres,
  getGenreById,
  updateGenre
} from '../controllers/genreController';

const router = Router();

// GET /api/genres - Liste tous les genres
router.get('/', getAllGenres);

// GET /api/genres/:id - Détails d'un genre
router.get('/:id', getGenreById);

// PUT /api/genres/:id - Modifier un genre
router.put('/:id', updateGenre);

export default router;
