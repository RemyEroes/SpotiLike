import { useParams, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import '../style/AlbumDetail.scss';
import React, { useMemo } from 'react';

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

];

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

const trackList: Track[] = [
    { id: 1, title: "Track One", feat: undefined, duration: "3:45" },
    { id: 2, title: "Track Two", feat: "artist, artist", duration: "4:20" },
    { id: 3, title: "Track Three", feat: "artist", duration: "5:10" },
    { id: 4, title: "Track Four", feat: "artist", duration: "3:45" },
    { id: 5, title: "Track Five", feat: "artist, artist", duration: "4:20" },
    { id: 6, title: "Track Six", feat: "artist", duration: "5:10" },
    { id: 7, title: "Track Seven", feat: undefined, duration: "3:45" },
    { id: 8, title: "Track Eight", feat: "artist, artist", duration: "4:20" },
    { id: 9, title: "Track Nine", feat: "artist", duration: "5:10" },
    { id: 10, title: "Track Ten", feat: undefined, duration: "3:45" },
    { id: 11, title: "Track Eleven", feat: "artist, artist", duration: "4:20" },
    { id: 12, title: "Track Twelve", feat: "artist", duration: "5:10" },
];

type GenreItemCustom = {
    index: number;
    rotate: number;
};

type Track = {
    id: number,
    title: string,
    feat: string | undefined,
    duration: string
}


function AlbumDetail() {
    const { albumId } = useParams();
    const navigate = useNavigate();

    const indexParsed = parseInt(albumId || "0", 10);
    const albumImg = mediasSrc[indexParsed % 24];

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
        })
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

    return (
        <div className='album-detail-container'>
            <div className='album-detail-left'>
                <div className='album-detail-title'>
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                    >Album Detail</motion.h2>
                    <motion.h4
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >12/12/2025</motion.h4>
                </div>

                <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}>
                    Artist Name
                </motion.h3>

                <motion.img
                    src={`/${albumImg}`}
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
                    {genresItems.map((genre, index: number) => {

                        return (
                            <motion.div
                                className='album-detail-genre-item'
                                key={index}
                                custom={{ index, rotate: randomRotations[index] }}
                                variants={album_genre_item_variants}
                                animate="enter"
                                initial="initial"
                                whileHover={{ scale: 0.9, rotate: (randomRotations[index]/2) }}
                            >
                                <img src={genre.src} alt={genre.name} />
                                <span>{genre.name}</span>
                            </motion.div>
                        )
                    })}
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
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </motion.p>
                    <motion.h3
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                    >Tracks</motion.h3>
                    <div className='album-detail-tracks-container'>
                        {trackList.map((track, index) => (
                            <React.Fragment key={index}>
                                <motion.div
                                    className='album-detail-track-item'
                                    custom={index}
                                    variants={track_variants}
                                    initial="initial"
                                    animate="enter"
                                >
                                    <span className='title'>{track.title}</span>
                                    {track.feat && <span>feat: {track.feat}</span>}
                                    <span>{track.duration}</span>
                                </motion.div>
                                {index < trackList.length - 1 && <motion.div
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
        </div>
    );
}

export default AlbumDetail;
