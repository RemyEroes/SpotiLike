import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../types';

// GET /api/artists
export const getAllArtists = async (req: Request, res: Response): Promise<void> => {
  try {
    const artists = await prisma.artists.findMany({});
    
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
    
    const artist = await prisma.artists.findUnique({
      where: { id_artist: Number(id) },
    });
    
    if (!artist) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    
    res.json({ success: true, data: artist });
  } catch (error) {
    console.error('Erreur getArtistById:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération artiste' });
  }
};

// GET /api/artists/:id/songs
export const getArtistSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const artistId = Number(id);

    const artistExists = await prisma.artists.findUnique({ where: { id_artist: artistId } });
    if (!artistExists) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    // artist tracks 
    const tracks = await prisma.tracks.findMany({
      where: {
        artists: {
          some: { id_artist: artistId }, 
        },
      },
      include: {
        albums: {
          include: { album: true },
        },
        genres: {
          include: { genre: true }, 
        },
      },
    });

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
    
    const artistExists = await prisma.artists.findUnique({ where: { id_artist: Number(id) } });
    if (!artistExists) {
      res.status(404).json({ success: false, error: 'Artiste non trouvé' });
      return;
    }

    const albums = await prisma.albums.findMany({
      where: {
        artists: {
          some: { id_artist: Number(id) }
        }
      },
      orderBy: {
        release_date: 'desc'
      }
    });

    res.json({ success: true, data: albums });
  } catch (error) {
    console.error('Erreur getArtistAlbums:', error);
    res.status(500).json({ success: false, error: 'Erreur récupération albums artiste' });
  }
};

// PUT /api/artists/:id
export const updateArtist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, avatar, biography } = req.body;

    const artist = await prisma.artists.findUnique({
      where: { id_artist: Number(id) },
    });
    if (!artist) {
      res.status(404).json({ success: false, error: 'Artiste avec ' + id + ' non trouvé' });
      return;
    }
    
    const updatedArtist: any = {};
    if (name !== undefined) updatedArtist.name = name;
    if (avatar !== undefined) updatedArtist.avatar = avatar;
    if (biography !== undefined) updatedArtist.biography = biography;
    
    try {
      await prisma.artists.update({
        where: { id_artist: Number(id) },
        data: updatedArtist,
      });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de l\'artiste' });
      return;
    }
    
    res.json({ success: true, message: 'Artiste ' + id + ' mis à jour' });
  } catch (error) {
    console.error('Erreur updateArtist:', error);
    res.status(500).json({ success: false, error: 'Erreur mise à jour artiste' });
  }
};

// DELETE /api/artists/:id
export const deleteArtist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const artistId = Number(id);

    const artist = await prisma.artists.findUnique({ where: { id_artist: artistId } });
    if (!artist) {
        res.status(404).json({ success: false, error: 'Artiste non trouvé' });
        return;
    }

    
    await prisma.$transaction(async (tx: any) => {
        // albums a delete
        const albumsToDelete = await tx.creates.findMany({
            where: { id_artist: artistId },
            select: { id_album: true }
        });
        const albumIds = albumsToDelete.map((a: any) => a.id_album);

        if (albumIds.length > 0) {
            // tracks a delete
            const tracksToDelete = await tx.contains.findMany({
                where: { id_album: { in: albumIds } },
                select: { id_track: true }
            });
            const trackIds = tracksToDelete.map((t: any) => t.id_track);

            // suppresion tracks artiste
            if (trackIds.length > 0) {
                await tx.tracks.deleteMany({
                    where: { id_track: { in: trackIds } }
                });
            }

            // suppresion ablums artiste
            await tx.albums.deleteMany({
                where: { id_album: { in: albumIds } }
            });
        }

        // suppresion artiste
        await tx.artists.delete({
            where: { id_artist: artistId }
        });
    });
    
    res.json({ success: true, message: 'Artiste et ses oeuvres supprimés' });
  } catch (error) {
    console.error('Erreur deleteArtist:', error);
    res.status(500).json({ success: false, error: 'Erreur suppression artiste' });
  }
};
