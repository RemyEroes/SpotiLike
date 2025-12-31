import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import '../style/ArtistDetail.scss';
import axios from "axios";
import React, { useState, useContext, useEffect } from 'react';
import { PlayerContext } from '../context/PlayerContext';


interface Album {
    id_album: number;
    title: string;
    cover_art: string;
    artist_name: string;
    release_date?: string;
    artist_avatar: string;
    artist_bio: string;
}

type Artist = {
    avatar: string
    biography: string
    date_of_birth: string
    id_artist: number,
    name: string
}


function ArtistDetail() {
    const { artistId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { setPosition } = useContext(PlayerContext);

    const [artistData, setArtistData] = useState<Artist | null>(null);

    const initialCoverArt = location.state?.avatar;
    const layoutIndex = location.state?.avatarIndexLayout;

    useEffect(() => {
        const fetchData = async () => {

            if (!artistId) return;

            try {
                const resAlbum = await axios.get("http://localhost:3000/api/artists/" + artistId);
                // const resTracks = await axios.get("http://localhost:3000/api/albums/" + albumId + "/songs");
                console.log("artist", resAlbum.data.data);
                setArtistData(resAlbum.data.data || null);
                // setAlbumTracks(resTracks.data.data || null);

            } catch (err) {
                console.error("Erreur lors du fetch backend:", err);
            }
        };
        fetchData();

    }, [artistId]);


    const finalCoverSrc = artistData?.avatar ? `/assets/medias/avatars/${artistData.avatar}` : initialCoverArt;

    const isOnTransition = localStorage.getItem("artistOnTransition") === "true";


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

    
    return (
        <div className='artist-detail-container'>
            <button className='back-button' onClick={() => {
                localStorage.setItem("artistToCenterOnBack", artistId!);
                navigate(-1)
            }}>BACK</button>
            <div className='artist-detail-left'>
                <div className='artist-detail-title'>
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                    >{artistData?.name}</motion.h2>
                    <motion.h4
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >{dateToReadable(artistData?.date_of_birth || '')}</motion.h4>
                </div>

                {/* <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}>
                    {albumData?.artist_name || 'Unknown Artist'}
                </motion.h3> */}

                <motion.img
                    src={finalCoverSrc}
                    alt="Artist cover"

                    layoutId={`artist-cover-${artistId}${layoutIndex ? `-${layoutIndex}` : ''}`} 
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
            {/* <div className='album-detail-right'>
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
            </div> */}
        </div >
    );
}

export default ArtistDetail;
