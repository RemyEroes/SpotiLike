import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../types';

// GET /api/albums
export const getAllAlbums = async (req: Request, res: Response): Promise<void> => {
  try {
    const albums = await prisma.albums.findMany({
      orderBy: {
        release_date: 'desc',
      },
      include: {
        artists: {
          include: {
            artist: true,
          },
        },
      },
    });

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

    const album = await prisma.albums.findUnique({
      where: { id_album: Number(id) },
      include: {
        artists: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!album) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }

    res.json({ success: true, data: album });
  } catch (error) {
    console.error('Erreur getAlbumById:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération album' });
  }
};

// GET /api/albums/:id/songs
export const getAlbumSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tracks = await prisma.tracks.findMany({
      where: {
        albums: {
          some: {
            id_album: Number(id),
          },
        },
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    res.json({ success: true, data: tracks });
  } catch (error) {
    console.error('Erreur getAlbumSongs:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération morceaux' });
  }
};

// POST /api/albums
export const createAlbum = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, cover_art, release_date, id_artist } = req.body;

    if (!title || !id_artist) {
      res.status(400).json({ success: false, error: 'Le titre et l\'id_artist sont requis' });
      return;
    }

    const artist = await prisma.artists.findUnique({
      where: { id_artist: Number(id_artist) },
    });
    if (!artist) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    // creer album et lier a l'artiste
    const newAlbum = await prisma.albums.create({
      data: {
        title,
        cover_art: cover_art || null,
        release_date: release_date ? new Date(release_date) : new Date(),
        artists: {
          create: {
            artist: {
              connect: { id_artist: Number(id_artist) },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...newAlbum,
        id_artist,
      },
      message: 'Album ' + newAlbum.id_album + ' créé avec succès'
    });
  } catch (error) {
    console.error('Erreur createAlbum:', error);
    res.status(500).json({ success: false, error: 'Erreur création album' });
  }
};

// POST /api/albums/:id/songs
export const addSongToAlbum = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // id de l'album
    const { title, duration, id_genres } = req.body;

    if (!title) {
      res.status(400).json({ success: false, error: 'Le titre est requis' });
      return;
    }

    const albumId = Number(id);

    // get album and its artist
    const album = await prisma.albums.findUnique({
      where: { id_album: albumId },
      include: {
        artists: true, 
      },
    });

    if (!album) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }

    const artistId = album.artists[0]?.id_artist || null;

    // creation track et relations
    const newTrack = await prisma.tracks.create({
      data: {
        title,
        duration: parseInt(duration) || 0,
        // lien album tracks (CONTAINS)
        albums: {
          create: {
            album: {
              connect: { id_album: albumId },
            },
          },
        },
        // lien artiste tracks (PERFORMS)
        artists: artistId ? {
          create: {
            is_main_artist: true,
            artist: {
              connect: { id_artist: artistId },
            },
          },
        } : undefined,
        // genre
        genres: (id_genres && Array.isArray(id_genres) && id_genres.length > 0) ? {
          create: id_genres.map((genreId: number) => ({
            genre: {
              connect: { id_genre: Number(genreId) },
            },
          })),
        } : undefined,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...newTrack,
        id_album: albumId,
        id_genres,
      },
      message: 'Morceau ' + newTrack.id_track + ' ajouté avec succès à l\'album ' + albumId,
    });
  } catch (error) {
    console.error('Erreur addSongToAlbum:', error);
    res.status(500).json({ success: false, error: 'Erreur ajout morceau' });
  }
};

// PUT /api/albums/:id
export const updateAlbum = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, cover_art, release_date } = req.body;

    const album = await prisma.albums.findUnique({
      where: { id_album: Number(id) },
    });
    if (!album) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }

    const updatedAlbum: any = {};
    if (title !== undefined) updatedAlbum.title = title;
    if (cover_art !== undefined) updatedAlbum.cover_art = cover_art;
    if (release_date !== undefined) updatedAlbum.release_date = new Date(release_date);


    try {
      await prisma.albums.update({
        where: { id_album: Number(id) },
        data: updatedAlbum,
      });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de l\'album' });
      return;
    }

    res.json({ success: true, message: 'Album ' + id + ' mis à jour' });
  } catch (error) {
    console.error('Erreur updateAlbum:', error);
    res.status(500).json({ success: false, error: 'Erreur mise à jour album' });
  }
};

// DELETE /api/albums/:id
export const deleteAlbum = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const albumId = Number(id);

    const album = await prisma.albums.findUnique({
      where: { id_album: albumId }
    });
    if (!album) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }

    const albumTracksToDelete = await prisma.contains.findMany({
      where: { id_album: albumId },
      select: { id_track: true }
    });
    const trackIds = albumTracksToDelete.map((t: any) => t.id_track);

    
    // suppression tracks et album dans une transaction (cascade)
    await prisma.$transaction(async (tx: any) => {
      if (trackIds.length > 0) {
        await tx.tracks.deleteMany({
          where: {
            id_track: { in: trackIds }
          }
        });
      }

      await tx.albums.delete({
        where: { id_album: albumId }
      });
    });


    res.json({ success: true, message: 'Album et ses morceaux supprimés' });
  } catch (error) {
    console.error('Erreur deleteAlbum:', error);
    res.status(500).json({ success: false, error: 'Erreur suppression album' });
  }
};
