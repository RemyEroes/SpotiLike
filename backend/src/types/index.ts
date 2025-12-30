// import { Request } from 'express';
// import { RowDataPacket } from 'mysql2';

// // ==================== ENTITIES ====================

// export interface Album extends RowDataPacket {
//   id: number;
//   titre: string;
//   pochette: string;
//   date_sortie: Date;
//   artiste_id: number;
//   // Joined fields
//   artiste_nom?: string;
//   artiste_avatar?: string;
// }

// export interface Artiste extends RowDataPacket {
//   id: number;
//   nom: string;
//   avatar: string;
//   biographie: string;
// }

// export interface Morceau extends RowDataPacket {
//   id: number;
//   titre: string;
//   duree: number;
//   album_id: number;
//   // Joined fields
//   album_titre?: string;
//   artiste_nom?: string;
//   genres?: string;
// }

// export interface Genre extends RowDataPacket {
//   id: number;
//   titre: string;
//   description: string;
// }

// export interface Utilisateur extends RowDataPacket {
//   id: number;
//   nom_utilisateur: string;
//   email: string;
//   mot_de_passe: string;
// }

// // ==================== JWT ====================

// export interface JWTPayload {
//   userId: number;
//   email: string;
//   username: string;
// }

// export interface AuthenticatedRequest extends Request {
//   user?: JWTPayload;
// }

// // ==================== API RESPONSES ====================

// export interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   error?: string;
// }

import { Request } from 'express';
import { RowDataPacket } from 'mysql2';

// ==================== ENTITIES ====================

export interface Album extends RowDataPacket {
  id_album: number;
  title: string;
  release_date: Date;
  cover_art: string | null;
  // Joined fields
  artist_name?: string;
  artist_id?: number;
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
  duration: number;
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
