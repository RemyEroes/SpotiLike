import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../types';
import { generateToken } from '../middleware/auth';

// POST /api/users/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Tous les champs sont requis (username, email, password)'
      });
      return;
    }
    
    // unique email and username
    const existingEmail = await prisma.users.findUnique({
      where: { email },
    });
    const existingUsername = await prisma.users.findUnique({
      where: { username },
    });
    if (existingEmail) {
      res.status(409).json({ success: false, error: 'Cet email est déjà utilisé' });
      return;
    }
    if (existingUsername) {
      res.status(409).json({ success: false, error: 'Ce nom d\'utilisateur est déjà utilisé' });
      return;
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.users.create({
      data: {
        username, email,
        password: hashedPassword,
      },
    });
    
    const token = generateToken({
      id_user: newUser.id_user,
      email: newUser.email,
      username: newUser.username,
    });
    
    res.status(201).json({
      success: true,
      data: {
        id_user: newUser.id_user,
        username: newUser.username,
        email: newUser.email,
        token,
      },
      message: 'Utilisateur '+ newUser.id_user +' créé avec succès'
    });
  } catch (error) {
    console.error('Erreur signup:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'inscription' });
  }
};

// POST /api/users/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email et mot de passe requis' });
      return;
    }
    // user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });
    
    if (!user) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
      return;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
      return;
    }
    
    const token = generateToken({
      id_user: user.id_user,
      email: user.email,
      username: user.username,
    });
    
    res.json({
      success: true,
      data: {
        id_user: user.id_user,
        username: user.username,
        email: user.email,
        token,
      },
      message: 'Connexion réussie: user->'+ user.id_user
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la connexion' });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    
    const userExists = await prisma.users.findUnique({ where: { id_user: userId } });
    if (!userExists) {
      res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      return;
    }

    try {
      await prisma.users.delete({
        where: { id_user: userId },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
    
    res.json({ success: true, message: 'Utilisateur '+ userId +' supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
};
