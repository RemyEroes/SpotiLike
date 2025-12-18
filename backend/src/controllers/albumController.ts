import { Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { Album, Morceau, AuthenticatedRequest } from '../types';

// GET /api/albums - Liste tous les albums
export const getAllAlbums = async (req: Request, res: Response): Promise<void> => {
  try {
    const [albums] = await pool.query<Album[]>(`
      SELECT a.*, ar.nom as artiste_nom, ar.avatar as artiste_avatar
      FROM album a
      LEFT JOIN artiste ar ON a.artiste_id = ar.id
      ORDER BY a.date_sortie DESC
    `);
    
    res.json({
      success: true,
      data: albums
    });
  } catch (error) {
    console.error('Erreur getAllAlbums:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des albums'
    });
  }
};

// GET /api/albums/:id - Détails d'un album
export const getAlbumById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [albums] = await pool.query<Album[]>(`
      SELECT a.*, ar.nom as artiste_nom, ar.avatar as artiste_avatar, ar.biographie as artiste_bio
      FROM album a
      LEFT JOIN artiste ar ON a.artiste_id = ar.id
      WHERE a.id = ?
    `, [id]);
    
    if (albums.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
      return;
    }
    
    res.json({
      success: true,
      data: albums[0]
    });
  } catch (error) {
    console.error('Erreur getAlbumById:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'album'
    });
  }
};

// GET /api/albums/:id/songs - Morceaux d'un album
export const getAlbumSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'album existe
    const [albums] = await pool.query<Album[]>('SELECT id FROM album WHERE id = ?', [id]);
    if (albums.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
      return;
    }
    
    const [morceaux] = await pool.query<Morceau[]>(`
      SELECT m.*, 
             GROUP_CONCAT(g.titre SEPARATOR ', ') as genres
      FROM morceau m
      LEFT JOIN morceau_genre mg ON m.id = mg.morceau_id
      LEFT JOIN genre g ON mg.genre_id = g.id
      WHERE m.album_id = ?
      GROUP BY m.id
      ORDER BY m.id
    `, [id]);
    
    res.json({
      success: true,
      data: morceaux
    });
  } catch (error) {
    console.error('Erreur getAlbumSongs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des morceaux'
    });
  }
};

// POST /api/albums - Créer un album
export const createAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titre, pochette, date_sortie, artiste_id } = req.body;
    
    // Validation
    if (!titre || !artiste_id) {
      res.status(400).json({
        success: false,
        error: 'Le titre et l\'artiste_id sont requis'
      });
      return;
    }
    
    // Vérifier que l'artiste existe
    const [artistes] = await pool.query<any[]>('SELECT id FROM artiste WHERE id = ?', [artiste_id]);
    if (artistes.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Artiste non trouvé'
      });
      return;
    }
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO album (titre, pochette, date_sortie, artiste_id) VALUES (?, ?, ?, ?)',
      [titre, pochette || null, date_sortie || new Date(), artiste_id]
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        titre,
        pochette,
        date_sortie,
        artiste_id
      },
      message: 'Album créé avec succès'
    });
  } catch (error) {
    console.error('Erreur createAlbum:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'album'
    });
  }
};

// POST /api/albums/:id/songs - Ajouter un morceau à un album
export const addSongToAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { titre, duree, genre_ids } = req.body;
    
    // Validation
    if (!titre) {
      res.status(400).json({
        success: false,
        error: 'Le titre est requis'
      });
      return;
    }
    
    // Vérifier que l'album existe
    const [albums] = await pool.query<Album[]>('SELECT id FROM album WHERE id = ?', [id]);
    if (albums.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
      return;
    }
    
    // Créer le morceau
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO morceau (titre, duree, album_id) VALUES (?, ?, ?)',
      [titre, duree || 0, id]
    );
    
    const morceauId = result.insertId;
    
    // Associer les genres si fournis
    if (genre_ids && Array.isArray(genre_ids) && genre_ids.length > 0) {
      const genreValues = genre_ids.map((gid: number) => [morceauId, gid]);
      await pool.query(
        'INSERT INTO morceau_genre (morceau_id, genre_id) VALUES ?',
        [genreValues]
      );
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: morceauId,
        titre,
        duree,
        album_id: parseInt(id),
        genre_ids
      },
      message: 'Morceau ajouté avec succès'
    });
  } catch (error) {
    console.error('Erreur addSongToAlbum:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout du morceau'
    });
  }
};

// PUT /api/albums/:id - Modifier un album
export const updateAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { titre, pochette, date_sortie, artiste_id } = req.body;
    
    // Vérifier que l'album existe
    const [albums] = await pool.query<Album[]>('SELECT * FROM album WHERE id = ?', [id]);
    if (albums.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
      return;
    }
    
    // Construire la requête de mise à jour dynamique
    const updates: string[] = [];
    const values: any[] = [];
    
    if (titre !== undefined) { updates.push('titre = ?'); values.push(titre); }
    if (pochette !== undefined) { updates.push('pochette = ?'); values.push(pochette); }
    if (date_sortie !== undefined) { updates.push('date_sortie = ?'); values.push(date_sortie); }
    if (artiste_id !== undefined) { updates.push('artiste_id = ?'); values.push(artiste_id); }
    
    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Aucun champ à mettre à jour'
      });
      return;
    }
    
    values.push(id);
    await pool.query(`UPDATE album SET ${updates.join(', ')} WHERE id = ?`, values);
    
    res.json({
      success: true,
      message: 'Album mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur updateAlbum:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'album'
    });
  }
};

// DELETE /api/albums/:id - Supprimer un album (authentification requise)
export const deleteAlbum = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'album existe
    const [albums] = await pool.query<Album[]>('SELECT id FROM album WHERE id = ?', [id]);
    if (albums.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Album non trouvé'
      });
      return;
    }
    
    // Supprimer les associations genre des morceaux de l'album
    await pool.query(`
      DELETE mg FROM morceau_genre mg
      INNER JOIN morceau m ON mg.morceau_id = m.id
      WHERE m.album_id = ?
    `, [id]);
    
    // Supprimer les morceaux de l'album
    await pool.query('DELETE FROM morceau WHERE album_id = ?', [id]);
    
    // Supprimer l'album
    await pool.query('DELETE FROM album WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Album supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteAlbum:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'album'
    });
  }
};
