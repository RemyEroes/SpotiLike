import { Request, Response } from 'express';
import pool from '../config/database';
import { Genre } from '../types';

// GET /api/genres - Liste tous les genres
export const getAllGenres = async (req: Request, res: Response): Promise<void> => {
  try {
    const [genres] = await pool.query<Genre[]>(`
      SELECT g.*, 
             COUNT(DISTINCT mg.morceau_id) as nb_morceaux
      FROM genre g
      LEFT JOIN morceau_genre mg ON g.id = mg.genre_id
      GROUP BY g.id
      ORDER BY g.titre
    `);
    
    res.json({
      success: true,
      data: genres
    });
  } catch (error) {
    console.error('Erreur getAllGenres:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des genres'
    });
  }
};

// GET /api/genres/:id - Détails d'un genre
export const getGenreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [genres] = await pool.query<Genre[]>(`
      SELECT g.*, 
             COUNT(DISTINCT mg.morceau_id) as nb_morceaux
      FROM genre g
      LEFT JOIN morceau_genre mg ON g.id = mg.genre_id
      WHERE g.id = ?
      GROUP BY g.id
    `, [id]);
    
    if (genres.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Genre non trouvé'
      });
      return;
    }
    
    res.json({
      success: true,
      data: genres[0]
    });
  } catch (error) {
    console.error('Erreur getGenreById:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du genre'
    });
  }
};

// PUT /api/genres/:id - Modifier un genre
export const updateGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { titre, description } = req.body;
    
    // Vérifier que le genre existe
    const [genres] = await pool.query<Genre[]>('SELECT * FROM genre WHERE id = ?', [id]);
    if (genres.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Genre non trouvé'
      });
      return;
    }
    
    // Construire la requête de mise à jour dynamique
    const updates: string[] = [];
    const values: any[] = [];
    
    if (titre !== undefined) { updates.push('titre = ?'); values.push(titre); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    
    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Aucun champ à mettre à jour'
      });
      return;
    }
    
    values.push(id);
    await pool.query(`UPDATE genre SET ${updates.join(', ')} WHERE id = ?`, values);
    
    res.json({
      success: true,
      message: 'Genre mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur updateGenre:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du genre'
    });
  }
};
