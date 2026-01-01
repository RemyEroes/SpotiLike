import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import '../style/ArtistDetail.scss';
import axios from "axios";
import React, { useState, useContext, useEffect } from 'react';
import { PlayerContext } from '../context/PlayerContext';


interface Album {
    cover_art: string
    id_album: number
    release_date: string
    title: string
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
    const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
    const [albumsHasScrolled, setAlbumsHasScrolled] = useState(false);


    const initialCoverArt = location.state?.avatar;
    const layoutIndex = location.state?.avatarIndexLayout;

    useEffect(() => {
        const fetchData = async () => {

            if (!artistId) return;

            try {
                const resArtist = await axios.get("http://localhost:3000/api/artists/" + artistId);
                const resArtistAlbums = await axios.get("http://localhost:3000/api/artists/" + artistId + "/albums");
                setArtistAlbums(resArtistAlbums.data.data || []);
                setArtistData(resArtist.data.data || null);

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

    const album_item_variants: Variants = {
        initial: { opacity: 0, x: 50 },
        enter: (custom: { index: number }) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: custom.index * 0.1 + 0.5,
                duration: 0.4,
                ease: [0.76, 0, 0.24, 1]
            }
        })
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollPosition = e.currentTarget.scrollLeft;
        // Si on dépasse 5px, on passe à true, sinon false
        if (scrollPosition > 5 && !albumsHasScrolled) {
            setAlbumsHasScrolled(true);
        } else if (scrollPosition <= 5 && albumsHasScrolled) {
            setAlbumsHasScrolled(false);
        }
    };

    const openAlbum = (album: Album) => {
    localStorage.setItem("albumOnTransition", "true");

    navigate(`/albums/${album.id_album}`, {
        state: {
            coverArt: `/assets/medias/${album.cover_art}`,
            prevId: album.id_album
        }
    });
}


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
            <div className='artist-detail-right'>
                <section className='artist-detail-right-scroll-section' >
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
                        {artistData?.biography || 'No description available for this album.'}
                    </motion.p>
                    <motion.h3
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                    >Albums</motion.h3>
                    <div
                        className={`artist-album-container ${albumsHasScrolled ? 'is-scrolled' : ''}`}
                        onScroll={handleScroll}
                    >

                        {artistAlbums.map((album: Album, index: number) => (
                            <motion.div
                                className='artist-album-item'
                                key={album.id_album}
                                custom={{ index }}
                                variants={album_item_variants}
                                animate="enter"
                                initial="initial"
                                whileHover={{ scale: 0.99 }}
                                onClick={() => openAlbum(album)}
                            >
                                <motion.img
                                    layoutId={`album-cover-${album.id_album}`}
                                    layout
                                    src={`/assets/medias/${album.cover_art}`}
                                    alt={album.title}
                                />
                                <span>{album.title}</span>
                            </motion.div>
                        ))}
                        {artistAlbums.length === 0 && (
                            <motion.p
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.8 }}
                            >
                                This artist has no albums.
                            </motion.p>
                        )}
                    </div>
                </section>
            </div>
        </div >
    );
}

export default ArtistDetail;
