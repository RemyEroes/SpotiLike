import { Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { Utilisateur, AuthenticatedRequest } from '../types';
import { generateToken } from '../middleware/auth';

// POST /api/users/signup - Inscription d'un utilisateur
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom_utilisateur, email, mot_de_passe } = req.body;
    
    // Validation
    if (!nom_utilisateur || !email || !mot_de_passe) {
      res.status(400).json({
        success: false,
        error: 'Tous les champs sont requis (nom_utilisateur, email, mot_de_passe)'
      });
      return;
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Format d\'email invalide'
      });
      return;
    }
    
    // Validation mot de passe (minimum 6 caractères)
    if (mot_de_passe.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
      return;
    }
    
    // Vérifier si l'email existe déjà
    const [existingEmail] = await pool.query<Utilisateur[]>(
      'SELECT id FROM utilisateur WHERE email = ?',
      [email]
    );
    if (existingEmail.length > 0) {
      res.status(409).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
      return;
    }
    
    // Vérifier si le nom d'utilisateur existe déjà
    const [existingUsername] = await pool.query<Utilisateur[]>(
      'SELECT id FROM utilisateur WHERE nom_utilisateur = ?',
      [nom_utilisateur]
    );
    if (existingUsername.length > 0) {
      res.status(409).json({
        success: false,
        error: 'Ce nom d\'utilisateur est déjà utilisé'
      });
      return;
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    
    // Créer l'utilisateur
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO utilisateur (nom_utilisateur, email, mot_de_passe) VALUES (?, ?, ?)',
      [nom_utilisateur, email, hashedPassword]
    );
    
    // Générer le token JWT
    const token = generateToken({
      userId: result.insertId,
      email,
      username: nom_utilisateur
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        nom_utilisateur,
        email,
        token
      },
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    console.error('Erreur signup:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    });
  }
};

// POST /api/users/login - Connexion d'un utilisateur
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, mot_de_passe } = req.body;
    
    // Validation
    if (!email || !mot_de_passe) {
      res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
      return;
    }
    
    // Chercher l'utilisateur
    const [users] = await pool.query<Utilisateur[]>(
      'SELECT * FROM utilisateur WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
      return;
    }
    
    const user = users[0];
    
    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
      return;
    }
    
    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.nom_utilisateur
    });
    
    res.json({
      success: true,
      data: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        token
      },
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
};

// DELETE /api/users/:id - Supprimer un utilisateur (authentification requise)
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur existe
    const [users] = await pool.query<Utilisateur[]>('SELECT id FROM utilisateur WHERE id = ?', [id]);
    if (users.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }
    
    // Supprimer l'utilisateur
    await pool.query('DELETE FROM utilisateur WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};

// GET /api/users - Liste tous les utilisateurs (bonus)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const [users] = await pool.query<Utilisateur[]>(
      'SELECT id, nom_utilisateur, email FROM utilisateur ORDER BY id'
    );
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};
