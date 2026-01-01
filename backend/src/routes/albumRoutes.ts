import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllAlbums,
  getAlbumById,
  getAlbumSongs,
  createAlbum,
  addSongToAlbum,
  updateAlbum,
  deleteAlbum
} from '../controllers/albumController';

const router = Router();

// GET /api/albums - Liste tous les albums
router.get('/', getAllAlbums);

// GET /api/albums/:id - Détails d'un album
router.get('/:id', getAlbumById);

// GET /api/albums/:id/songs - Morceaux d'un album
router.get('/:id/songs', getAlbumSongs);

// POST /api/albums - Créer un album
router.post('/', authenticateToken, createAlbum);

// POST /api/albums/:id/songs - Ajouter un morceau
router.post('/:id/songs', authenticateToken, addSongToAlbum);

// PUT /api/albums/:id - Modifier un album
router.put('/:id', authenticateToken, updateAlbum);

// DELETE /api/albums/:id - Supprimer un album (auth requise)
router.delete('/:id', authenticateToken, deleteAlbum);

export default router;
