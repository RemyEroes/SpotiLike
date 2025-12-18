import { Request } from 'express';
import { RowDataPacket } from 'mysql2';

// ==================== ENTITIES ====================

export interface Album extends RowDataPacket {
  id: number;
  titre: string;
  pochette: string;
  date_sortie: Date;
  artiste_id: number;
  // Joined fields
  artiste_nom?: string;
  artiste_avatar?: string;
}

export interface Artiste extends RowDataPacket {
  id: number;
  nom: string;
  avatar: string;
  biographie: string;
}

export interface Morceau extends RowDataPacket {
  id: number;
  titre: string;
  duree: number;
  album_id: number;
  // Joined fields
  album_titre?: string;
  artiste_nom?: string;
  genres?: string;
}

export interface Genre extends RowDataPacket {
  id: number;
  titre: string;
  description: string;
}

export interface Utilisateur extends RowDataPacket {
  id: number;
  nom_utilisateur: string;
  email: string;
  mot_de_passe: string;
}

// ==================== JWT ====================

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
