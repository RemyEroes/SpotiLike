import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "../../style/CircularScrollWheel.scss";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';

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

interface TransitionModel {
    src: string;
    index: number;
    rect: DOMRect;
    rotation: number;
}

function CircularScrollWheel() {
    const containerRef = useRef<HTMLDivElement>(null);
    const rotationRef = useRef(0);
    const [centerIndex, setCenterIndex] = useState<number>(0);
    const navigate = useNavigate();

    const [transitionModel, setTransitionModel] = useState<TransitionModel | null>(null);

    const [showTitle, setShowTitle] = useState(true);


    useEffect(() => {
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

            setShowTitle(true);

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
    }, [transitionModel]);


    // --- GESTION DU CLIC ---
    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, globalIndex: number) => {
        if (transitionModel) return;

        setShowTitle(false);

        // 1. On fige GSAP
        if (containerRef.current) gsap.killTweensOf(containerRef.current);

        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();

        // 2. Calcul de la rotation visuelle actuelle
        // La rotation totale = rotation du conteneur + rotation de l'élément (inner-media)
        // Note: C'est une approximation, mais suffisante pour que Framer prenne le relais
        const anglePerItem = 360 / mediasSrc.length;
        const itemBaseAngle = anglePerItem * globalIndex;
        const containerRotation = gsap.getProperty(containerRef.current, "rotation") as number;
        const currentVisualRotation = containerRotation + itemBaseAngle;

        setTransitionModel({
            src: mediasSrc[globalIndex],
            index: globalIndex,
            rect: rect,
            rotation: currentVisualRotation
        });
        console.log('Transition model set:', {
            src: mediasSrc[globalIndex],
            index: globalIndex,
            rect: rect,
            rotation: currentVisualRotation
        });

        // gerer animation page detail ici
        localStorage.setItem("albumOnTransition", "true");

        // 3. Navigation
        // On navigue quasi instantanément. Grâce à AnimatePresence, 
        // ce composant restera monté le temps que l'autre arrive.
        setTimeout(() => {
            // Assure-toi que c'est le même ID que dans AlbumDetail (modulo length)
            const sourceIndex = globalIndex % mediasSrc.length; // ou globalIndex si tu gères l'id unique
            navigate(`/albums/${sourceIndex}`);
        }, 50);
    };

    return (
        <section className="circular-scroll-wheel">
            <AnimatePresence>
                {showTitle && (
                    <>
                        <div className="album-title-container">
                            <div className="album-title">
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                                    transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
                                >Album Detail</motion.h2>

                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                                    transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}>
                                    Artist Name
                                </motion.h3>
                            </div>
                        </div>
                        <motion.img
                            src="assets/icons/selector.svg"
                            alt=""
                            className="selector-indicator"
                            initial={{ opacity: 0, y: 10, x: '-50%' }}
                            animate={{ opacity: 0.2, y: '13%', x: '-50%' }}
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
                {mediasSrc.map((src, index, arr) => {
                    const length = arr.length;
                    const isTransitioning = transitionModel?.index === index;

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

                    return (
                        <div className="group" key={index} >
                            <div className="inner-media">
                                <motion.img
                                    className={`media ${centerIndex === index ? 'active' : ''}`}
                                    src={src}
                                    alt={`Album ${index}`}
                                    onClick={(e) => handleImageClick(e, index)}
                                    style={{
                                        // On cache l'original dès qu'on clique
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
            {transitionModel && (
                <motion.img
                    src={transitionModel.src}
                    // Le layoutId magique
                    layoutId={`album-cover-${transitionModel.index}`}

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
            )}
        </section>
    );
}

export default CircularScrollWheel;
