import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import '../style/AlbumDetail.scss';
import axios, { all } from "axios";
import React, { useState, useContext, useEffect, useMemo, use } from 'react';
import { PlayerContext } from '../context/PlayerContext';

const mediasSrc = [
    "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",
    "assets/medias/da-funk.png",
    "assets/medias/la-fuite-en-avant.png",
    "assets/medias/pulsar.png",
    "assets/medias/random-access-memories.png",
    "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",
    "assets/medias/da-funk.png",
    "assets/medias/la-fuite-en-avant.png",
    "assets/medias/pulsar.png",
    "assets/medias/random-access-memories.png",
    "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",
    "assets/medias/random-access-memories.png",
    "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",
    "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",

]; // 24 albums

const genresItems = [
    { src: "/assets/genres/rock.svg", name: "Rock" },
    { src: "/assets/genres/rock.svg", name: "Pop" },
    { src: "/assets/genres/rock.svg", name: "Jazz" },
    { src: "/assets/genres/rock.svg", name: "Classical" },
    { src: "/assets/genres/rock.svg", name: "Hip-Hop" },
    { src: "/assets/genres/rock.svg", name: "Electronic" },
    { src: "/assets/genres/rock.svg", name: "Reggae" },
    { src: "/assets/genres/rock.svg", name: "Blues" },
    { src: "/assets/genres/rock.svg", name: "Country" },
    { src: "/assets/genres/rock.svg", name: "Metal" },
    { src: "/assets/genres/rock.svg", name: "Funk" },
    { src: "/assets/genres/rock.svg", name: "Disco" },
];

type GenreItemCustom = {
    index: number;
    rotate: number;
};

type Genre = {
    id_genre: number;
    title: string;
    description: string | null;
}

type Track = {
    id: number,
    title: string,
    genres: Genre[],
    duration: number
}


interface Album {
    id_album: number;
    title: string;
    cover_art: string;
    artist_name: string;
    release_date?: string;
    artist_avatar: string;
    artist_bio: string;

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

    const initialCoverArt = location.state?.coverArt;

    useEffect(() => {
        const fetchData = async () => {

            if (!albumId) return;

            try {
                const resAlbum = await axios.get("http://localhost:3000/api/albums/" + albumId);
                const resTracks = await axios.get("http://localhost:3000/api/albums/" + albumId + "/songs");
                setAlbumData(resAlbum.data.data || null);
                setAlbumTracks(resTracks.data.data || null);
                setFilteredTracks(resTracks.data.data || null);
                console.log("Fetched album data:", resAlbum.data.data);
                console.log("Fetched album tracks:", resTracks.data.data);
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

    const allGenres = useMemo(() => {
        if (!albumTracks) return [];
        const genreMap = new Map<number, Genre>();
        albumTracks.forEach(track => {
            track.genres.forEach(genre => {
                genreMap.set(genre.id_genre, genre);
            });
        });
        return Array.from(genreMap.values());
    }, [albumTracks]);

    const finalCoverSrc = albumData?.cover_art ? `/assets/medias/${albumData.cover_art}` : initialCoverArt;

    const isOnTransition = localStorage.getItem("albumOnTransition") === "true";

    const randomRotations = useMemo(() => {
        return genresItems.map(() => Math.random() * 40 - 20);
    }, []);

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
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}>
                    {albumData?.artist_name || 'Unknown Artist'}
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
                        {allGenres.map((genre: Genre, index: number) => (
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
                        ))}
                    </div>
                </div>
                <section className='album-detail-right-scroll-section' >
                    <motion.h3
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                    >About this album</motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                    >
                        {albumData?.artist_bio || 'No description available for this album.'}
                    </motion.p>
                    <motion.h3
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                    >Tracks</motion.h3>
                    <div className='album-detail-tracks-container'>
                        {filteredTracks && filteredTracks.map((track, index) => (
                            <React.Fragment key={index}>
                                <motion.div
                                    className='album-detail-track-item'
                                    custom={index}
                                    variants={track_variants}
                                    initial="initial"
                                    animate="enter"
                                    onClick={() => changeTrack(track.title + ' - ' + albumData!.artist_name)}
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

                            </React.Fragment>
                        ))}
                    </div>
                </section>
            </div>
        </div >
    );
}

export default AlbumDetail;
