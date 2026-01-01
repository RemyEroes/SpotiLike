// import { Request, Response } from 'express';
// import pool from '../config/database';
// import { Artiste, Morceau, AuthenticatedRequest } from '../types';

// // GET /api/artists - Liste tous les artistes
// export const getAllArtists = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const [artistes] = await pool.query<Artiste[]>(`
//       SELECT a.*, 
//              COUNT(DISTINCT al.id) as nb_albums
//       FROM artiste a
//       LEFT JOIN album al ON a.id = al.artiste_id
//       GROUP BY a.id
//       ORDER BY a.nom
//     `);

//     res.json({
//       success: true,
//       data: artistes
//     });
//   } catch (error) {
//     console.error('Erreur getAllArtists:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la récupération des artistes'
//     });
//   }
// };

// // GET /api/artists/:id - Détails d'un artiste
// export const getArtistById = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;

//     const [artistes] = await pool.query<Artiste[]>(`
//       SELECT a.*, 
//              COUNT(DISTINCT al.id) as nb_albums,
//              COUNT(DISTINCT m.id) as nb_morceaux
//       FROM artiste a
//       LEFT JOIN album al ON a.id = al.artiste_id
//       LEFT JOIN morceau m ON al.id = m.album_id
//       WHERE a.id = ?
//       GROUP BY a.id
//     `, [id]);

//     if (artistes.length === 0) {
//       res.status(404).json({
//         success: false,
//         error: 'Artiste non trouvé'
//       });
//       return;
//     }

//     res.json({
//       success: true,
//       data: artistes[0]
//     });
//   } catch (error) {
//     console.error('Erreur getArtistById:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la récupération de l\'artiste'
//     });
//   }
// };

// // GET /api/artists/:id/songs - Tous les morceaux d'un artiste
// export const getArtistSongs = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;

//     // Vérifier que l'artiste existe
//     const [artistes] = await pool.query<Artiste[]>('SELECT id FROM artiste WHERE id = ?', [id]);
//     if (artistes.length === 0) {
//       res.status(404).json({
//         success: false,
//         error: 'Artiste non trouvé'
//       });
//       return;
//     }

//     const [morceaux] = await pool.query<Morceau[]>(`
//       SELECT m.*, 
//              al.titre as album_titre,
//              al.pochette as album_pochette,
//              GROUP_CONCAT(g.titre SEPARATOR ', ') as genres
//       FROM morceau m
//       INNER JOIN album al ON m.album_id = al.id
//       LEFT JOIN morceau_genre mg ON m.id = mg.morceau_id
//       LEFT JOIN genre g ON mg.genre_id = g.id
//       WHERE al.artiste_id = ?
//       GROUP BY m.id
//       ORDER BY al.date_sortie DESC, m.id
//     `, [id]);

//     res.json({
//       success: true,
//       data: morceaux
//     });
//   } catch (error) {
//     console.error('Erreur getArtistSongs:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la récupération des morceaux'
//     });
//   }
// };

// // PUT /api/artists/:id - Modifier un artiste
// export const updateArtist = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { nom, avatar, biographie } = req.body;

//     // Vérifier que l'artiste existe
//     const [artistes] = await pool.query<Artiste[]>('SELECT * FROM artiste WHERE id = ?', [id]);
//     if (artistes.length === 0) {
//       res.status(404).json({
//         success: false,
//         error: 'Artiste non trouvé'
//       });
//       return;
//     }

//     // Construire la requête de mise à jour dynamique
//     const updates: string[] = [];
//     const values: any[] = [];

//     if (nom !== undefined) { updates.push('nom = ?'); values.push(nom); }
//     if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar); }
//     if (biographie !== undefined) { updates.push('biographie = ?'); values.push(biographie); }

//     if (updates.length === 0) {
//       res.status(400).json({
//         success: false,
//         error: 'Aucun champ à mettre à jour'
//       });
//       return;
//     }

//     values.push(id);
//     await pool.query(`UPDATE artiste SET ${updates.join(', ')} WHERE id = ?`, values);

//     res.json({
//       success: true,
//       message: 'Artiste mis à jour avec succès'
//     });
//   } catch (error) {
//     console.error('Erreur updateArtist:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la mise à jour de l\'artiste'
//     });
//   }
// };

// // DELETE /api/artists/:id - Supprimer un artiste (authentification requise)
// // SUPPRESSION EN CASCADE: artiste -> albums -> morceaux -> morceau_genre
// export const deleteArtist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;

//     // Vérifier que l'artiste existe
//     const [artistes] = await pool.query<Artiste[]>('SELECT id FROM artiste WHERE id = ?', [id]);
//     if (artistes.length === 0) {
//       res.status(404).json({
//         success: false,
//         error: 'Artiste non trouvé'
//       });
//       return;
//     }

//     // 1. Supprimer les associations genre des morceaux des albums de l'artiste
//     await pool.query(`
//       DELETE mg FROM morceau_genre mg
//       INNER JOIN morceau m ON mg.morceau_id = m.id
//       INNER JOIN album al ON m.album_id = al.id
//       WHERE al.artiste_id = ?
//     `, [id]);

//     // 2. Supprimer les morceaux des albums de l'artiste
//     await pool.query(`
//       DELETE m FROM morceau m
//       INNER JOIN album al ON m.album_id = al.id
//       WHERE al.artiste_id = ?
//     `, [id]);

//     // 3. Supprimer les albums de l'artiste
//     await pool.query('DELETE FROM album WHERE artiste_id = ?', [id]);

//     // 4. Supprimer l'artiste
//     await pool.query('DELETE FROM artiste WHERE id = ?', [id]);

//     res.json({
//       success: true,
//       message: 'Artiste et tous ses éléments associés supprimés avec succès'
//     });
//   } catch (error) {
//     console.error('Erreur deleteArtist:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la suppression de l\'artiste'
//     });
//   }
// };

import { Request, Response } from 'express';
import pool from '../config/database';
import { Artist, Track, AuthenticatedRequest } from '../types';
import { ResultSetHeader } from 'mysql2';

// GET /api/artists
export const getAllArtists = async (req: Request, res: Response): Promise<void> => {
  try {
    const [artists] = await pool.query<Artist[]>(`
      SELECT a.*, 
             COUNT(DISTINCT c.id_album) as nb_albums
      FROM ARTISTS a
      LEFT JOIN CREATES c ON a.id_artist = c.id_artist
      GROUP BY a.id_artist
      ORDER BY a.name
    `);

    res.json({ success: true, data: artists });
  } catch (error) {
    console.error('Erreur getAllArtists:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération artistes' });
  }
};

// GET /api/artists/:id
export const getArtistById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [artists] = await pool.query<Artist[]>(`
      SELECT a.*
      FROM ARTISTS a
      WHERE a.id_artist = ?
    `, [id]);

    if (artists.length === 0) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    res.json({ success: true, data: artists[0] });
  } catch (error) {
    console.error('Erreur getArtistById:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération artiste' });
  }
};

// GET /api/artists/:id/songs
export const getArtistSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [artists] = await pool.query<Artist[]>('SELECT id_artist FROM ARTISTS WHERE id_artist = ?', [id]);
    if (artists.length === 0) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    // Jointures: Artist -> Performs -> Tracks -> Contains -> Album
    const [tracks] = await pool.query<Track[]>(`
      SELECT t.*, 
             al.title as album_title,
             al.cover_art as album_cover,
             GROUP_CONCAT(g.title SEPARATOR ', ') as genres
      FROM TRACKS t
      INNER JOIN PERFORMS p ON t.id_track = p.id_track
      LEFT JOIN CONTAINS co ON t.id_track = co.id_track
      LEFT JOIN ALBUMS al ON co.id_album = al.id_album
      LEFT JOIN CLASSIFIES cl ON t.id_track = cl.id_track
      LEFT JOIN GENRES g ON cl.id_genre = g.id_genre
      WHERE p.id_artist = ?
      GROUP BY t.id_track
      ORDER BY al.release_date DESC, t.id_track
    `, [id]);

    res.json({ success: true, data: tracks });
  } catch (error) {
    console.error('Erreur getArtistSongs:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération morceaux artiste' });
  }
};

// GET /api/artists/:id/albums
export const getArtistAlbums = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [artists] = await pool.query<Artist[]>('SELECT id_artist FROM ARTISTS WHERE id_artist = ?', [id]);
    if (artists.length === 0) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    const [tracks] = await pool.query<Track[]>(`
      SELECT a.*
      FROM ALBUMS AS a
      JOIN CREATES AS c ON c.id_album = a.id_album
      WHERE c.id_artist = ?
      ORDER BY a.release_date DESC
    `, [id]);

    res.json({ success: true, data: tracks });
  } catch (error) {
    console.error('Erreur getArtistAlbums:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération albums artiste' });
  }
};

// PUT /api/artists/:id
export const updateArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, avatar, biography } = req.body;

    const [artists] = await pool.query<Artist[]>('SELECT * FROM ARTISTS WHERE id_artist = ?', [id]);
    if (artists.length === 0) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar); }
    if (biography !== undefined) { updates.push('biography = ?'); values.push(biography); }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE ARTISTS SET ${updates.join(', ')} WHERE id_artist = ?`, values);
    }

    res.json({ success: true, message: 'Artiste mis à jour' });
  } catch (error) {
    console.error('Erreur updateArtist:', error);
    res.status(500).json({ success: false, error: 'Erreur mise à jour artiste' });
  }
};

// DELETE /api/artists/:id
export const deleteArtist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Le ON DELETE CASCADE en base de données gère la suppression des liens dans CREATES, PERFORMS, PICTURES.
    // Cependant, si on veut supprimer les albums créés par cet artiste :

    // 1. Récupérer les albums de l'artiste
    const [albums] = await pool.query<any[]>('SELECT id_album FROM CREATES WHERE id_artist = ?', [id]);

    if (albums.length > 0) {
      const albumIds = albums.map(a => a.id_album);

      // 2. Supprimer les morceaux de ces albums (optionnel, selon règle métier, ici on nettoie)
      // On récupère les tracks de ces albums
      const [tracks] = await pool.query<any[]>('SELECT id_track FROM CONTAINS WHERE id_album IN (?)', [albumIds]);
      if (tracks.length > 0) {
        const trackIds = tracks.map(t => t.id_track);
        await pool.query('DELETE FROM TRACKS WHERE id_track IN (?)', [trackIds]);
      }

      // 3. Supprimer les albums
      await pool.query('DELETE FROM ALBUMS WHERE id_album IN (?)', [albumIds]);
    }

    // 4. Supprimer l'artiste
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM ARTISTS WHERE id_artist = ?', [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    res.json({ success: true, message: 'Artiste et ses oeuvres supprimés' });
  } catch (error) {
    console.error('Erreur deleteArtist:', error);
    res.status(500).json({ success: false, error: 'Erreur suppression artiste' });
  }
};
