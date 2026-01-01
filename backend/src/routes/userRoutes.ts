import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  signup,
  login,
  deleteUser
} from '../controllers/userController';

const router = Router();

// POST /api/users/signup - Inscription
router.post('/signup', signup);

// POST /api/users/login - Connexion
router.post('/login', login);

// DELETE /api/users/:id - Supprimer un utilisateur (auth requise)
router.delete('/:id', authenticateToken, deleteUser);

export default router;
