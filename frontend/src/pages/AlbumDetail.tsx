import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import '../style/AlbumDetail.scss';
import axios from "axios";
import { useState, useContext, useEffect, useMemo, Fragment } from 'react';
import { PlayerContext } from '../context/PlayerContext';


type Genre = {
    id_genre: number;
    title: string;
    description: string | null;
}

interface GenreItem {
    id_genre: number;
    id_track: number;
    genre: Genre;
}

// for framer-motion custom props
type GenreItemCustom = {
    index: number;
    rotate: number;
};

type Track = {
    id: number,
    title: string,
    genres: GenreItem[],
    duration: number
}

interface Album {
    artist: Artist | undefined;
    artists: ArtistItem[];
    cover_art: string;
    id_album: number;
    release_date: "2022-06-24T00:00:00.000Z";
    title: string;
}

interface Artist {
    id_artist: number;
    name: string;
    date_of_birth?: string;
    avatar?: string;
    biography?: string;
}

interface ArtistItem {
    artist: Artist;
    id_album: number;
    id_artist: number;
}


function AlbumDetail() {
    const { albumId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { setPosition } = useContext(PlayerContext);

    const [albumData, setAlbumData] = useState<Album | null>(null);
    const [albumTracks, setAlbumTracks] = useState<Track[] | null>(null);

    const [filteredTracks, setFilteredTracks] = useState<Track[] | null>(null);
    const [genreFilter, setGenreFilter] = useState<Genre[] | null>(null);
    const [genres, setGenres] = useState<Genre[] | null>(null);

    const initialCoverArt = location.state?.coverArt;

    useEffect(() => {
        const fetchData = async () => {

            if (!albumId) return;

            try {
                const resAlbum = await axios.get("http://localhost:3000/api/albums/" + albumId);
                const resTracks = await axios.get("http://localhost:3000/api/albums/" + albumId + "/songs");

                // format data
                const album: Album = resAlbum.data.data;
                album.artist = album.artists[0]?.artist;   

                setAlbumData(album || null);
                setAlbumTracks(resTracks.data.data || null);
                setFilteredTracks(resTracks.data.data || null);
            } catch (err) {
                console.error("Erreur lors du fetch backend:", err);
            }
        };
        fetchData();

    }, [albumId]);

    useEffect(() => {

        if (!genreFilter || genreFilter.length === 0) {
            setFilteredTracks(albumTracks);
            return;
        }

        setFilteredTracks(null);

        const filtered = albumTracks?.filter(track =>
            track.genres.some(genre =>
                genreFilter.some(filterGenre => filterGenre.id_genre === genre.id_genre)
            )
        ) || null;

        setFilteredTracks(filtered);

    }, [genreFilter, albumTracks]);

    const toggleGenreFilter = (genre: Genre) => {
        if (!genreFilter) {
            setGenreFilter([genre]);
            return;
        }

        const exists = genreFilter.find(g => g.id_genre === genre.id_genre);
        if (exists) {
            const newFilter = genreFilter.filter(g => g.id_genre !== genre.id_genre);
            setGenreFilter(newFilter.length > 0 ? newFilter : null);
        } else {
            setGenreFilter([...genreFilter, genre]);
        }
    };

    // extract of genres from tracks
    useMemo(() => {
        if (!albumTracks) return [];
        const genreMap = new Map<number, Genre>();
        albumTracks.forEach(track => {
            track.genres.forEach((item: GenreItem) => {
                if (item.genre) {
                    genreMap.set(item.id_genre, item.genre);
                }
            });
        });

        setGenres(Array.from(genreMap.values()));
    }, [albumTracks]);

    const finalCoverSrc = albumData?.cover_art ? `/assets/medias/${albumData.cover_art}` : initialCoverArt;

    const isOnTransition = localStorage.getItem("albumOnTransition") === "true";

    const randomRotations = useMemo(() => {
        if (!genres) return [];
        return genres.map(() => Math.random() * 40 - 20);
    }, [genres]);

    const album_genre_item_variants: Variants = {
        initial: ({ rotate }: GenreItemCustom) => ({
            opacity: 0,
            rotateZ: rotate,
            y: 10,
        }),

        enter: ({ index }: GenreItemCustom) => ({
            opacity: 1,
            y: 0,
            rotateZ: 0,
            transition: {
                duration: 0.5,
                delay: 0.5 + (index * 0.05),
                ease: [0.215, 0.61, 0.335, 1]
            }
        }),
    }

    const track_variants: Variants = {
        initial: {
            opacity: 0,
            y: 10,
            scale: 1.1
        },
        enter: (index: number) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.3,
                delay: 1 + (index * 0.05),
                ease: [0.215, 0.61, 0.335, 1]
            }
        })
    }

    const track_separator_variants: Variants = {
        initial: {
            opacity: 0,
            scaleX: 0
        },
        enter: (index: number) => ({
            opacity: 1,
            scaleX: 1,
            transition: {
                duration: 0.3,
                delay: 1 + (index * 0.05) + 0.05,
                ease: [0.215, 0.61, 0.335, 1]
            }
        })
    }

    const secondsToMinutes = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    const dateToReadable = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    useEffect(() => {
        setPosition('left');
    }, []);

    const { setCurrentTrack, setIsPlaying } = useContext(PlayerContext);

    const changeTrack = (trackTitle: string) => {
        localStorage.setItem('player-currentTrack', trackTitle);
        localStorage.setItem('player-isPlaying', 'true');

        setCurrentTrack('');
        setIsPlaying(true);

        setTimeout(() => {
            setCurrentTrack(trackTitle);
            setIsPlaying(true);
        }, 200);
    }

    return (
        <div className='album-detail-container'>
            <button className='back-button' onClick={() => {
                localStorage.setItem("albumToCenterOnBack", albumId!);
                navigate(-1)
            }}>BACK</button>
            <div className='album-detail-left'>
                <div className='album-detail-title'>
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                    >{albumData?.title}</motion.h2>
                    <motion.h4
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >{dateToReadable(albumData?.release_date || '')}</motion.h4>
                </div>

                <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}
                    onClick={() => { navigate('/artists/' + albumData?.artist?.id_artist) }}
                    data-text={albumData?.artist?.name || 'Unknown Artist'}
                >
                    {albumData?.artist?.name || 'Unknown Artist'}
                </motion.h3>

                <motion.img
                    src={finalCoverSrc}
                    alt="Album cover"

                    layoutId={`album-cover-${albumId}`}
                    layout

                    initial={!isOnTransition ? { scale: 0.8, opacity: 1, skewY: -5, skewX: 10 } : false}
                    animate={!isOnTransition ? { scale: 1, opacity: 1, skewY: 0, skewX: 0 } : false}

                    transition={{
                        duration: 0.6,
                        ease: [1, 0, 0.222, 0.995]
                    }}
                />
                <motion.span
                    className='album-detail-copyright'

                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
                >© 2025 SpotiLike. All rights reserved.</motion.span>
            </div>
            <div className='album-detail-right'>
                <div className='album-detail-genres-container'>
                    <div className='album-detail-genres-container'>
                        {genres && genres.map((genre: Genre, index: number) => {
                            return (
                                <motion.div
                                    className='album-detail-genre-item'
                                    key={genre.id_genre}
                                    style={{
                                        backgroundColor: genreFilter && genreFilter.length > 0 && genreFilter.find(g => g.id_genre === genre.id_genre) ? '#1ed75fc3' : 'rgb(81, 81, 81)'
                                    }}
                                    custom={{ index, rotate: randomRotations[index] }}
                                    variants={album_genre_item_variants}
                                    animate="enter"
                                    initial="initial"
                                    whileHover={{ scale: 0.9, rotate: (randomRotations[index] / 2) }}
                                    onClick={() => toggleGenreFilter(genre)}
                                >
                                    <img src={`/assets/genres/rock.svg`} alt={genre.title} />
                                    <span>{genre.title}</span>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
                <section className='album-detail-right-scroll-section' >
                    <motion.h3
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                    >About this artist</motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                    >
                        {albumData?.artists[0]?.artist.biography || 'No description available for this album.'}
                    </motion.p>
                    <motion.h3
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                    >Tracks</motion.h3>
                    <div className='album-detail-tracks-container'>
                        {filteredTracks && filteredTracks.map((track, index) => (
                            <Fragment key={index}>
                                <motion.div
                                    className='album-detail-track-item'
                                    custom={index}
                                    variants={track_variants}
                                    initial="initial"
                                    animate="enter"
                                    onClick={() => changeTrack(track.title + ' - ' + albumData!.artist?.name)}
                                >
                                    <span className='title'>{track.title}</span>
                                    {<span>spining logo</span>}
                                    <span>{secondsToMinutes(track.duration)}</span>
                                </motion.div>
                                {index < filteredTracks.length - 1 && <motion.div
                                    className='track-separator'
                                    custom={index}
                                    variants={track_separator_variants}
                                    initial="initial"
                                    animate="enter"
                                />}

                            </Fragment>
                        ))}
                    </div>
                </section>
            </div>
        </div >
    );
}

export default AlbumDetail;
