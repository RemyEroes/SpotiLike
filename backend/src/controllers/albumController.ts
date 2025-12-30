import { Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { Album, Track, AuthenticatedRequest } from '../types';

// GET /api/albums
export const getAllAlbums = async (req: Request, res: Response): Promise<void> => {
  try {
    // Jointure via CREATES pour avoir l'artiste
    const [albums] = await pool.query<Album[]>(`
      SELECT a.*, ar.name as artist_name, ar.id_artist
      FROM ALBUMS a
      LEFT JOIN CREATES c ON a.id_album = c.id_album
      LEFT JOIN ARTISTS ar ON c.id_artist = ar.id_artist
      ORDER BY a.release_date DESC
    `);
    
    res.json({ success: true, data: albums });
  } catch (error) {
    console.error('Erreur getAllAlbums:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération albums' });
  }
};

// GET /api/albums/:id
export const getAlbumById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [albums] = await pool.query<Album[]>(`
      SELECT a.*, ar.name as artist_name, ar.avatar as artist_avatar, ar.biography as artist_bio
      FROM ALBUMS a
      LEFT JOIN CREATES c ON a.id_album = c.id_album
      LEFT JOIN ARTISTS ar ON c.id_artist = ar.id_artist
      WHERE a.id_album = ?
    `, [id]);
    
    if (albums.length === 0) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }
    
    res.json({ success: true, data: albums[0] });
  } catch (error) {
    console.error('Erreur getAlbumById:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération album' });
  }
};

// GET /api/albums/:id/songs
export const getAlbumSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [albums] = await pool.query<Album[]>('SELECT id_album FROM ALBUMS WHERE id_album = ?', [id]);
    if (albums.length === 0) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }
    

    const [tracks] = await pool.query<Track[]>(`
      SELECT t.* FROM TRACKS t
      INNER JOIN CONTAINS co ON t.id_track = co.id_track
      WHERE co.id_album = ?
    `, [id]);

    // On utilise map pour créer un tableau de promesses
    await Promise.all(tracks.map(async (track) => {
      const [genres] = await pool.query<any[]>(`
        SELECT g.id_genre, g.title, g.description
        FROM GENRES g
        INNER JOIN CLASSIFIES cl ON g.id_genre = cl.id_genre
        WHERE cl.id_track = ?
      `, [track.id_track]);
      
      // On modifie l'objet track (par référence)
      track.genres = genres;
    }));

    
    res.json({ success: true, data: tracks });
  } catch (error) {
    console.error('Erreur getAlbumSongs:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération morceaux' });
  }
};

// POST /api/albums
export const createAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, cover_art, release_date, id_artist } = req.body;
    
    if (!title || !id_artist) {
      res.status(400).json({ success: false, error: 'Le titre et l\'id_artist sont requis' });
      return;
    }
    
    // Vérifier l'artiste
    const [artists] = await pool.query<any[]>('SELECT id_artist FROM ARTISTS WHERE id_artist = ?', [id_artist]);
    if (artists.length === 0) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }
    
    // 1. Créer l'album
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO ALBUMS (title, cover_art, release_date) VALUES (?, ?, ?)',
      [title, cover_art || null, release_date || new Date()]
    );
    
    const newAlbumId = result.insertId;

    // 2. Créer le lien Artiste-Album
    await pool.query(
      'INSERT INTO CREATES (id_artist, id_album) VALUES (?, ?)',
      [id_artist, newAlbumId]
    );
    
    res.status(201).json({
      success: true,
      data: {
        id_album: newAlbumId,
        title,
        cover_art,
        release_date,
        id_artist
      },
      message: 'Album créé avec succès'
    });
  } catch (error) {
    console.error('Erreur createAlbum:', error);
    res.status(500).json({ success: false, error: 'Erreur création album' });
  }
};

// POST /api/albums/:id/songs
export const addSongToAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // id_album
    const { title, duration, id_genres } = req.body;
    
    if (!title) {
      res.status(400).json({ success: false, error: 'Le titre est requis' });
      return;
    }
    
    // Vérifier l'album
    const [albums] = await pool.query<Album[]>('SELECT id_album FROM ALBUMS WHERE id_album = ?', [id]);
    if (albums.length === 0) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }

    // Récupérer l'artiste de l'album pour lier le morceau à l'artiste aussi (via PERFORMS)
    const [creators] = await pool.query<any[]>('SELECT id_artist FROM CREATES WHERE id_album = ? LIMIT 1', [id]);
    const artistId = creators.length > 0 ? creators[0].id_artist : null;
    
    // 1. Créer le morceau
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO TRACKS (title, duration) VALUES (?, ?)',
      [title, duration || 0]
    );
    
    const trackId = result.insertId;

    // 2. Lier à l'album (CONTAINS)
    await pool.query('INSERT INTO CONTAINS (id_album, id_track) VALUES (?, ?)', [id, trackId]);

    // 3. Lier à l'artiste (PERFORMS) si trouvé
    if (artistId) {
        await pool.query('INSERT INTO PERFORMS (id_artist, id_track, is_main_artist) VALUES (?, ?, 1)', [artistId, trackId]);
    }
    
    // 4. Lier aux genres (CLASSIFIES)
    if (id_genres && Array.isArray(id_genres) && id_genres.length > 0) {
      const genreValues = id_genres.map((gid: number) => [gid, trackId]);
      await pool.query(
        'INSERT INTO CLASSIFIES (id_genre, id_track) VALUES ?',
        [genreValues]
      );
    }
    
    res.status(201).json({
      success: true,
      data: {
        id_track: trackId,
        title,
        duration,
        id_album: parseInt(id),
        id_genres
      },
      message: 'Morceau ajouté avec succès'
    });
  } catch (error) {
    console.error('Erreur addSongToAlbum:', error);
    res.status(500).json({ success: false, error: 'Erreur ajout morceau' });
  }
};

// PUT /api/albums/:id
export const updateAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, cover_art, release_date } = req.body;
    
    const [albums] = await pool.query<Album[]>('SELECT * FROM ALBUMS WHERE id_album = ?', [id]);
    if (albums.length === 0) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (cover_art !== undefined) { updates.push('cover_art = ?'); values.push(cover_art); }
    if (release_date !== undefined) { updates.push('release_date = ?'); values.push(release_date); }
    
    if (updates.length > 0) {
        values.push(id);
        await pool.query(`UPDATE ALBUMS SET ${updates.join(', ')} WHERE id_album = ?`, values);
    }
    
    res.json({ success: true, message: 'Album mis à jour' });
  } catch (error) {
    console.error('Erreur updateAlbum:', error);
    res.status(500).json({ success: false, error: 'Erreur mise à jour album' });
  }
};

// DELETE /api/albums/:id
export const deleteAlbum = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Grâce au ON DELETE CASCADE défini dans la BDD SQL et Prisma, 
    // supprimer l'album supprimera automatiquement les entrées dans CREATES, CONTAINS, PICTURES.
    // Cependant, pour les TRACKS, si on veut supprimer les morceaux contenus uniquement dans cet album :
    
    // 1. Récupérer les IDs des tracks de cet album
    const [tracks] = await pool.query<any[]>('SELECT id_track FROM CONTAINS WHERE id_album = ?', [id]);
    
    if (tracks.length > 0) {
        const trackIds = tracks.map(t => t.id_track);
        // Supprimer les morceaux (le cascade gérera CLASSIFIES, PERFORMS, CONTAINS)
        await pool.query('DELETE FROM TRACKS WHERE id_track IN (?)', [trackIds]);
    }
    
    // 2. Supprimer l'album
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM ALBUMS WHERE id_album = ?', [id]);
    
    if (result.affectedRows === 0) {
        res.status(404).json({ success: false, error: 'Album non trouvé' });
        return;
    }
    
    res.json({ success: true, message: 'Album et ses morceaux supprimés' });
  } catch (error) {
    console.error('Erreur deleteAlbum:', error);
    res.status(500).json({ success: false, error: 'Erreur suppression album' });
  }
};
