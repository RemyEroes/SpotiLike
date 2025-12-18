import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  signup,
  login,
  deleteUser,
  getAllUsers
} from '../controllers/userController';

const router = Router();

// POST /api/users/signup - Inscription
router.post('/signup', signup);

// POST /api/users/login - Connexion
router.post('/login', login);

// GET /api/users - Liste tous les utilisateurs
router.get('/', getAllUsers);

// DELETE /api/users/:id - Supprimer un utilisateur (auth requise)
router.delete('/:id', authenticateToken, deleteUser);

export default router;
