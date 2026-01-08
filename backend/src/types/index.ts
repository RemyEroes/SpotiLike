import { Request } from 'express';
// On garde RowDataPacket si vous avez encore du code legacy mysql2, sinon on peut l'enlever
import { RowDataPacket } from 'mysql2';

// ==================== ENTITIES ====================

export interface Album extends RowDataPacket {
  id_album: number;
  title: string;
  release_date: Date | null; // <--- AJOUT DE | null
  cover_art: string | null;
  // Joined fields
  artist_name?: string | null;
  artist_id?: number | null;
}

export interface Artist extends RowDataPacket {
  id_artist: number;
  name: string;
  avatar: string | null;
  biography: string | null;
  date_of_birth: Date | null;
  // Stats
  nb_albums?: number;
  nb_tracks?: number;
}

export interface Track extends RowDataPacket {
  id_track: number;
  title: string;
  duration: number | null; // <--- AJOUT DE | null
  // Joined fields
  album_title?: string;
  artist_name?: string;
  genres?: Genre[];
}

export interface Genre extends RowDataPacket {
  id_genre: number;
  title: string;
  description: string | null;
  // Stats
  nb_tracks?: number;
}

export interface User extends RowDataPacket {
  id_user: number;
  username: string;
  email: string;
  password: string;
}

// ==================== JWT ====================

export interface JWTPayload {
  id_user: number;
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
