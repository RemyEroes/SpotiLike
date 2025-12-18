import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllArtists,
  getArtistById,
  getArtistSongs,
  updateArtist,
  deleteArtist
} from '../controllers/artistController';

const router = Router();

// GET /api/artists - Liste tous les artistes
router.get('/', getAllArtists);

// GET /api/artists/:id - Détails d'un artiste
router.get('/:id', getArtistById);

// GET /api/artists/:id/songs - Morceaux d'un artiste
router.get('/:id/songs', getArtistSongs);

// PUT /api/artists/:id - Modifier un artiste
router.put('/:id', updateArtist);

// DELETE /api/artists/:id - Supprimer un artiste (auth requise, cascade)
router.delete('/:id', authenticateToken, deleteArtist);

export default router;
