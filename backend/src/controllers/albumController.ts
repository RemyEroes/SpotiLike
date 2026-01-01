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
export const createAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, cover_art, release_date, id_artist } = req.body;

    if (!title || !id_artist) {
      res.status(400).json({ success: false, error: 'Le titre et l\'id_artist sont requis' });
      return;
    }

    // Vérifier l'artiste
    const artist = await prisma.artists.findUnique({
      where: { id_artist: Number(id_artist) },
    });

    if (!artist) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    // Créer l'album ET le lien avec l'artiste (Creates) en une seule transaction
    const newAlbum = await prisma.albums.create({
      data: {
        title,
        cover_art: cover_art || null,
        release_date: release_date ? new Date(release_date) : new Date(),
        // Création de la relation dans la table CREATES
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

    const albumId = Number(id);

    // Vérifier l'album
    const album = await prisma.albums.findUnique({
      where: { id_album: albumId },
      include: {
        artists: true, // Pour récupérer l'artiste lié à l'album
      },
    });

    if (!album) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }

    // Récupérer l'ID de l'artiste (via la table Creates incluse ci-dessus)
    const artistId = album.artists[0]?.id_artist || null;

    // Préparer les données pour Prisma
    // On crée la Track, et en même temps on remplit Contains, Performs et Classifies
    const newTrack = await prisma.tracks.create({
      data: {
        title,
        duration: duration || 0,
        // 1. Lien avec l'Album (CONTAINS)
        albums: {
          create: {
            album: {
              connect: { id_album: albumId },
            },
          },
        },
        // 2. Lien avec l'Artiste (PERFORMS), seulement si on a trouvé un artiste
        artists: artistId ? {
          create: {
            is_main_artist: true,
            artist: {
              connect: { id_artist: artistId },
            },
          },
        } : undefined,
        // 3. Liens avec les Genres (CLASSIFIES)
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

    // On prépare l'objet de données dynamiquement
    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (cover_art !== undefined) dataToUpdate.cover_art = cover_art;
    if (release_date !== undefined) dataToUpdate.release_date = new Date(release_date);

    // Prisma lance une erreur si l'ID n'existe pas, donc on englobe dans try/catch
    try {
      await prisma.albums.update({
        where: { id_album: Number(id) },
        data: dataToUpdate,
      });
    } catch (e) {
      // Code erreur Prisma pour "Record not found"
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
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
    const albumId = Number(id);

    // Vérifier si l'album existe
    const album = await prisma.albums.findUnique({
      where: { id_album: albumId }
    });

    if (!album) {
      res.status(404).json({ success: false, error: 'Album non trouvé' });
      return;
    }

    // Logique de suppression complexe : Supprimer les tracks qui sont dans cet album
    // 1. Trouver les tracks de cet album
    const tracksToDelete = await prisma.contains.findMany({
      where: { id_album: albumId },
      select: { id_track: true }
    });

    const trackIds = tracksToDelete.map(t => t.id_track);

    // Utilisation d'une transaction pour s'assurer que tout est supprimé ou rien
    await prisma.$transaction(async (tx) => {
      // 2. Supprimer les Tracks (Cascade supprimera Performs, Classifies, Contains liés)
      if (trackIds.length > 0) {
        await tx.tracks.deleteMany({
          where: {
            id_track: { in: trackIds }
          }
        });
      }

      // 3. Supprimer l'album (Cascade supprimera Creates, Contains, Pictures liés)
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
