import { Request, Response } from 'express';
import pool from '../config/database';
import { Artiste, Morceau, AuthenticatedRequest } from '../types';

// GET /api/artists - Liste tous les artistes
export const getAllArtists = async (req: Request, res: Response): Promise<void> => {
  try {
    const [artistes] = await pool.query<Artiste[]>(`
      SELECT a.*, 
             COUNT(DISTINCT al.id) as nb_albums
      FROM artiste a
      LEFT JOIN album al ON a.id = al.artiste_id
      GROUP BY a.id
      ORDER BY a.nom
    `);
    
    res.json({
      success: true,
      data: artistes
    });
  } catch (error) {
    console.error('Erreur getAllArtists:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des artistes'
    });
  }
};

// GET /api/artists/:id - Détails d'un artiste
export const getArtistById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [artistes] = await pool.query<Artiste[]>(`
      SELECT a.*, 
             COUNT(DISTINCT al.id) as nb_albums,
             COUNT(DISTINCT m.id) as nb_morceaux
      FROM artiste a
      LEFT JOIN album al ON a.id = al.artiste_id
      LEFT JOIN morceau m ON al.id = m.album_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);
    
    if (artistes.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Artiste non trouvé'
      });
      return;
    }
    
    res.json({
      success: true,
      data: artistes[0]
    });
  } catch (error) {
    console.error('Erreur getArtistById:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'artiste'
    });
  }
};

// GET /api/artists/:id/songs - Tous les morceaux d'un artiste
export const getArtistSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'artiste existe
    const [artistes] = await pool.query<Artiste[]>('SELECT id FROM artiste WHERE id = ?', [id]);
    if (artistes.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Artiste non trouvé'
      });
      return;
    }
    
    const [morceaux] = await pool.query<Morceau[]>(`
      SELECT m.*, 
             al.titre as album_titre,
             al.pochette as album_pochette,
             GROUP_CONCAT(g.titre SEPARATOR ', ') as genres
      FROM morceau m
      INNER JOIN album al ON m.album_id = al.id
      LEFT JOIN morceau_genre mg ON m.id = mg.morceau_id
      LEFT JOIN genre g ON mg.genre_id = g.id
      WHERE al.artiste_id = ?
      GROUP BY m.id
      ORDER BY al.date_sortie DESC, m.id
    `, [id]);
    
    res.json({
      success: true,
      data: morceaux
    });
  } catch (error) {
    console.error('Erreur getArtistSongs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des morceaux'
    });
  }
};

// PUT /api/artists/:id - Modifier un artiste
export const updateArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, avatar, biographie } = req.body;
    
    // Vérifier que l'artiste existe
    const [artistes] = await pool.query<Artiste[]>('SELECT * FROM artiste WHERE id = ?', [id]);
    if (artistes.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Artiste non trouvé'
      });
      return;
    }
    
    // Construire la requête de mise à jour dynamique
    const updates: string[] = [];
    const values: any[] = [];
    
    if (nom !== undefined) { updates.push('nom = ?'); values.push(nom); }
    if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar); }
    if (biographie !== undefined) { updates.push('biographie = ?'); values.push(biographie); }
    
    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Aucun champ à mettre à jour'
      });
      return;
    }
    
    values.push(id);
    await pool.query(`UPDATE artiste SET ${updates.join(', ')} WHERE id = ?`, values);
    
    res.json({
      success: true,
      message: 'Artiste mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur updateArtist:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'artiste'
    });
  }
};

// DELETE /api/artists/:id - Supprimer un artiste (authentification requise)
// SUPPRESSION EN CASCADE: artiste -> albums -> morceaux -> morceau_genre
export const deleteArtist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'artiste existe
    const [artistes] = await pool.query<Artiste[]>('SELECT id FROM artiste WHERE id = ?', [id]);
    if (artistes.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Artiste non trouvé'
      });
      return;
    }
    
    // 1. Supprimer les associations genre des morceaux des albums de l'artiste
    await pool.query(`
      DELETE mg FROM morceau_genre mg
      INNER JOIN morceau m ON mg.morceau_id = m.id
      INNER JOIN album al ON m.album_id = al.id
      WHERE al.artiste_id = ?
    `, [id]);
    
    // 2. Supprimer les morceaux des albums de l'artiste
    await pool.query(`
      DELETE m FROM morceau m
      INNER JOIN album al ON m.album_id = al.id
      WHERE al.artiste_id = ?
    `, [id]);
    
    // 3. Supprimer les albums de l'artiste
    await pool.query('DELETE FROM album WHERE artiste_id = ?', [id]);
    
    // 4. Supprimer l'artiste
    await pool.query('DELETE FROM artiste WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Artiste et tous ses éléments associés supprimés avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteArtist:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'artiste'
    });
  }
};
