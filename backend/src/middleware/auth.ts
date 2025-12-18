import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'spotilike_secret_key_2024';

// Middleware d'authentification JWT
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Token d\'authentification requis'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Token invalide ou expiré'
    });
  }
};

// Génération d'un token JWT
export const generateToken = (payload: JWTPayload): string => {
  const options: jwt.SignOptions = { expiresIn: '24h' };
  return jwt.sign(payload, JWT_SECRET, options);
};
