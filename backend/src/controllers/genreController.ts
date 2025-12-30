import { Request, Response } from 'express';
import pool from '../config/database';
import { Genre } from '../types';

// GET /api/genres
export const getAllGenres = async (req: Request, res: Response): Promise<void> => {
  try {
    const [genres] = await pool.query<Genre[]>(`
      SELECT g.*, 
             COUNT(DISTINCT c.id_track) as nb_tracks
      FROM GENRES g
      LEFT JOIN CLASSIFIES c ON g.id_genre = c.id_genre
      GROUP BY g.id_genre
      ORDER BY g.title
    `);

    res.json({ success: true, data: genres });
  } catch (error) {
    console.error('Erreur getAllGenres:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération genres' });
  }
};

// GET /api/genres/:id
export const getGenreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [genres] = await pool.query<Genre[]>(`
      SELECT g.*, 
             COUNT(DISTINCT c.id_track) as nb_tracks
      FROM GENRES g
      LEFT JOIN CLASSIFIES c ON g.id_genre = c.id_genre
      WHERE g.id_genre = ?
      GROUP BY g.id_genre
    `, [id]);

    if (genres.length === 0) {
      res.status(404).json({ success: false, error: 'Genre non trouvé' });
      return;
    }

    res.json({ success: true, data: genres[0] });
  } catch (error) {
    console.error('Erreur getGenreById:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération genre' });
  }
};

// PUT /api/genres/:id
export const updateGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const [genres] = await pool.query<Genre[]>('SELECT * FROM GENRES WHERE id_genre = ?', [id]);
    if (genres.length === 0) {
      res.status(404).json({ success: false, error: 'Genre non trouvé' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE GENRES SET ${updates.join(', ')} WHERE id_genre = ?`, values);
    }

    res.json({ success: true, message: 'Genre mis à jour' });
  } catch (error) {
    console.error('Erreur updateGenre:', error);
    res.status(500).json({ success: false, error: 'Erreur mise à jour genre' });
  }
};
