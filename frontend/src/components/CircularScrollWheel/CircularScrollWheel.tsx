import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import "../../style/CircularScrollWheel.scss";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';

interface TransitionModel {
    src: string;
    index: number;
    rect: DOMRect;
    rotation: number;
}


interface Album {
    id_album: number;
    title: string;
    cover_art?: string;
    artist_name?: string;
    [key: number]: number | string | undefined;
}

interface Artist {
    id: number;
    artist_name: string;
    avatar?: string;
    [key: number]: number | string | undefined;
}

type DataType = Album | Artist;

function CircularScrollWheel({ type = "album" }: { type?: "album" | "artist" }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rotationRef = useRef(0);
    const [centerIndex, setCenterIndex] = useState<number>(0);
    const navigate = useNavigate();

    const [transitionModel, setTransitionModel] = useState<TransitionModel & { id: number } | null>(null);
    const [showTitle, setShowTitle] = useState(true);
    const [titleInfo, setTitleInfo] = useState<{ title: string; artist: string }>({ title: '', artist: '' });
    const [items, setItems] = useState<DataType[]>([]);

    useEffect(() => {
        if (!type) return;
        const fetchData = async () => {
            try {
                let url = "";
                if (type === "album") {
                    url = "http://localhost:3000/api/albums";
                } else if (type === "artist") {
                    url = "http://localhost:3000/api/artists";
                }
                const res = await axios.get(url);

                // randomize items and take 24
                const randomizedItems = res.data.data.sort(() => 0.5 - Math.random()).slice(0, 24);

                if (localStorage.getItem("albumToCenterOnBack")) {
                    const albumIdToCenter = parseInt(localStorage.getItem("albumToCenterOnBack") || "0", 10);
                    const indexToCenter = randomizedItems.findIndex((item: Album) => item.id_album === albumIdToCenter);
                    // mettre en premier l'album à centrer
                    if (indexToCenter !== -1) {
                        const itemToCenter = randomizedItems.splice(indexToCenter, 1)[0];
                        randomizedItems.unshift(itemToCenter);
                    }
                }
                localStorage.removeItem("albumToCenterOnBack");
                setItems(randomizedItems || []);

            } catch (err) {
                console.error("Erreur lors du fetch backend:", err);
            }
        };
        fetchData();
    }, [type]);




    useEffect(() => {
        // attende que les items soient chargés
        if (items.length === 0) return;

        if (!containerRef.current) return;
        const container = containerRef.current;
        const medias = Array.from(container.querySelectorAll<HTMLElement>(".inner-media"));
        const total = medias.length;
        const anglePerItem = 360 / total;
        let snapTimeout: ReturnType<typeof setTimeout>;

        // Setup initial rotation
        medias.forEach((el, index) => {
            el.dataset.angle = String(anglePerItem * index);
            gsap.set(el, { rotation: anglePerItem * index });
        });

        const rotTo = gsap.quickTo(container, "rotation", {
            duration: 0.5,
            ease: "power3.out"
        });

        const updateState = () => {
            const currentRot = rotationRef.current;
            const rawIndex = Math.round(-currentRot / anglePerItem);
            const normalizedIndex = ((rawIndex % total) + total) % total;

            setCenterIndex((prev) => (prev !== normalizedIndex ? normalizedIndex : prev));

            const itemData = items[normalizedIndex];
            if (type === "album") {
                const album = itemData as Album;
                setTitleInfo({ title: album.title, artist: album.artist_name || 'Unknown Artist' });
            }

            medias.forEach((el) => {
                const baseAngle = parseFloat(el.dataset.angle || "0");
                let angleDiff = Math.abs((baseAngle + currentRot) % 360);
                if (angleDiff > 180) angleDiff = 360 - angleDiff;
                const zIndex = Math.round(1000 - angleDiff);
                el.style.zIndex = String(zIndex);
            });
        };

        const snapToClosest = () => {
            const currentRot = rotationRef.current;
            const snapRot = Math.round(currentRot / anglePerItem) * anglePerItem;

            gsap.to(container, {
                rotation: snapRot,
                duration: 0.5,
                ease: "power3.out",
                onUpdate: () => {
                    rotationRef.current = gsap.getProperty(container, "rotation") as number;
                    updateState();
                },
                onComplete: () => {
                    rotationRef.current = snapRot;
                    updateState();
                    setShowTitle(true);
                }
            });
        };

        const onWheel = (e: WheelEvent) => {
            // Si on est en train de transitionner, on bloque le scroll
            if (transitionModel) return;

            setShowTitle(false);

            rotationRef.current -= e.deltaY / 20;
            rotTo(rotationRef.current);
            updateState();

            if (snapTimeout) clearTimeout(snapTimeout);
            snapTimeout = setTimeout(snapToClosest, 150);
        };


        window.addEventListener("wheel", onWheel, { passive: true });
        updateState();

        return () => {
            window.removeEventListener("wheel", onWheel);
            if (snapTimeout) clearTimeout(snapTimeout);
            gsap.killTweensOf(container);
        };
    }, [transitionModel, items]);


    // --- GESTION DU CLIC ---
    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, id: number, index: number, imgSrc: string) => {
        console.log('Image clicked:', { id, index, imgSrc });
        if (transitionModel) return;

        setShowTitle(false);

        // 1. On fige GSAP
        if (containerRef.current) gsap.killTweensOf(containerRef.current);

        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();

        // 2. Calcul de la rotation visuelle actuelle
        // La rotation totale = rotation du conteneur + rotation de l'élément (inner-media)
        // Note: C'est une approximation, mais suffisante pour que Framer prenne le relais
        const anglePerItem = 360 / items.length;
        const itemBaseAngle = anglePerItem * index;
        const containerRotation = gsap.getProperty(containerRef.current, "rotation") as number;
        const currentVisualRotation = containerRotation + itemBaseAngle;

        setTransitionModel({
            src: '/' + imgSrc, // chemin relatif pour React
            index: index,
            id: id,
            rect: rect,
            rotation: currentVisualRotation
        });

        localStorage.setItem("albumOnTransition", "true");

        // 3. Navigation
        // On navigue quasi instantanément. Grâce à AnimatePresence, 
        // ce composant restera monté le temps que l'autre arrive.
        setTimeout(() => {
            // CORRECTION ICI : On passe l'image dans le state
            navigate(`/albums/${id}`, {
                state: {
                    coverArt: '/' + imgSrc, // On passe le chemin complet utilisé par le modèle de transition
                    prevId: id
                }
            });
        }, 100);
    };

    return (
        <section className="circular-scroll-wheel">
            <AnimatePresence>
                {showTitle && (
                    <>
                        <div className="album-title-container">
                            <div className="album-title">
                                <motion.h2
                                    data-text={titleInfo.title.length > 20
                                        ? titleInfo.title.slice(0, 20) + "..."
                                        : titleInfo.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                                    transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
                                >
                                    {titleInfo.title.length > 20
                                        ? titleInfo.title.slice(0, 20) + "..."
                                        : titleInfo.title}
                                </motion.h2>

                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                                    transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}>
                                    {titleInfo.artist}
                                </motion.h3>
                            </div>
                        </div>
                        <motion.img
                            src="assets/icons/selector.svg"
                            alt=""
                            className="selector-indicator"
                            initial={{ opacity: 0, y: 10, x: '-50%' }}
                            animate={{ opacity: 0.2, y: '16%', x: '-50%' }}
                            exit={{ opacity: 0, y: 10, x: '-50%', transition: { duration: 0.2 } }}
                            transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
                        />
                    </>
                )}
            </AnimatePresence>
            {/* IMPORTANT: 
               On ajoute un exit opacity: 0 au conteneur GLOBAL de la roue 
               pour que tout disparaisse sauf l'image layoutId lors de la navigation 
            */}
            <motion.div
                className="container"
                ref={containerRef}
                exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.4 } }}
            >
                {items.map((item: Album | Artist, index, arr) => {
                    let albumItem: Album | undefined;
                    let artistItem: Artist | undefined;

                    if (type === "album") {
                        // On force le type ici
                        albumItem = item as Album;
                    }
                    else if (type === "artist") {
                        artistItem = item as Artist;
                    }

                    const length = arr.length;
                    let isTransitioning;
                    if (type === "album") {
                        isTransitioning = transitionModel?.id === albumItem?.id_album;
                    } else if (type === "artist") {
                        isTransitioning = transitionModel?.id === artistItem?.id;
                    }

                    let delayAnimate = 0;
                    let delayExit = 0;

                    switch (true) {
                        case index === 0:
                            delayAnimate = 0.1;
                            break;
                        case index === 1:
                            delayAnimate = 0.2;
                            delayExit = 0.3;
                            break;
                        case index === 2:
                            delayAnimate = 0.3;
                            delayExit = 0.2;
                            break;
                        case index === 3:
                            delayAnimate = 0.4;
                            delayExit = 0.1;
                            break;
                        case index === length - 1:
                            delayAnimate = 0.2;
                            delayExit = 0.4;
                            break;
                        case index === length - 2:
                            delayAnimate = 0.3;
                            delayExit = 0.3;
                            break;
                        case index === length - 3:
                            delayAnimate = 0.4;
                            delayExit = 0.2;
                            break;
                    }


                    let imgSrc = "";
                    if (type === "album") {
                        imgSrc = `assets/medias/${albumItem?.cover_art}`;
                    } else if (type === "artist") {
                        imgSrc = artistItem?.avatar || "assets/medias/default-artist.png";
                    }

                    return (
                        <div className="group" key={albumItem?.id_album} >
                            <div className="inner-media">
                                <motion.img
                                    className={`media ${centerIndex === index ? 'active' : ''}`}
                                    src={imgSrc}
                                    alt={type === "album" ? (albumItem as Album).title : (artistItem as Artist).artist_name}
                                    onClick={(e) => handleImageClick(e, albumItem!.id_album, index, imgSrc)}
                                    style={{
                                        opacity: isTransitioning ? 0 : 1,
                                        transition: 'opacity 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96], delay: delayAnimate } }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3, delay: delayExit } }}
                                />
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* IMAGE FANTÔME (SHARED ELEMENT) */}
            {
                transitionModel && (
                    <motion.img
                        src={transitionModel.src}
                        // Le layoutId magique
                        layoutId={`album-cover-${transitionModel.id}`}

                        className="media active"

                        initial={{
                            position: 'fixed',
                            top: `calc(${transitionModel.rect.top}px + 6vw)`, // Ajustement pour centrer
                            left: transitionModel.rect.left,
                            width: '20vw',
                            height: '20vw', //carree
                            transform: 'rotate(0deg)',
                            zIndex: 9999,
                        }}

                        style={{
                            // On écrase le margin du CSS .media pour éviter le décalage vers le bas
                            margin: 0,
                            transformOrigin: 'center center'
                        }}

                        transition={{
                            duration: 0.6,
                            ease: [0.43, 0.13, 0.23, 0.96]
                        }}
                    />
                )
            }
        </section >
    );
}

export default CircularScrollWheel;
