import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../types';
import pool from '../config/database';
import { Genre } from '../types';

// GET /api/genres
export const getAllGenres = async (req: Request, res: Response): Promise<void> => {
  try {
    const genres = await prisma.genres.findMany({});

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

    const genre = await prisma.genres.findUnique({
      where: { id_genre: Number(id) },
    });

    if (!genre) {
      res.status(404).json({ success: false, error: 'Genre non trouvé' });
      return;
    }

    res.json({ success: true, data: genre });
  } catch (error) {
    console.error('Erreur getGenreById:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération genre' });
  }
};

// PUT /api/genres/:id
export const updateGenre = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title && !description) {
      res.status(400).json({ success: false, error: 'Au moins un champ (title ou description) doit être fourni pour la mise à jour' });
      return;
    }

    const genre = await prisma.genres.findUnique({
      where: { id_genre: Number(id) },
    });
    if (!genre) {
      res.status(404).json({ success: false, error: 'Genre avec ' + id + ' non trouvé' });
      return;
    }

    // Update genre
    await prisma.genres.update({
      where: { id_genre: Number(id) },
      data: {
        title: title ?? genre.title,
        description: description ?? genre.description,
      },
    });

    res.json({ success: true, message: 'Genre ' + id + ' mis à jour' });
  } catch (error) {
    console.error('Erreur updateGenre:', error);
    res.status(500).json({ success: false, error: 'Erreur mise à jour genre' });
  }
};
